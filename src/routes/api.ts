import { FastifyPluginCallback } from "fastify";

import { generateFeeds } from "../utils/feedUtils";

const apiRoutes: FastifyPluginCallback = (fastify, _options, next): void => {
  fastify.get("/api/geoip/csv", async (_request, reply) => {
    const geoLocFeed =
      "2001:67c:2724::/48,DE,,,\n2a0e:8f02:f01f::/48,DE,,,\n2a12:4946:9900::/40,DE,,,\n88.218.40.0/24,DE,,,";
    await reply.send(geoLocFeed);
  });

  fastify.get("/api/geoip/json", async (req, res) => {
    const geoLocFeed = [
      {
        prefix: "2001:67c:2724::/48",
        country: "Germany",
        countryCode: "DE",
        region: "Berlin",
      },
      {
        prefix: "2a0e:8f02:f01f::/48",
        country: "Germany",
        countryCode: "DE",
        region: "Berlin",
      },
      {
        prefix: "2a12:4946:9900::/40",
        country: "Germany",
        countryCode: "DE",
        region: "Berlin",
      },
      {
        prefix: "88.218.40.0/24",
        country: "Germany",
        countryCode: "DE",
        region: "Berlin",
      },
    ];

    await res.type("application/json").send(geoLocFeed);
  });

  fastify.get("/api/meta", async (_request, reply) => {
    const response = {
      contacts: {
        email: "jae@777.tf",
        activityPub: "@me@soc.jae.fi",
        matrix: "@jae:777.tf",
      },
      location: {
        system: "Solar System",
        planet: "Earth",
        continent: "Europe",
        country: "Finland",
        city: "Helsinki",
      },
      me: {
        name: "Jae",
        pronouns: "It/Its",
      },
    };

    await reply.type("application/json").send(response);
  });

  fastify.get("/api/blog/posts", async (request, reply) => {
    const feeds = generateFeeds(request.hostname);
    const generatedFeed = feeds.json1();

    await reply.type("application/json").send(generatedFeed);
  });

  next();
};

export default apiRoutes;
