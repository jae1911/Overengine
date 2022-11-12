import { join } from 'path';

import autoLoad from '@fastify/autoload';
import fastifyStatic from '@fastify/static';
import fastifyView from '@fastify/view';
import fastify from 'fastify';
import fastifyHealthcheck from 'fastify-healthcheck';


import { PRODUCTION, HOST } from './environment';

const server = fastify({
    logger: !PRODUCTION,
});

void server.register(autoLoad, {
    dir: join(__dirname, 'routes'),
});

void server.register(fastifyView, {
    engine: {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        ejs: require("ejs"),
    }
});

void server.register(fastifyStatic, {
    root: join(__dirname, '../public'),
    prefix: '/files/',
});

void server.register(fastifyStatic, {
    root: join(__dirname, '../public/.well-known'),
    prefix: '/.well-known/',
    decorateReply: false,
});

void server.register(fastifyHealthcheck);

server.listen({ port: 8080, host: HOST }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server is listening on ${address}`);
});
