import { FastifyPluginCallback } from 'fastify';

import { BASE_CONTENT_DIR, SITE_NAME } from '../environment';
import { pathToParse, generatePageMenu, generateWikiMenu, generateBlogList, blogFinder, generateFeeds } from '../utils/markdownUtil';

const plugin: FastifyPluginCallback = function (fastify, opts, next): void {
    // Blog index
    fastify.get("/blog/", (request, reply): void => {
        reply.view('/templates/list.ejs', { 
            content: pathToParse(BASE_CONTENT_DIR + '/blog/_index.md'),
            sitename: SITE_NAME,
            pagesMenu: generatePageMenu(request.hostname),
            wikiMenu: generateWikiMenu(request.hostname),
            list: generateBlogList(request.hostname),
        });
    });

    // Blog posts
    fastify.get("/blog/:year/:month/:day/:title/", (request, reply): void => {
        const reqUri = request.url;
        reply.view('/templates/blog.ejs', {
            content: blogFinder(reqUri),
            sitename: SITE_NAME,
            pagesMenu: generatePageMenu(request.hostname),
            wikiMenu: generateWikiMenu(request.hostname),
        })
    });

    // RSS Feed blog
    fastify.get("/blog/index.xml", (request, reply): void => {
        const feed = generateFeeds(request.hostname, true);
        reply.type('application/rss+xml ').send(feed.rss2());
    });

    // JSON Feed blog
    fastify.get("/blog/index.json", (request, reply): void => {
        const feed = generateFeeds(request.hostname, true);
        reply.type('application/feed+json').send(feed.json1());
    });

    // ATOM Feed blog
    fastify.get("/blog/index.atom", (request, reply): void => {
        const feed = generateFeeds(request.hostname, true);
        reply.type('application/atom+xml').send(feed.atom1());
    });

    next();
}

export default plugin;
