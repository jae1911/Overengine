import { FastifyPluginCallback } from 'fastify';

import scourDirectory from '../utils/fileUtil';
import { BASE_CONTENT_DIR, SITE_NAME } from '../environment';
import { pathToParse, generatePageMenu, generateWikiMenu, generateBlogList, blogFinder } from '../utils/markdownUtil';

const plugin: FastifyPluginCallback = function (fastify, opts, next): void {
    // Blog index
    fastify.get("/blog/", (request, reply): void => {
        reply.view('/templates/list.ejs', { 
            content: pathToParse(BASE_CONTENT_DIR + '/blog/_index.md'),
            sitename: SITE_NAME,
            pagesMenu: generatePageMenu(request.hostname, request.protocol),
            wikiMenu: generateWikiMenu(request.hostname, request.protocol),
            list: generateBlogList(request.hostname, request.protocol),
        });
    });

    // Blog posts
    fastify.get("/blog/:year/:month/:day/:title/", (request, reply): void => {
        const reqUri = request.url;
        reply.view('/templates/blog.ejs', {
            content: blogFinder(reqUri),
            sitename: SITE_NAME,
            pagesMenu: generatePageMenu(request.hostname, request.protocol),
            wikiMenu: generateWikiMenu(request.hostname, request.protocol),
        })
    });

    next();
}

export default plugin;
