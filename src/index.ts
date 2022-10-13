import fastify from 'fastify';
import autoLoad from '@fastify/autoload';
import fastifyView from '@fastify/view';
import fastifyStatic from '@fastify/static';

import { join } from 'path';

const server = fastify({
    logger: true,
});

server.register(autoLoad, {
    dir: join(__dirname, 'routes'),
});

server.register(fastifyView, {
    engine: {
        ejs: require("ejs"),
    }
});

server.register(fastifyStatic, {
    root: join(__dirname, '../public'),
    prefix: '/files/',
});

server.register(fastifyStatic, {
    root: join(__dirname, '../public/.well-known'),
    prefix: '/.well-known/',
    decorateReply: false,
});

server.listen({ port: 8080, host: "::" }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server is listening on ${address}`);
});
