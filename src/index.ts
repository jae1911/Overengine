import { join } from "path";

import fastifyStatic from "@fastify/static";
import fastifyView from "@fastify/view";
import ejs from "ejs";
import fastify from "fastify";
import fastifyGracefulShutdown from "fastify-graceful-shutdown";
import fastifyHealthcheck from "fastify-healthcheck";

import { PRODUCTION, HOST } from "./environment";
import { registerRoutes } from "./utils/routesUtils";

export const server = fastify({
  logger: {
    level: PRODUCTION ? "fatal" : "debug",
  },
});

void server.register(fastifyGracefulShutdown);

registerRoutes(server);

void server.register(fastifyView, {
  engine: {
    ejs: ejs,
  },
});

void server.register(fastifyStatic, {
  root: join(__dirname, "../public"),
  prefix: "/files/",
});

void server.register(fastifyStatic, {
  root: join(__dirname, "../public/.well-known"),
  prefix: "/.well-known/",
  decorateReply: false,
});

void server.register(fastifyHealthcheck);

server.listen({ port: 8080, host: HOST }, (err, address) => {
  if (err) {
    server.log.fatal(err);
    process.exit(1);
  }
  server.log.info(`Server is listening on ${address}`);
});

server.after(() => {
  server.gracefulShutdown((_signal, next) => {
    server.log.info("Shutting down");
    next();
  });
});
