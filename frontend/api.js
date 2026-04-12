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
    verify = () => {
        return fetch('/api/vaildateauthentication', {
            method: 'POST',
            body: JSON.stringify({auth: this}),
            headers: {
                "Content-Type": "application/json",
            }
        }).then((response) => response.ok).catch(() => false);
    };
};


class API {
    static sendRequest = async (endpoint, data) => {
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                body: JSON.stringify({auth: Auth.load(), ...data}),
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
    static login = (username, password) => {
        const auth = new Auth(username, password);
        if(!auth.verify()) return false;
        auth.save();
        return true;
    };
    
    // delete the current user's authentication details
    static logout = () => Auth.remove();
    
    // get current username and password, returns null if there is none
    static currentAuth = () => Auth.load();

    static loggedIn = () => !(this.currentAuth()===null);

    // returns an array of answered [questionId]s
    static getAnsweredQuestions = (auth, subject) => this.sendRequest('/api/answeredquestions', { subject: subject });

    // returns an array of booleans, true if the answer was correct for the corresponding question
    static submitAnswers = (auth, subject, answers) => this.sendRequest('/api/submitanswers', { subject: subject, answers: answers });
};

document.addEventListener("DOMContentLoaded", async () => {
    console.log(API.login("testuser", "testpassword"));
    const res = await API.submitAnswers(Auth.load(), 'astronomy', {"planet-q4": 2, "atomic-q3": 3});
    console.log(res);
});
