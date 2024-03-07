import { join } from "path";
import { env } from "process";

import dotenv from "dotenv";

dotenv.config();

export const BASE_CONTENT_DIR: string =
  env.CONTENT_DIR ?? join(__dirname, "../content/content");
export const CONTENT_ROOT_DIR: string = env.CONTENT_ROOT_DIR ?? "../content";

export const SITE_NAME: string = env.SITE_NAME ?? "Jae's Website";
export const SITE_DESCRIPTION: string =
  env.SITE_DESCRIPTION ?? "The blog of Jae.";
export const SITE_TAGLINE: string = env.SITE_TAGLINE ?? "Random Beeps'n Boops";
export const SITE_COPYRIGHT: string =
  env.SITE_COPYRIGHT ?? "CC BY-SA 4.0 Jae Lo Presti";
export const SITE_LANGUAGE: string = env.SITE_LANGUAGE ?? "en";

export const PRODUCTION: boolean = env.NODE_ENV == "production";
export const HOST: string = env.HOST ?? "::";

export const DOMAINS_ADVERTISED: readonly string[] | undefined =
  env.DOMAINS_ADVERTISED?.split(",");

export const MATRIX_SUBDOMAIN: string = env.MATRIX_SUBDOMAIN ?? "";
export const MATRIX_HOMESERVER_PORT: number = parseInt(
  env.MATRIX_HOMESERVER_PORT ?? "443",
);

export const MATRIX_ENABLED: boolean = env.MATRIX_ENABLED == "true";
export const BLOGS_ENABLED: boolean = env.BLOGS_ENABLED == "true";
export const REDIRECTS_ENABLED: boolean = env.REDIRECTS_ENABLED == "true";
export const API_ENABLED: boolean = env.API_ENABLED == "true";
