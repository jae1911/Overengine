import { FastifyPluginCallback } from 'fastify';

import pathToParse from '../utils/markdownUtil';
import scourDirectory from '../utils/fileUtil';
import { BASE_CONTENT_DIR } from '../environment';

const plugin: FastifyPluginCallback = function (fastify, opts, next): void {
    fastify.get("/debug", (request, reply): void => {
        reply.send(scourDirectory(BASE_CONTENT_DIR));
    });


    next();
}

export default plugin;
