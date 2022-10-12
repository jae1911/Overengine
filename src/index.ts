import fastify from 'fastify';
import autoLoad from '@fastify/autoload';

import { join } from 'path';

const server = fastify({
    logger: true,
});

server.register(autoLoad, {
    dir: join(__dirname, 'routes'),
});

server.listen({ port: 8080, host: "::" }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server is listening on ${address}`);
});
