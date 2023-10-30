import { FastifyPluginCallback } from "fastify";

import { MATRIX_HOMESERVER_PORT, MATRIX_SUBDOMAIN } from "../environment";

const matrixRoutes: FastifyPluginCallback = (fastify, _options, next): void => {
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

export default matrixRoutes;
