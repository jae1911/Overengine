import { FastifyPluginCallback } from 'fastify';

import { pathToParse, generatePageMenu, generateWikiMenu, generateList } from '../utils/markdownUtil';
import { BASE_CONTENT_DIR, SITE_NAME } from '../environment';

const plugin: FastifyPluginCallback = function (fastify, opts, next): void {
    fastify.get("/", (request, reply): void => {
        reply.view('/templates/index.ejs', { 
            content: pathToParse(BASE_CONTENT_DIR + '/_index.md'),
            sitename: SITE_NAME,
            pagesMenu: generatePageMenu(request.hostname, request.protocol),
            wikiMenu: generateWikiMenu(request.hostname, request.protocol),
        });
    });

    fastify.get("/*", (request, reply): void => {
        const uri = request.url;
        let templateFile: string = "fullpage";
        let postList: string = '';

        let fileGet = BASE_CONTENT_DIR + uri;
        if (uri.slice(-1) == '/') {
            fileGet += '_index.md';
            templateFile = 'list';
            postList = generateList(BASE_CONTENT_DIR + uri, request.hostname, request.protocol);
        }
        else
            fileGet += '.md';

        reply.view(`/templates/${templateFile}.ejs`, { 
            content: pathToParse(fileGet),
            sitename: SITE_NAME,
            pagesMenu: generatePageMenu(request.hostname, request.protocol),
            wikiMenu: generateWikiMenu(request.hostname, request.protocol),
            list: postList,
        });
    });

    next();
}

export default plugin;
