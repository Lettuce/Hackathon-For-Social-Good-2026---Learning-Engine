import {RequestAuth} from './Auth.js';
import {Database} from './Database.js';
import {FileRouter} from './Router.js';
import {ServerAPI} from './ServerAPI.js';
import express from 'express';

let app = express();

FileRouter(
    app,
    [/\/data\/.*/, './backend'],
    ['/',          './frontend', (p) => 'index.html'],
    [/\/.*/,       './frontend']
);

class API extends ServerAPI {
    static #database = new Database({
        userDatabase: 'backend/userdata/',
        subjectDatabase: 'backend/data/subjects/'
    });
    constructor(ap) {
        super(ap);
        this.init();
    };
    
    createuser = async ({body: {auth}}) => {
        
        const requestAuth = new RequestAuth(auth);
        
        const user = await API.#database.createUser(requestAuth);
        if(!user) {
            return {status: 500, json: 'Failed to save user data.'};
        }
        return {status: 201, json: true};
    };

    submitanswers_middleware = [API.#database.getUser];
    submitanswers = async req => {
        const { answers={}, subject } = req.body;
        let user = req.user;
    
        const subjectAnswers = await API.#database.loadSubjectAnswers(subject);
    
        const isCorrect = ([questionId, answerIndex]) => (subjectAnswers[questionId]|0)===(answerIndex|0);
    
        const correctAnswers = Object.entries(answers).filter(isCorrect).map(([questionId, answerIndex]) => questionId);
    
        const progressMade = user.updateProgress(subject, correctAnswers);
        if(progressMade) {
            API.#database.saveUser(user);
        }
        return {status: 200, json: correctAnswers};
    };

    answeredquestions_middleware = [API.#database.getUser];
    answeredquestions = async ({body: {subject}, user: {progress}}) => {
        return {status: 200, json: progress[subject] ?? []};
    };

    vaildateauthentication_middleware = [API.#database.getUser];
    vaildateauthentication = req => ({status: 200, json: true});

    completedsubjects_middleware = [API.#database.getUser];
    completedsubjects = async req => {

        const compareAnswersToFile = ([subject, userAnswers]) => {
            const fileAnswers = API.#database.loadSubjectAnswers(subject)??{};
            const isCompleted = Object.keys(fileAnswers).every((fileAnswer) => userAnswers.includes(fileAnswer));
            return [subject, isCompleted];
        };
    
        const completion = await Promise.all(Object.entries(req.user.progress).map(compareAnswersToFile));
    
        const completedSubjects = completion.filter(([subject, completed]) => completed).map(([subject, completed])=>subject);
    
        return {status: 200, json: completedSubjects};
    };
}

let api = new API(app);
api.listen(5500);
