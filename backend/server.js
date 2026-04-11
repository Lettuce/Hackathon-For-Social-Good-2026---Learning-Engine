const http = require('http');
const fs = require('node:fs');

const frontendFileRequestHandler = (response, path) => {

    console.log(`URL: [${path}]`);

    let data = null;
    try {
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
    response.setHeader('Content-Type', 'text/html');
    response.end(data);
};

const server = http.createServer((request, response) => {
    
    let path = request.url ?? '/';
    path = (path==='/')?'/index.html':path;
    

    if(path.startsWith('/data/')) {
        return frontendFileRequestHandler(response, 'backend' + path);
    }

    return frontendFileRequestHandler(response, 'frontend' + path);
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});