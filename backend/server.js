import crypto  from 'node:crypto'
import fs      from 'node:fs';
import mime    from 'mime/lite';
import express from 'express';


const mapObject = (object, func) => Object.fromEntries(Object.entries(object).map(([k, v]) => [k, func(k, v)]));

const hash = (password, salt) => crypto.scryptSync(password, salt, 32);

const generateSaltedHash = (password) => {
    const salt = crypto.randomBytes(16).toString("hex");
    return {hash: hash(password, salt).toString("hex"), salt: salt};
};

const verifyPassword = (password, hashed) => hash(password, hashed.salt).toString("hex")===hashed.hash;

let app = express();

const loadJSON = (path) => {
    return JSON.parse(fs.readFileSync(path, 'utf8'));
};

const saveJSON = (path, data) => {
    fs.writeFileSync(path, JSON.stringify(data, null, 4), 'utf8');
};

const getUserFileName = (username) => {
    return 'backend/userdata/' + username + '.json';
}
const userExists = (username) => {
    return fs.existsSync(getUserFileName(username));
};

class User {
    constructor(auth, progress) {
        this.auth = auth;
        this.progress = progress;
    }
    save() {
        saveJSON(getUserFileName(this.auth.username), this);
    }
};

const authenticate = (providedAuth) => {
    try {
        const userAuth = loadJSON(getUserFileName(providedAuth.username)).auth;
        return verifyPassword(providedAuth.password, userAuth.password);
    } catch(err) {
        return false;
    }
};

const loadUser = (username) => {
    try {
        const source = loadJSON(getUserFileName(username));
        return new User(source.auth, source.progress);
    } catch(err) {
        return null;
    }
};

const respondWithJSON = (resp, statusCode, message) => {
    resp.statusCode = statusCode;
    resp.setHeader('Content-Type', 'application/json');
    resp.end(JSON.stringify(message));
};

const serveFile = (resp, path) => {
    path = decodeURIComponent(path);
    console.log(`file served: [${path}]`);

    let mimeType = undefined;
    let data = undefined;
    try {
        mimeType = mime.getType(path);
        data = fs.readFileSync(path, 'utf8');
    } catch (err) {}
    if(data === undefined) {
        resp.statusCode = 404;
        resp.setHeader('Content-Type', 'text/plain');
        resp.end('404, file not found!');
        return;
    }

    resp.statusCode = 200;
    resp.setHeader('Content-Type', mimeType);
    resp.end(data);
};

const createUser = (auth) => {
    if(userExists(auth.username)) {
        return false;
    }
    
    const user = new User({username: auth.username, password: generateSaltedHash(auth.password)}, {});
    user.save();
    return true;
};

const authenticateMiddleware = (req, resp, next) => {
    if(!authenticate(req.body.auth)) {
        respondWithJSON(resp, 403, {success: false});
        return;
    }
    next()
};

app.get(/\/data\/.*/, (req, resp) => serveFile(resp, 'backend' + req.path));

app.get('/', (req, resp) => serveFile(resp, 'frontend/index.html'));

app.get(/\/.*/, (req, resp) => serveFile(resp, 'frontend' + req.path));

app.post('/api/createuser', express.json(), (req, resp) => {
    const body = req.body;
    const success = createUser(body.auth);
    respondWithJSON(resp, success?201:409, {success: success});
});

// const debugMiddleware = (req, resp, next) => {
//     console.log(req.body);
//     next();
// };

app.post('/api/submitanswers', express.json(), authenticateMiddleware, (req, resp) => {
    const body = req.body;
    let user = loadUser(body.auth.username);
    const answers = body.answers;
    const subject = body.subject;
    const subjectAnswers = new Map(Object.entries(loadJSON('backend/data/subjects/' + subject + '/answers.json')));

    const isCorrect = (k, v) => (subjectAnswers.get(k)===v);

    const result = mapObject(answers, isCorrect);

    if(!(subject in user.progress)) {
        user.progress[subject] = [];
    }

    const toAdd = Object.entries(result).filter(([k, v]) => v).filter(([k, v]) => !(user.progress[subject].includes(k))).map(([k, v]) => k);
    
    user.progress[subject].push(...toAdd);
    user.save();
    respondWithJSON(resp, 200, result);
});

app.post('/api/answeredquestions', express.json(), authenticateMiddleware, (req, resp) => {
    const body = req.body;
    const subject = body.subject;
    let user = loadUser(body.auth.username);
    respondWithJSON(resp, 200, user.progress[subject]);
});

app.post('/api/vaildateauthentication', express.json(), authenticateMiddleware, (req, resp) => respondWithJSON(resp, 200, {success: true}));

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