import { FastifyPluginCallback } from 'fastify';

const plugin: FastifyPluginCallback = (fastify, _options, next): void => {
    fastify.get("/api/geoip/csv", async (_request, reply) => {
        const geoLocFeed = '2001:67c:2724::/48,DE,,,\n2a0e:8f02:f01f::/48,DE,,,\n2a12:4946:9900::/40,DE,,,\n88.218.40.0/24,DE,,,';
        await reply.send(geoLocFeed);
    });

    fastify.get('/api/geoip/json', async (req, res) => {
        const geoLocFeed = [
            {
                prefix: '2001:67c:2724::/48',
                country: 'Germany',
                countryCode: 'DE',
                region: 'Berlin',
            },
            {
                prefix: '2a0e:8f02:f01f::/48',
                country: 'Germany',
                countryCode: 'DE',
                region: 'Berlin',
            },
            {
                prefix: '2a12:4946:9900::/40',
                country: 'Germany',
                countryCode: 'DE',
                region: 'Berlin',
            },
            {
                prefix: '88.218.40.0/24',
                country: 'Germany',
                countryCode: 'DE',
                region: 'Berlin',
            },
        ];

        await res.type('application/json').send(geoLocFeed);
    });

    next();
}

export default plugin;
