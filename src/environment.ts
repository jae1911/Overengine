import { join } from 'path';
import { env } from 'process';

import dotenv from 'dotenv';

dotenv.config();

export const BASE_CONTENT_DIR: string = env.CONTENT_DIR ?? join(__dirname, '../content/content');
export const SITE_NAME: string = env.SITE_NAME ?? 'Jae\'s Website';
export const PRODUCTION: boolean = env.NODE_ENV == 'production';
export const HOST: string = env.HOST ?? '::';

export const DOMAINS_ADVERTISED: readonly string[] | undefined = env.DOMAINS_ADVERTISED?.split(',');

export const REDIS_HOST: string | undefined = env.REDIS_HOST;
export const REDIS_PORT: number = parseInt(env.REDIS_PORT ?? '6379');
export const REDIS_DB: number = parseInt(env.REDIS_DB ?? '0');
export const REDIS_PASSWORD: string = env.REDIS_PASSWORD ?? '';
export const REDIS_USER: string = env.REDIS_USER ?? '';

export const WAKATOKEN: string = env.WAKATOKEN ?? '';

export const BGPAS: string = env.BGPAS ?? '';

export const OWMKEY: string = env.OWMKEY ?? '';
export const OWMCITY: string = env.OWMCITY ?? 'Helsinki';

export const LINGVA_DOMAIN: string = env.LINGVA_DOMAIN ?? 'translate.jae.fi';

export const MATRIX_SUBDOMAIN: string = env.MATRIX_SUBDOMAIN ?? '';
export const MATRIX_HOMESERVER_PORT: number = parseInt(env.MATRIX_HOMESERVER_PORT ?? '443');
