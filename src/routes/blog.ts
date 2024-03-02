import { FastifyPluginCallback, FastifyRequest } from "fastify";
import moment from "moment";

import {
  BASE_CONTENT_DIR,
  SITE_NAME,
  DOMAINS_ADVERTISED,
  SITE_TAGLINE,
} from "../environment";
import { blogFinder } from "../utils/blogUtils";
import { generateFeeds } from "../utils/feedUtils";
import { getLatestGitHash } from "../utils/fileUtil";
import {
  generatePageMenu,
  generateWikiMenu,
  generateBlogList,
  generateBlogListTagged,
} from "../utils/listUtils";
import { pathToParse } from "../utils/markdownUtil";

const blogRoutes: FastifyPluginCallback = function (fastify, opts, next): void {
  // Blog index
  fastify.get("/blog/", async (request, reply) => {
    const content = pathToParse(BASE_CONTENT_DIR + "/blog/_index.md");
    const pagesMenu = generatePageMenu(request.hostname);
    const wikiMenu = generateWikiMenu(request.hostname);
    const list = generateBlogList(request.hostname);

    await reply.view("/templates/index.ejs", {
      content,
      sitename: SITE_NAME,
      pagesMenu,
      wikiMenu,
      list,
      domains: DOMAINS_ADVERTISED,
      sitetagline: SITE_TAGLINE,
      contentVersion: getLatestGitHash(),
    });
  });

  // Blog tag
  fastify.get(
    "/blog/tag/:tag/",
    async (
      request: FastifyRequest<{
        readonly Params: {
          readonly tag: string;
        };
      }>,
      reply,
    ) => {
      const { tag } = request.params;

      const content = pathToParse(BASE_CONTENT_DIR + "/blog/_index.tags.md");
      const pagesMenu = generatePageMenu(request.hostname);
      const wikiMenu = generateWikiMenu(request.hostname);
      const list = generateBlogListTagged(request.hostname, tag);

      await reply.view("/templates/index.ejs", {
        content,
        sitename: SITE_NAME,
        pagesMenu,
        wikiMenu,
        list,
        domains: DOMAINS_ADVERTISED,
        sitetagline: SITE_TAGLINE,
        contentVersion: getLatestGitHash(),
      });
    },
  );

  // Blog posts
  fastify.get("/blog/:year/:month/:day/:title/", async (request, reply) => {
    const reqUri = request.url;

    const content = blogFinder(reqUri);
    const pagesMenu = generatePageMenu(request.hostname);
    const wikiMenu = generateWikiMenu(request.hostname);

    await reply.view("/templates/blog.ejs", {
      content,
      sitename: SITE_NAME,
      pagesMenu,
      wikiMenu,
      moment: moment,
      domains: DOMAINS_ADVERTISED,
      sitetagline: SITE_TAGLINE,
      contentVersion: getLatestGitHash(),
    });
  });

  // RSS Feed blog
  fastify.get("/blog/index.xml", async (request, reply) => {
    const feed = generateFeeds(request.hostname);

    await reply.type("application/rss+xml ").send(feed.rss2());
  });

  // JSON Feed blog
  fastify.get("/blog/index.json", async (request, reply) => {
    const feed = generateFeeds(request.hostname);

    const generatedFeed = feed.json1();

    await reply.type("application/feed+json").send(generatedFeed);
  });

  // ATOM Feed blog
  fastify.get("/blog/index.atom", async (request, reply) => {
    const feed = generateFeeds(request.hostname);

    const generatedFeed = feed.atom1();

    await reply.type("application/atom+xml").send(generatedFeed);
  });

  next();
};

export default blogRoutes;
