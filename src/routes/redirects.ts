import { FastifyPluginCallback } from 'fastify';

const plugin: FastifyPluginCallback = function (fastify, opts, next): void {
    fastify.get("/redir/tw", (request, reply): void => {
        reply.redirect('https://futurice.com/tech-weeklies');
    });

    fastify.get("/redir/cv", (request, reply): void => {
        reply.redirect('https://git.jae.fi/jae');
    });

    next();
}

export default plugin;
