class Auth {
    constructor(username, password) {
        this.username = username;
        this.password = password;
    }
    static load = () => {
        const retrieved = sessionStorage.getItem('user_auth');
        if(!retrieved) {
            return null;
        }
        const parsed = JSON.parse(retrieved);
        return new Auth(parsed.username, parsed.password);
    }
    save = () => {
        sessionStorage.setItem('user_auth', JSON.stringify(this));
    }
    static remove = () => {
        sessionStorage.removeItem('user_auth');
    }
};


class API {
    static sendRequest = async (endpoint, data, auth) => {
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                body: JSON.stringify(auth ? {auth: Auth.load(), ...data} : data),
                headers: {
                    "Content-Type": "application/json",
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
        const auth = new Auth(username, password);
        const result = await this.verifyAuth(auth);
        if((result==null) || (result==false) || (result==undefined)) return false;
        auth.save();
        return true;
    };
    
    // delete the current user's authentication details
    static logout = () => Auth.remove();
    
    // get current username and password, returns null if there is none
    static currentAuth = () => Auth.load();

    // check if the user is logged in (doesn't do validation)
    static loggedIn = () => !(this.currentAuth()===null);

    // returns true if the user's credentials are correct, false otherwise (btw it returns false even on errors, which is how it works)
    static verifyAuth = async (userAuth) => this.sendRequest('/api/vaildateauthentication', {auth: userAuth}, false) ?? false;

    // returns an array of answered questionIds
    static getAnsweredQuestions = async (subject) => this.sendRequest('/api/answeredquestions', { subject: subject }, true);

    // return the answers object, but with the answer indices replaced with if the answer was correct or not
    static submitAnswers = async (subject, answers) => this.sendRequest('/api/submitanswers', { subject: subject, answers: answers }, true);

    // returns true if the user's credentials are correct, false otherwise (even on errors)
    static createUser = async (username, password) => {
        const userAuth = new Auth(username, password);
        const result = await this.sendRequest('/api/createuser', {auth: userAuth}, false);
        if((result==null) || (result==false) || (result==undefined)) return false;
        const success = result.success;
        if(!success) return false;
        userAuth.save();
        return true;
    };
};

// document.addEventListener("DOMContentLoaded", async () => {
//     console.log(API.login("testuser", "testpassword"));
//     const res = await API.submitAnswers(Auth.load(), 'astronomy', {"planet-q4": 2, "atomic-q3": 3});
//     console.log(res);
// });
