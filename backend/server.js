import crypto  from 'node:crypto'
import fs      from 'node:fs';
import path    from 'node:path'
import express from 'express';

let app = express();

const mapObject = (object, func) => Object.fromEntries(Object.entries(object).map(([k, v]) => [k, func(k, v)]));
// const filterObject = (object, func) => Object.fromEntries(Object.entries(object).filter(([k, v]) => func(k, v)));

const hash = (password, salt) => crypto.scryptSync(password, salt, 32);

const generateSaltedHash = (password) => {
    const salt = crypto.randomBytes(16).toString("hex");
    return {hash: hash(password, salt).toString("hex"), salt: salt};
};

const verifyPassword = (password, hashed) => hash(password, hashed.salt).toString("hex")===hashed.hash;

const loadJSON = async (filepath) => {
    let filehandle;
    try {
        filehandle = await fs.promises.open(filepath, 'r');
        const data = await filehandle.readFile('utf8');
        return JSON.parse(data);
    } catch(err) {
        return null;
    } finally {
        await filehandle?.close();
    }
};

const saveJSON = async (filepath, data) => {
    let filehandle;
    try {
        filehandle = await fs.promises.open(filepath, 'w');
        await filehandle.writeFile(JSON.stringify(data, null, 4), 'utf8');
        return true;
    } catch(err) {
        return false;
    } finally {
        await filehandle?.close();
    }
};

const getUserFileName = (username) => 'backend/userdata/' + path.normalize(username) + '.json';

const userExists = (username) => fs.existsSync(getUserFileName(username));

const saveUser = async (userdata) => await saveJSON(getUserFileName(userdata.auth.username), userdata);

const loadUser = async (username) => await loadJSON(getUserFileName(username));

const serveFile = (resp, filepath) => {
    const normalizedFilepath = path.normalize(decodeURIComponent(filepath));
    resp.sendFile(normalizedFilepath, {root: '.'}, (err) => {
        console.log(`file served: [${normalizedFilepath}]`);
        if(err) {
            resp.status(404).send('File couldn\'t be sent.');
        }
    });
};

const getUserMiddleware = async (req, resp, next) => {
    try {
        const {auth: {username, password}} = req.body; 
        const userData = await loadUser(username);
        
        if((userData ?? null) === null) throw {error: 'Failed to load user data.'};

        const authenticated = verifyPassword(password, userData.auth.password);
        
        if(!authenticated) throw {error: 'Failed to authenticate user.'};
        req.userData = userData;

    } catch(err) {
        resp.status(403).json(err);
        return;
    }
    next()
};

const routeDirectories = (...routes) => {
    for(const [route, modifier = ((p)=>p)] of routes) {
        app.get(route, (req, resp) => serveFile(resp, modifier(path.normalize(req.path))));
    }
};

routeDirectories(
    [/\/data\/.*/, (p) => 'backend' + p],
    ['/',          (p) => 'frontend/index.html'],
    [/\/.*/,       (p) => 'frontend' + p]
);

app.post('/api/createuser', express.json(), async (req, resp) => {
    const { username, password } = req.body.auth;

    if(userExists(username)) {
        resp.status(409).json({success: false, error: `User with name [${username}] already exists.`});
        return;
    }
    
    const success = await saveUser({auth: {username: username, password: generateSaltedHash(password)}, progress: {}});
    if(!success) {
        resp.status(500).json({success: false, error: 'Failed to save user data.'});
        return;
    }
    
    resp.status(201).json({success: true, message: 'User account created successfully.'});
});

app.post('/api/submitanswers', express.json(), getUserMiddleware, async (req, resp) => {
    const { body: {answers, subject}, userData } = req;

    const subjectAnswers = await loadJSON('backend/data/subjects/' + subject + '/answers.json');

    const result = mapObject(answers, (k, v) => (subjectAnswers[k]===v));

    const toAdd = Object.entries(result).filter(([k, v]) => v && !((userData.progress[subject]??[]).includes(k))).map(([k, v]) => k);
    if(toAdd.length > 0) {
        let modifiedUserData = userData;
        if(!(subject in modifiedUserData.progress)) {
            modifiedUserData.progress[subject] = [];
        }
        modifiedUserData.progress[subject].push(...toAdd);
        saveUser(modifiedUserData);
    }
    resp.status(200).json(result);
});

app.post('/api/answeredquestions', express.json(), getUserMiddleware, async (req, resp) => {
    const { body: {subject}, userData: {progress} } = req;
    resp.status(200).json(progress[subject] ?? []);
});

app.post('/api/vaildateauthentication', express.json(), getUserMiddleware, (req, resp) => {
    resp.status(200).json({success: true, message: 'Credentials are valid.'})
});

app.post('/api/completedsubjects', express.json(), getUserMiddleware, async (req, resp) => {
    const {userData: {progress={}}} = req;

    const compareAnswersToFile = async ([subject, userAnswers]) => {
        const fileAnswers = Object.keys(await loadJSON(`backend/data/subjects/${subject}/answers.json`)??{});
        const isCompleted = fileAnswers.every((fileAnswer) => userAnswers.includes(fileAnswer));
        return [subject, isCompleted];
    };

    const completion = await Promise.all(Object.entries(progress).map(compareAnswersToFile));

    const completedSubjects = completion.filter(([subject, completed]) => completed).map(([subject, completed])=>subject);

    resp.status(200).json(completedSubjects);
});

const PORT = 5500;
app.listen(PORT);

console.log(`Server running at http://localhost:${PORT}/`);