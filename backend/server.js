import http from 'node:http';
import fs   from 'node:fs';
import mime from 'mime/lite';
// import express from 'express';

class User {
    // string, string, array
    constructor(username, password, badges) {
        this.username = username;
        this.password = password;
        this.badges = badges;
    }
    save() {
        const user = User(username, password, badges);
        const data = JSON.stringify(user, null, 4);
        fs.writeFileSync(username + '.json', data, 'utf8');
    }
    load() {
        // this = JSON.parse(fs.readFileSync(username + '.json', data, 'utf8'));
    }
}

const userExists = (username) => {
    return fs.existsSync("backend/userdata/" + username);
};

const createUser = (username, password) => {
    if(userExists(username)) {
        return null;
    }
    
    const user = User(username, password, badges);
    user.save();
    return user;
};

const api = (request, response) => {
    // if(request.method === "PUT" && request.path === '/api/createuser') {
    //     request.js
    // }
};

const serveFile = (response, path) => {

    console.log(`file served: [${path}]`);

    let mimeType = null;
    let data = null;
    try {
        mimeType = mime.getType(path);
        data = fs.readFileSync(path, 'utf8');
    } catch (err) {
        console.error(err);
    }
    if(data === null) {
        response.statusCode = 404;
        response.setHeader('Content-Type', 'text/plain');
        response.end("404, file not found!");
        return;
    }

    response.statusCode = 200;
    response.setHeader('Content-Type', mimeType);
    response.end(data);
};

const server = http.createServer((request, response) => {
    
    let path = request.url ?? '/';
    path = (path==='/')?'/index.html':path;
    let method = request.method ?? "GET";
    
    if(method === "PUT" || path.startsWith('/api/')) {
        return api(request, response);
    }

    if(path.startsWith('/data/')) {
        return serveFile(response, 'backend' + path);
    }

    return serveFile(response, 'frontend' + path);
});

const PORT = 5500;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});