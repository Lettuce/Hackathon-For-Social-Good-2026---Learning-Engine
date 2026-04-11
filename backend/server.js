import http from 'node:http';
import fs   from 'node:fs';
import mime from 'mime/lite';

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
    

    if(path.startsWith('/data/')) {
        return serveFile(response, 'backend' + path);
    }

    return serveFile(response, 'frontend' + path);
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});