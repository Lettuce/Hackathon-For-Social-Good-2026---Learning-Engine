import {StoredAuth} from './Auth.js';

export class User {
    username;
    auth;
    progress;
    constructor({username, auth, progress}) {
        this.username = username;
        this.auth = new StoredAuth(auth);
        this.progress = progress;
    };
    saveableData() {
        return {auth: this.auth, progress: this.progress};
    };
    static generate(requestAuth) {
        return new User({username: requestAuth.username, auth: StoredAuth.generate(requestAuth), progress: {}});
    };
    updateProgress(subject, solvedQuestionIds) {
        const oldProgressSize = solvedQuestionIds.length;
        if(oldProgressSize == 0) return 0;
        const newProgress = new Set(solvedQuestionIds);
        const progressSet = new Set(this.progress[subject]??[]);
        this.progress[subject] = [...progressSet.union(newProgress)];
        return this.progress[subject].length - oldProgressSize;
    };
};