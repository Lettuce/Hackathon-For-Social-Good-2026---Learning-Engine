import express from 'express';

export class ServerAPI {
    #app;
    constructor(ap) {
        this.#app = ap;
    };
    init() {
        const MIDDLEWARE_SUFFIX = '_middleware';
        for(const [endpointName, handler] of Object.entries(this)) {
            if(endpointName.endsWith(MIDDLEWARE_SUFFIX)) continue;
            this.#app.post(`/api/${endpointName}`, express.json(), ...(this[`${endpointName}${MIDDLEWARE_SUFFIX}`] ?? []), async (req, resp) => {
                try {
                    const {status, json} = await handler(req);
                    resp.status(status).json(json);
                } catch (err) {
                    resp.status(500).json('Internal server error!');
                }
            });
        }
    };
    listen(port) {
        this.#app.listen(port);
        console.log(`Server running at http://localhost:${port}/`);
    };
};