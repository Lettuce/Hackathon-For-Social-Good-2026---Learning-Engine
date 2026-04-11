import fs   from 'node:fs';
import mime from 'mime/lite';
import express from 'express';

let app = express();

app.use(express.json());

const loadJSON = (path) => {
    console.log(path);
    return JSON.parse(fs.readFileSync(path, 'utf8'));
};

const getUserFileName = (username) => {
    return 'backend/userdata/' + username + '.json';
}
const userExists = (username) => {
    return fs.existsSync(getUserFileName(username));
};

// class Auth {
//     constructor(username, password) {
//         this.username = username;
//         this.password = password;
//     }
//     authenticate(password) {
//         return (this.password === password);
//     }
// }

// class SubjectProgress {
//     constructor(subject, questions) {
//         this.subject = subject;
//         this.questions = questions;
//     }
// };

class User {
    constructor(auth, progress) {
        this.auth = auth;
        this.progress = progress;
    }
    save() {
        const data = JSON.stringify(this, null, 4);
        fs.writeFileSync(getUserFileName(this.auth.username), data, 'utf8');
    }
    authenticate(password) {
        return this.auth.password === password;
    }
};

const loadUser = (username) => {
    try {
        if(!userExists(username)) {
            return null;
        }
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

const authenticateUser = (auth) => {
    return loadUser(auth.username)?.authenticate(auth.password);
};

app.use('/data/:path', (request, response) => {
    serveFile(response, 'backend/data/' + request.params.path);
});

app.get('/', (request, response) => {
    serveFile(response, 'frontend/index.html');
});

app.post('/api/createuser', (request, response) => {
    const body = request.body;
    const success = createUser(body.auth);
    respondWithJSON(response, success?201:409, {success: success});
});

app.post('/api/submitanswers', (request, response) => {
    const body = request.body;
    const answers = body.answers;
    const subject = body.subject;
    const subjectAnswers = loadJSON('backend/data/subjects/' + subject + '/answers.json');
    let answersMap = new Map();
    subjectAnswers.forEach((item, index, array) => {
        answersMap.set(item.questionId, item.answer);
    });
    const result = answers.map(item => answersMap.get(item.questionId)==item.answer);
    let user = authenticateUser(body.auth);
    respondWithJSON(response, user?200:400, result);
});

app.use('/:path', (request, response) => {
    serveFile(response, 'frontend/' + request.params.path);
});

const PORT = 5500;
app.listen(PORT);

console.log(`Server running at http://localhost:${PORT}/`);