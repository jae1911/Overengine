import { FastifyPluginCallback, FastifyRequest } from "fastify";

import {
  matrixSchemeGenerator,
  elementSchemeGenerator,
} from "../utils/matrixUtils";

const redirects: FastifyPluginCallback = function (fastify, opts, next): void {
  fastify.get("/redir/tw", async (request, reply) => {
    await reply.redirect("https://futurice.com/tech-weeklies");
  });

  fastify.get("/redir/cv", async (request, reply) => {
    await reply.redirect("https://j4.lc");
  });

  fastify.get("/redir/metacode", async (request, reply) => {
    await reply.redirect("https://git.jae.fi/jae/overengine");
  });

  fastify.get("/redir/gh", async (request, reply) => {
    await reply.redirect("https://github.com/jae1911");
  });

  fastify.get("/redir/co", async (request, reply) => {
    await reply.redirect("/blog/2021/11/02/moving-forward/");
  });

  fastify.get("/redir/matrixcritic", async (request, reply) => {
    await reply.redirect("https://www.aminda.eu/matrix/");
  });

  fastify.get("/redir/friend1", async (request, reply) => {
    await reply.redirect("https://mikaela.eu");
  });

  fastify.get("/redir/ghactivity", async (request, reply) => {
    await reply.redirect(
      "https://github.com/issues?q=is%3Aopen+author%3Ajae1911+archived%3Afalse",
    );
  });

  fastify.get("/redir/srht", async (request, reply) => {
    await reply.redirect("https://sr.ht/~jae/");
  });

  fastify.get("/redir/yt", async (request, reply) => {
    await reply.redirect("https://youtube.com/@j4l");
  });

  fastify.get("/redir/tg", async (request, reply) => {
    await reply.redirect("https://jae1911.t.me");
  });

  fastify.get("/redir/oyl", async (request, reply) => {
    await reply.redirect("https://indieweb.org/own_your_links");
  });

  fastify.get("/wiki/misc/resonite", async (_req, res) => {
    await res.redirect("/wiki/resonite/");
  });

  // Matrix room joins
  fastify.get(
    "/redir/matrix/:roomid/:server",
    async (
      request: FastifyRequest<{
        readonly Params: {
          readonly roomid: string;
          readonly server: string;
        };
      }>,
      reply,
    ) => {
      const { roomid, server } = request.params;
      await reply.redirect(matrixSchemeGenerator(roomid, server));
    },
  );

  // Matrix user scheme
  fastify.get(
    "/redir/matrix/user/:id/:server",
    async (
      request: FastifyRequest<{
        readonly Params: {
          readonly id: string;
          readonly server: string;
        };
      }>,
      reply,
    ) => {
      const { id, server } = request.params;
      await reply.redirect(matrixSchemeGenerator(id, server, undefined, true));
    },
  );

  fastify.get(
    "/redir/matrix/:roomid/:server/element/:room",
    async (
      request: FastifyRequest<{
        readonly Params: {
          readonly roomid: string;
          readonly server: string;
          readonly room?: boolean;
        };
      }>,
      reply,
    ) => {
      const { roomid, server, room } = request.params;
      await reply.redirect(
        elementSchemeGenerator(roomid, server, room ?? false),
      );
    },
  );

  next();
};

export default redirects;
