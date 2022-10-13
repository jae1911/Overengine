import { FastifyPluginCallback } from 'fastify';
import { Feed } from 'feed';

import scourDirectory from '../utils/fileUtil';
import { BASE_CONTENT_DIR, SITE_NAME } from '../environment';
import { pathToParse, generatePageMenu, generateWikiMenu, generateBlogList, blogFinder, generateFeeds } from '../utils/markdownUtil';

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

    // RSS Feed blog
    fastify.get("/blog/index.xml", (request, reply): void => {
        const feed = generateFeeds(request.hostname, request.protocol, true);
        reply.send(feed.rss2());
    });

    // JSON Feed blog
    fastify.get("/blog/index.json", (request, reply): void => {
        const feed = generateFeeds(request.hostname, request.protocol, true);
        reply.send(feed.json1());
    });

    next();
}

export default plugin;
