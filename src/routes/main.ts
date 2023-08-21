import { existsSync } from 'fs';

import { FastifyPluginCallback } from 'fastify';

import { BASE_CONTENT_DIR, SITE_NAME, DOMAINS_ADVERTISED, MATRIX_SUBDOMAIN, MATRIX_HOMESERVER_PORT } from '../environment';
import { pathToParse, generatePageMenu, generateWikiMenu, generateList } from '../utils/markdownUtil';

const plugin: FastifyPluginCallback = function (fastify, opts, next): void {

    fastify.get("/", async (request, reply) => {

        const content = await pathToParse(BASE_CONTENT_DIR + "/_index.md", true, request.hostname);
        const pagesMenu = generatePageMenu(request.hostname);
        const wikiMenu = generateWikiMenu(request.hostname);

        await reply.view('/templates/index.ejs', { 
            content,
            sitename: SITE_NAME,
            pagesMenu,
            wikiMenu,
            domains: DOMAINS_ADVERTISED,
        });
    });

    fastify.get("/*", async (request, reply) => {
        const requestUri = request.url;

        // Generate menus
        const pagesMenu = generatePageMenu(request.hostname);
        const wikiMenu = generateWikiMenu(request.hostname);

        const isRoot = requestUri.slice(-1) == "/" && existsSync(BASE_CONTENT_DIR + requestUri);

        const list = isRoot
            ? generateList(BASE_CONTENT_DIR + requestUri, request.hostname)
            : null;

        const fileGet = isRoot
            ? BASE_CONTENT_DIR + requestUri + "_index.md"
            : BASE_CONTENT_DIR + requestUri + ".md";

        const content = await pathToParse(fileGet);

        await reply.view("/templates/index.ejs", {
            content,
            sitename: SITE_NAME,
            pagesMenu,
            wikiMenu,
            list,
            domains: DOMAINS_ADVERTISED,
        });
    });

    // Matrix config
    fastify.get("/.well-known/matrix/server", async (request, reply) => {
        const matrixDir = MATRIX_SUBDOMAIN ?
            `${MATRIX_SUBDOMAIN}.${request.hostname}:${MATRIX_HOMESERVER_PORT}` :
            `${request.hostname}:${MATRIX_HOMESERVER_PORT}`;

        await reply.send({
            "m.server": matrixDir,
        });
    });

    // Matrix client
    fastify.get('/.well-known/matrix/client', async (request, reply) => {
        const matrixDir = MATRIX_SUBDOMAIN ?
            `https://${MATRIX_SUBDOMAIN}.${request.hostname}` :
            `https://${request.hostname}`;

        await reply.send({
            "m.homeserver": {
                "base_url": matrixDir,
            },
            "m.identity_server": {
                "base_url": matrixDir,
            },
            "org.matrix.msc3575.proxy": {
                "url": matrixDir,
            }
        });
    });

    next();
}

export default plugin;
