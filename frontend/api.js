
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
            body: JSON.stringify({auth: this})
        })
        .then((response) => response.ok)
        .catch(() => false);
    };
};


class API {
    static login = (username, password) => {
        const auth = Auth(username, password);
        if(!auth.verify()) return false;
        auth.save();
        return true;
    };
    
    static logout = () => Auth.remove();
    
    static currentAuth = () => Auth.load();
};


