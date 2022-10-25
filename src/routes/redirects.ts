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
    
    fastify.get('/redir/gh', (request, reply) => {
        reply.redirect('https://github.com/jae1911');
    });

    fastify.get('/redir/co', (request, reply) => {
        reply.redirect('/blog/2021/11/02/moving-forward/');
    });

    fastify.get('/redir/matrixcritic', (request, reply) => {
        reply.redirect('https://www.aminda.eu/matrix/');
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
