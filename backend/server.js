import fs   from 'node:fs';
import mime from 'mime/lite';
import express from 'express';

let app = express();

app.use(express.json());

const loadJSON = (path) => {
    return JSON.parse(fs.readFileSync(path, 'utf8'));
};

const saveJSON = (path, data) => {
    console.log(data.progress);
    console.log(JSON.stringify(data.progress, null, 4));
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

const authenticate = (auth) => {
    try {
        return loadJSON(getUserFileName(auth.username)).auth.password === auth.password;
    } catch(err) {
        return false;
    }
}

const loadUser = (username) => {
    try {
        const source = loadJSON(getUserFileName(username));
        return new User(source.auth, source.progress);
    } catch(err) {
        return null;
    }
}

const respondWithJSON = (response, statusCode, message) => {
    response.statusCode = statusCode;
    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify(message));
};

const serveFile = (response, path) => {

    console.log(`file served: [${path}]`);

    let mimeType = undefined;
    let data = undefined;
    try {
        mimeType = mime.getType(path);
        data = fs.readFileSync(path, 'utf8');
    } catch (err) {}
    if(data === undefined) {
        response.statusCode = 404;
        response.setHeader('Content-Type', 'text/plain');
        response.end('404, file not found!');
        return;
    }

    response.statusCode = 200;
    response.setHeader('Content-Type', mimeType);
    response.end(data);
};

const createUser = (auth) => {
    if(userExists(auth.username)) {
        return false;
    }
    
    const user = new User(auth, []);
    user.save();
    return true;
};

const authenticateMiddleware = (request, response, next) => {
    if(!authenticate(request.body.auth)) {
        respondWithJSON(response, 403, {success: false});
        return;
    }
    next()
};

app.get('/data/:path', (request, response) => {
    serveFile(response, 'backend/data/' + request.params.path);
});

app.get('/', (request, response) => {
    serveFile(response, 'frontend/index.html');
});

app.get('/:path', (request, response) => {
    serveFile(response, 'frontend/' + request.params.path);
});

app.post('/api/createuser', (request, response) => {
    const body = request.body;
    const success = createUser(body.auth);
    respondWithJSON(response, success?201:409, {success: success});
});

app.post('/api/submitanswers', authenticateMiddleware, (request, response) => {
    const body = request.body;
    let user = loadUser(body.auth.username);
    const answers = body.answers;
    const subject = body.subject;
    const subjectAnswers = loadJSON('backend/data/subjects/' + subject + '/answers.json');
    let answersMap = new Map();
    subjectAnswers.forEach((item, index, array) => {
        answersMap.set(item.questionId, item.answer);
    });

    const isCorrect = item => answersMap.get(item.questionId)==item.answer;

    const result = answers.map(isCorrect);

    if(!(user.progress.includes(subject))) {
        user.progress[subject] = []
    }

    const toAdd = answers.filter(isCorrect).filter(item => !(user.progress[subject].includes(item.questionId))).map(item => item.questionId);
    
    user.progress[subject].push(toAdd);
    user.save();
    respondWithJSON(response, 200, result);
});

const PORT = 5500;
app.listen(PORT);

console.log(`Server running at http://localhost:${PORT}/`);