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
    filepath = path.normalize(decodeURIComponent(filepath));
    resp.sendFile(filepath, {root: '.'}, (err) => {
        console.log(`file served: [${filepath}]`);
        if(err) {
            resp.status(404).send('404, file not found.');
        }
    });
};

const getUserMiddleware = async (req, resp, next) => {
    try {
        const {username, password} = req.body.auth; 
        const userData = await loadUser(username);
        
        if((userData ?? null) === null) throw 'Failed to load user data.';

        const authenticated = verifyPassword(password, userData.auth.password);
        
        if(!authenticated) throw 'Failed to authenticate user.';
        req.userData = userData;

    } catch(err) {
        resp.status(403).json({error: err});
        return;
    }
    next()
};

app.get(/\/data\/.*/, (req, resp) => serveFile(resp, 'backend' + path.normalize(req.path)));

app.get('/', (req, resp) => serveFile(resp, 'frontend/index.html'));

app.get(/\/.*/, (req, resp) => serveFile(resp, 'frontend' + path.normalize(req.path)));

app.post('/api/createuser', express.json(), async (req, resp) => {
    const {body} = req;
    const {username, password} = body.auth;

    if(userExists(username)) {
        resp.status(409).json({success: false, error: 'User already exists.'});
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
    const { answers, subject, auth } = req.body;
    let {userData} = req;

    const subjectAnswers = await loadJSON('backend/data/subjects/' + subject + '/answers.json');

    const result = mapObject(answers, (k, v) => (subjectAnswers[k]===v));

    const toAdd = Object.entries(result).filter(([k, v]) => v).filter(([k, v]) => v && !((userData.progress[subject]??[]).includes(k))).map(([k, v]) => k);
    if(toAdd.length > 0) {
        if(!(subject in userData.progress)) {
            userData.progress[subject] = [];
        }
        userData.progress[subject].push(...toAdd);
        saveUser(userData);
    }
    resp.status(200).json(result);
});

app.post('/api/answeredquestions', express.json(), getUserMiddleware, async (req, resp) => {
    const { subject } = req.body;
    const progress = req.userData.progress[subject] ?? []
    resp.status(200).json(progress);
});

app.post('/api/vaildateauthentication', express.json(), getUserMiddleware, (req, resp) => resp.status(200).json({success: true}));

// app.post('/api/subjectcompletion', express.json(), authenticateMiddleware, (req, resp) => {
//     const body = req.body;
//     const user = loadUser(body.auth.username);
//     const subjects = loadJSON('backend/data/subjects.json').subject;
//     const isSubjectComplete = (subject) => {
//         const userAnswers = user.progress[subject];
//         console.log(userAnswers.length)
//         if(userAnswers === undefined) return false;
//         const subjectAnswers = loadJSON(`backend/data/subjects/${subject}/answers.json`);
//         const mapped = Object.entries(subjectAnswers).map((answer) => userAnswers.includes(answer));
//         console.log(mapped);
//         return mapped.every((i)=>i);
//     };
//     const result = Object.fromEntries(subjects.map((subject) => [subject, isSubjectComplete(subject)]));
//     respondWithJSON(resp, 200, result);
// });

const PORT = 5500;
app.listen(PORT);

console.log(`Server running at http://localhost:${PORT}/`);