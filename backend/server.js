import * as Auth     from './Auth.js';
import * as Database from './Database.js';
import * as Router   from './Router.js';
import path          from 'node:path';
import express       from 'express';

let app = express();

Router.routeDirectories(app)(
    [/\/data\/.*/, './backend'],
    ['/',          './frontend', (p) => 'index.html'],
    [/\/.*/,       './frontend']
);

app.post('/api/createuser', express.json(), async (req, resp) => {
    const { username, password } = req.body.auth;

    if(userExists(username)) {
        return resp.status(409).json({error: `User with name [${username}] already exists.`});
    }
    
    const success = await saveUser({auth: {username: username, password: Auth.generateSaltedHash(password)}, progress: {}});
    if(!success) {
        return resp.status(500).json({error: 'Failed to save user data.'});
    }
    
    resp.status(201).json(true);
});

app.post('/api/submitanswers', express.json(), Database.getUserMiddleware, async (req, resp) => {
    const { body: {answers={}, subject}, userData } = req;

    const subjectAnswers = await Database.loadJSON('backend/data/subjects/' + path.normalize(subject) + '/answers.json');

    const isCorrect = ([questionId, answerIndex]) => (subjectAnswers[questionId]|0)===(answerIndex|0);

    const correctAnswers = Object.entries(answers).filter(isCorrect).map(([questionId, answerIndex]) => questionId);

    const userAlreadyCompletedQuestion = (questionId) => !((userData.progress[subject]??[]).includes(questionId));

    const newlyCorrectAnswers = correctAnswers.filter(userAlreadyCompletedQuestion);
    if(newlyCorrectAnswers.length > 0) {
        let modifiedUserData = userData;
        if(!(subject in modifiedUserData.progress)) {
            modifiedUserData.progress[subject] = [];
        }
        modifiedUserData.progress[subject].push(...newlyCorrectAnswers);
        Database.saveUser(modifiedUserData);
    }
    resp.status(200).json(correctAnswers);
});

app.post('/api/answeredquestions', express.json(), Database.getUserMiddleware, async (req, resp) => {
    const { body: {subject}, userData: {progress} } = req;
    resp.status(200).json(progress[subject] ?? []);
});

app.post('/api/vaildateauthentication', express.json(), Database.getUserMiddleware, (req, resp) => {
    resp.status(200).json(true);
});

app.post('/api/completedsubjects', express.json(), Database.getUserMiddleware, async (req, resp) => {
    const { userData: {progress={}} } = req;

    const compareAnswersToFile = async ([subject, userAnswers]) => {
        const fileAnswers = await loadJSON(`backend/data/subjects/${subject}/answers.json`)??{};
        const isCompleted = Object.keys(fileAnswers).every((fileAnswer) => userAnswers.includes(fileAnswer));
        return [subject, isCompleted];
    };

    const completion = await Promise.all(Object.entries(progress).map(compareAnswersToFile));

    const completedSubjects = completion.filter(([subject, completed]) => completed).map(([subject, completed])=>subject);

    resp.status(200).json(completedSubjects);
});

const PORT = 5500;
app.listen(PORT);

console.log(`Server running at http://localhost:${PORT}/`);