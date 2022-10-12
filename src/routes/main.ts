import { FastifyPluginCallback } from 'fastify';

import pathToParse from '../utils/markdownUtil';
import { BASE_CONTENT_DIR } from '../environment';

const plugin: FastifyPluginCallback = function (fastify, opts, next): void {
    fastify.get("/", (request, reply): void => {
        reply.type('text/html').send(pathToParse(BASE_CONTENT_DIR + '/index.md'));
    });

    next();
}

export default plugin;
