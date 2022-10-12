import { FastifyPluginCallback } from 'fastify';

import pathToParse from '../utils/markdownUtil';
import { BASE_CONTENT_DIR } from '../environment';

const plugin: FastifyPluginCallback = function (fastify, opts, next): void {
    fastify.get("/", (request, reply): void => {
        reply.type('text/html').send(pathToParse(BASE_CONTENT_DIR + '/index.md'));
    });

    fastify.get("/*", (request, reply): void => {
        const uri = request.url;
        
        let fileGet = BASE_CONTENT_DIR + uri;
        if (uri.slice(-1) == '/')
            fileGet += 'index.md';
        else
            fileGet += '.md';

        reply.type('text/html').send(pathToParse(fileGet));
    });

    next();
}

export default plugin;
