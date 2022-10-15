import { FastifyPluginCallback } from 'fastify';

import { pathToParse, generateListFromFile, listToMarkdown } from '../utils/markdownUtil';
import scourDirectory from '../utils/fileUtil';
import { BASE_CONTENT_DIR } from '../environment';

const plugin: FastifyPluginCallback = function (fastify, opts, next): void {
    fastify.get("/debug", (request, reply): void => {
        reply.send(listToMarkdown(BASE_CONTENT_DIR + '/pages', request.hostname, false, true, false));
    });

    next();
}

export default plugin;
