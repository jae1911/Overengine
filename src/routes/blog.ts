import { FastifyPluginCallback } from 'fastify';

import scourDirectory from '../utils/fileUtil';
import pathToParse from '../utils/markdownUtil';
import { BASE_CONTENT_DIR } from '../environment';

const plugin: FastifyPluginCallback = function (fastify, opts, next): void {
    // Blog index
    fastify.get("/blog", (request, reply): void => {
        reply.type('text/html').send(pathToParse(BASE_CONTENT_DIR + '/blog/index.md'));
    });

    // Blog posts
    fastify.get("/blog/:year/:month/:day/:title", (request, reply): void => {
        console.log(request.params);
        reply.send("trolled");
    });

    next();
}

export default plugin;
