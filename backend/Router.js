
const serveFile = (resp, rootpath, filepath) => {
    // console.log(`serving file: [${filepath}]`);

    const onError = () => resp.status(404).json('File couldn\'t be sent.');

    if(!filepath) return onError();

    resp.sendFile(filepath, {root: rootpath}, (err) => err ? onError() : undefined);
};

export const routeDirectories = (app) => (...routes) => {
    for(const [route, rootpath, modifier = ((p)=>p)] of routes) {
        app.get(route, (req, resp) => serveFile(resp, rootpath, modifier(decodeURIComponent(req.path))));
    }
};