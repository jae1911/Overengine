import { FastifyPluginCallback } from 'fastify';

const plugin: FastifyPluginCallback = function (fastify, opts, next): void {
    fastify.get("/redir/tw", (request, reply): void => {
        reply.redirect('https://futurice.com/tech-weeklies');
    });

    fastify.get("/redir/cv", (request, reply): void => {
        reply.redirect('https://git.jae.fi/jae');
    });
    
    fastify.get('/redir/gh', (request, reply) => {
        reply.redirect('https://github.com/jae1911');
    });

    fastify.get('/redir/co', (request, reply) => {
        reply.redirect('/blog/2021/11/02/moving-forward/');
    });

    fastify.get('/redir/matrixcritic', (request, reply) => {
        reply.redirect('https://www.aminda.eu/blog/english/2021/08/03/matrix-perfect-privacy-not.html');
    });

    // Matrix room joins
    fastify.get('/redir/matrix/home/jae.fi', (request, reply) => {
        reply.redirect('matrix:r/home%3Ajae.fi?action=join&via=jae.fi');
    });

    fastify.get('/redir/matrix/home/jae.fi/element', (request, reply) => {
        reply.redirect('element://vector/webapp/#/room/%23home%3Ajae.fi?via=jae.fi');
    });

    next();
}

export default plugin;
