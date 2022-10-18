import { FastifyPluginCallback } from 'fastify';

const plugin: FastifyPluginCallback = function (fastify, opts, next): void {
    fastify.get("/api/geoip/csv", (request, reply): void => {
        let geoLocFeed = '2001:67c:2724::/48,FI,,,\n2a0e:8f02:f01f::/48,FI,,,\n2a12:4946:9900::/40,FI,,,\n88.218.40.0/24,FI,,,';
        reply.send(geoLocFeed);
    });

    fastify.get('/api/geoip/json', (request, reply): void => {
        let geoLocFeed = [
            {
                prefix: '2001:67c:2724::/48',
                country: 'Finland',
                countryCode: 'FI',
                region: 'Uusimaa',
            },
            {
                prefix: '2a0e:8f02:f01f::/48',
                country: 'Finland',
                countryCode: 'FI',
                region: 'Uusimaa',
            },
            {
                prefix: '2a12:4946:9900::/40',
                country: 'Finland',
                countryCode: 'FI',
                region: 'Uusimaa',
            },
            {
                prefix: '88.218.40.0/24',
                country: 'Finland',
                countryCode: 'FI',
                region: 'Uusimaa',
            },
        ];
        reply.type('application/json').send(geoLocFeed);
    });

    next();
}

export default plugin;
