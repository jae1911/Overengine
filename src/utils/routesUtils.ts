import { FastifyInstance } from "fastify";

import {
  API_ENABLED,
  BLOGS_ENABLED,
  MATRIX_ENABLED,
  REDIRECTS_ENABLED,
} from "../environment";
import apiRoutes from "../routes/api";
import blogRoutes from "../routes/blog";
import mainRoutes from "../routes/main";
import matrixRoutes from "../routes/matrix";
import redirects from "../routes/redirects";

export const registerRoutes = (server: FastifyInstance): void => {
  void server.register(mainRoutes);

  if (BLOGS_ENABLED) void server.register(blogRoutes);
  if (REDIRECTS_ENABLED) void server.register(redirects);
  if (MATRIX_ENABLED) void server.register(matrixRoutes);
  if (API_ENABLED) void server.register(apiRoutes);
};
