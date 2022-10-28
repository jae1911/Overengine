import { FastifyPluginCallback } from 'fastify';
import { existsSync } from 'fs';

import { pathToParse, generatePageMenu, generateWikiMenu, generateList } from '../utils/markdownUtil';
import { BASE_CONTENT_DIR, SITE_NAME } from '../environment';

const plugin: FastifyPluginCallback = function (fastify, opts, next): void {
    fastify.get("/", async (request, reply) => {
        await reply.view('/templates/index.ejs', { 
            content: await pathToParse(BASE_CONTENT_DIR + '/_index.md', true, request.hostname),
            sitename: SITE_NAME,
            pagesMenu: generatePageMenu(request.hostname),
            wikiMenu: generateWikiMenu(request.hostname),
        });
    });

    fastify.get("/*", async (request, reply) => {
        const uri = request.url;
        let postList: string = '';

        let fileGet = BASE_CONTENT_DIR + uri;
        if (uri.slice(-1) == '/' && existsSync(BASE_CONTENT_DIR + uri)) {
            fileGet += '_index.md';
            postList = generateList(BASE_CONTENT_DIR + uri, request.hostname);
        }
        else
            fileGet += '.md';

        await reply.view('/templates/index.ejs', { 
            content: await pathToParse(fileGet),
            sitename: SITE_NAME,
            pagesMenu: generatePageMenu(request.hostname),
            wikiMenu: generateWikiMenu(request.hostname),
            list: postList,
        });
    });

    // Matrix config
    fastify.get("/.well-known/matrix/server", (request, reply): void => {
        reply.send({
            "m.server": `${request.hostname}:443`,
        });
    });

    // Matrix client
    fastify.get('/.well-known/matrix/client', (request, reply) => {
        reply.send({
            "m.homeserver": {
                "base_url": `https://${request.hostname}`,
            },
            "m.identity_server": {
                "base_url": `https://${request.hostname}`,
            },
        });
    });

    next();
}

export default plugin;
