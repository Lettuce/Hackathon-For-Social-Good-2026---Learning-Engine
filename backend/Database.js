import {RequestAuth} from './Auth.js';
import {User} from './User.js';
import path from 'node:path';
import fs   from 'node:fs';

// requires that the handler is async
const safeFileHandling = async (filepath, flags, handler) => {
    let filehandle = undefined;
    try {
        filehandle = await fs.promises.open(filepath, flags);
        if(!filehandle) return null;
        return handler(filehandle);
    } catch(err) {
        return null;
    } finally {
        await filehandle?.close();
    }
};

// returns an object on success, otherwise null
const loadJSON = async (filepath) => await safeFileHandling(filepath, 'r', async (filehandle) => {
    return JSON.parse(await filehandle.readFile('utf8'));
});

// returns true on success, otherwise null
const saveJSON = async (filepath, data) => await safeFileHandling(filepath, 'w', async (filehandle) => {
    await filehandle.writeFile(JSON.stringify(data, null, 4), 'utf8');
    return true;
});

export class Database {
    #userDatabaseDirectory;
    #subjectDatabaseDirectory;
    constructor({userDatabaseDirectory, subjectDatabaseDirectory}) {
        this.#userDatabaseDirectory = userDatabaseDirectory;
        this.#subjectDatabaseDirectory = subjectDatabaseDirectory;
    };
    
    #getUserFileName(username) {
        return `${this.#userDatabaseDirectory}${path.normalize(username)}.json`;
    };

    async saveUser(user) {
        return await saveJSON(this.#getUserFileName(user.username), user.saveableData());
    };
    async loadUser({username}) {
        const loaded = await loadJSON(this.#getUserFileName(username));
        return (loaded!=null) ? new User({username, ...loaded}) : null;
    };
    userExists({username}) {
        return fs.existsSync(this.#getUserFileName(username));
    };
    async createUser(requestAuth) {
        if(this.userExists(requestAuth)) return null;
        const user = User.generate(requestAuth);
        return (await this.saveUser(user)) ? user : null;
    };
    async loadSubjectAnswers(subject) {
        return await loadJSON(`${this.#subjectDatabaseDirectory}${path.normalize(subject)}/answers.json`);
    };
    
    // middleware function for express.js, arrow function is required here instead of a method
    getUser = async(req, resp, next) => {
        const requestAuth = new RequestAuth(req.body.auth);
        
        const user = await this.loadUser(requestAuth);
        
        if(!user) {
            return resp.status(403).json({error: 'Failed to load user data.'});
        }
    
        const authenticated = user.auth.verify(requestAuth);
        
        if(!authenticated) {
            return resp.status(403).json({error: 'Failed to authenticate user.'});
        }
    
        req.user = user;
    
        next();
    };
};

// const userDatabaseDirectory = 'backend/userdata/';


// export default {Database, User, loadJSON, saveJSON};