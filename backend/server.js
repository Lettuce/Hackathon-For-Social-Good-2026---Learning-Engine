import {RequestAuth} from './Auth.js';
import {Database} from './Database.js';
import Router   from './Router.js';
import express  from 'express';

let app = express();

let database = new Database({
    userDatabaseDirectory: 'backend/userdata/',
    subjectDatabaseDirectory: 'backend/data/subjects/'
});

Router.routeDirectories(app)(
    [/\/data\/.*/, './backend'],
    ['/',          './frontend', (p) => 'index.html'],
    [/\/.*/,       './frontend']
);

app.post('/api/createuser', express.json(), async (req, resp) => {
    const auth = new RequestAuth(req.body.auth);

    const user = await database.createUser(auth);
    if(user == null) {
        return resp.status(500).json({error: 'Failed to save user data.'});
    }
    
    resp.status(201).json(true);
});

app.post('/api/submitanswers', express.json(), database.getUser, async (req, resp) => {
    const { answers={}, subject } = req.body;
    let user = req.user;

    const subjectAnswers = await database.loadSubjectAnswers(subject);

    const isCorrect = ([questionId, answerIndex]) => (subjectAnswers[questionId]|0)===(answerIndex|0);

    const correctAnswers = Object.entries(answers).filter(isCorrect).map(([questionId, answerIndex]) => questionId);

    const progressMade = user.updateProgress(subject, correctAnswers);
    if(progressMade) {
        database.saveUser(user);
    }
    resp.status(200).json(correctAnswers);
});

app.post('/api/answeredquestions', express.json(), database.getUser, async (req, resp) => {
    const { body: {subject}, user: {progress} } = req;
    resp.status(200).json(progress[subject] ?? []);
});

app.post('/api/vaildateauthentication', express.json(), database.getUser, (req, resp) => {
    resp.status(200).json(true);
});

app.post('/api/completedsubjects', express.json(), database.getUser, async (req, resp) => {

    const compareAnswersToFile = async ([subject, userAnswers]) => {
        const fileAnswers = database.loadSubjectAnswers(subject)??{};
        const isCompleted = Object.keys(fileAnswers).every((fileAnswer) => userAnswers.includes(fileAnswer));
        return [subject, isCompleted];
    };

    const completion = await Promise.all(Object.entries(req.user.progress).map(compareAnswersToFile));

    const completedSubjects = completion.filter(([subject, completed]) => completed).map(([subject, completed])=>subject);

    resp.status(200).json(completedSubjects);
});

const PORT = 5500;
app.listen(PORT);

console.log(`Server running at http://localhost:${PORT}/`);