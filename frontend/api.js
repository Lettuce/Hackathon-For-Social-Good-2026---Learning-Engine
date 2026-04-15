class Auth {
    constructor(username, password) {
        this.username = username;
        this.password = password;
    }
    static load = () => {
        const retrieved = sessionStorage.getItem('user_auth');
        if(!retrieved) return null;
        const {username, password} = JSON.parse(retrieved);
        return new Auth(username, password);
    }
    save = () => sessionStorage.setItem('user_auth', JSON.stringify(this));
    static remove = () => sessionStorage.removeItem('user_auth');
};


class API {
    static sendRequest = async (endpoint, data, auth=false) => {
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                body: JSON.stringify(auth ? {auth: Auth.load(), ...data} : data),
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch {
            return null;
        }
    };
    
    // set current user's authentication details
    static login = async (username, password) => {
        const userAuth = new Auth(username, password);
        if(!await this.verifyAuth(userAuth)) return false;
        userAuth.save();
        return true;
    };
    
    // delete the current user's authentication details
    static logout = () => Auth.remove();
    
    // get current username and password, returns null if there is none
    static currentAuth = () => Auth.load();

    // check if the user is logged in (doesn't do validation)
    static loggedIn = () => !(this.currentAuth()===null);

    // returns true if the user's credentials are correct, false otherwise (btw it returns false even on errors, which is how it works)
    static verifyAuth = async (userAuth) => this.sendRequest('/api/vaildateauthentication', {auth: userAuth}) ?? false;

    // returns an array of answered questionIds
    static getAnsweredQuestions = async (subject) => this.sendRequest('/api/answeredquestions', { subject: subject }, true);

    // returns an array of the questionIds that were correct
    static submitAnswers = async (subject, answers) => this.sendRequest('/api/submitanswers', { subject: subject, answers: answers }, true);

    // returns true if the user's credentials are correct, false otherwise (even on errors)
    static createUser = async (username, password) => {
        const userAuth = new Auth(username, password);
        const success = (await this.sendRequest('/api/createuser', {auth: userAuth}, false))?.success ?? false;
        if(!success) return false;
        userAuth.save();
        return true;
    };

    // returns an array of completed subjects
    static getCompletedSubjects = async () => this.sendRequest('/api/completedsubjects', {}, true);
};
