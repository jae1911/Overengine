import { FastifyPluginCallback } from 'fastify';

import scourDirectory from '../utils/fileUtil';
import pathToParse from '../utils/markdownUtil';
import { BASE_CONTENT_DIR } from '../environment';

const plugin: FastifyPluginCallback = function (fastify, opts, next): void {
    // Blog index
    fastify.get("/blog", (request, reply): void => {
        reply.type('text/html').send(pathToParse(BASE_CONTENT_DIR + '/blog/index.md'));
    });

    next();
}

export default plugin;
