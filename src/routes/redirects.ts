import { FastifyPluginCallback, FastifyRequest } from 'fastify';
import MatrixUtils from '../utils/matrixUtils';

const matrixUtil = new MatrixUtils();

const plugin: FastifyPluginCallback = function (fastify, opts, next): void {
    fastify.get("/redir/tw", (request, reply): void => {
        reply.redirect('https://futurice.com/tech-weeklies');
    });

    fastify.get("/redir/cv", (request, reply): void => {
        reply.redirect('https://git.jae.fi/jae');
    });

    fastify.get('/redir/metacode', (request, reply) => {
        reply.redirect('https://git.jae.fi/jae/overengine');
    });

    fastify.get('/redir/gh', (request, reply) => {
        reply.redirect('https://github.com/jae1911');
    });

    fastify.get('/redir/co', (request, reply) => {
        reply.redirect('/blog/2021/11/02/moving-forward/');
    });

    fastify.get('/redir/matrixcritic', (request, reply) => {
        reply.redirect('https://www.aminda.eu/matrix/');
    });

    fastify.get('/redir/friend1', (request, reply) => {
        reply.redirect('https://mikaela.eu');
    });

    fastify.get('/redir/ghactivity', (request, reply) => {
        reply.redirect('https://github.com/issues?q=is%3Aopen+author%3Ajae1911+archived%3Afalse');
    });

    fastify.get('/redir/srht', (request, reply) => {
        reply.redirect('https://sr.ht/~jae/');
    });

    fastify.get('/redir/yt', (request, reply) => {
        reply.redirect('https://youtube.com/@j4l');
    });

    // Matrix room joins
    fastify.get('/redir/matrix/:roomid/:server', (request: FastifyRequest<{
        Params: {
            roomid: string,
            server: string,
        },
    }>, reply) => {
        const { roomid, server } = request.params;
        reply.redirect(matrixUtil.standardRedirector(roomid, server));
    });

    fastify.get('/redir/matrix/:roomid/:server/element', (request: FastifyRequest<{
        Params: {
            roomid: string,
            server: string,
        },
    }>, reply) => {
        const { roomid, server } = request.params;
        reply.redirect(matrixUtil.elementRedirector(roomid, server));
    });

    next();
}

export default plugin;
