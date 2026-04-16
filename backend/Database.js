import * as Auth from './Auth.js';
import path      from 'node:path';
import fs        from 'node:fs';

export const loadJSON = async (filepath) => {
    let filehandle = undefined;
    try {
        filehandle = await fs.promises.open(filepath, 'r');
        const data = await filehandle?.readFile('utf8');
        return JSON.parse(data) ?? null;
    } catch(err) {
        return null;
    } finally {
        await filehandle?.close();
    }
};

export const saveJSON = async (filepath, data) => {
    let filehandle = undefined;
    try {
        filehandle = await fs.promises.open(filepath, 'w');
        await filehandle?.writeFile(JSON.stringify(data, null, 4), 'utf8');
        return true;
    } catch(err) {
        return false;
    } finally {
        await filehandle?.close();
    }
};


const getUserFileName = (username) => 'backend/userdata/' + path.normalize(username) + '.json';

export const userExists = (username) => fs.existsSync(getUserFileName(username));

export const saveUser = async (userdata) => await saveJSON(getUserFileName(userdata.auth.username), userdata);

export const loadUser = async (username) => await loadJSON(getUserFileName(username));

export const getUserMiddleware = async (req, resp, next) => {
    const { username, password } = req.body.auth;
    
    const userData = await loadUser(username);
    
    if(!userData) {
        return resp.status(403).json({error: 'Failed to load user data.'});
    }

    const authenticated = Auth.verifyPassword(password, userData.auth.password);
    
    if(!authenticated) {
        return resp.status(403).json({error: 'Failed to authenticate user.'});
    }

    req.userData = userData;

    next();
};