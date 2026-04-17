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
        if(solvedQuestionIds.length == 0) return 0;
        const currentProgress = this.progress[subject] ?? [];
        const oldProgressSize = currentProgress.length;
        const newProgress = new Set(solvedQuestionIds);
        const progressSet = new Set(currentProgress);
        this.progress[subject] = [...progressSet.union(newProgress)];
        return this.progress[subject].length - oldProgressSize;
    };
};