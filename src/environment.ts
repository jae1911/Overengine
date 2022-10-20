import { env } from 'process';
import dotenv from 'dotenv';
import { join } from 'path';

dotenv.config();

export const BASE_CONTENT_DIR: string = env.CONTENT_DIR ?? join(__dirname, '../content/content');
export const SITE_NAME: string = env.SITE_NAME ?? 'Jae\'s Website';
export const PRODUCTION: boolean = env.NODE_ENV != 'production';
export const HOST: string = env.HOST ?? '::';

export const REDIS_HOST: string = env.REDIS_HOST ?? 'localhost';
export const REDIS_PORT: number = parseInt(env.REDIS_PORT ?? '6379');
export const REDIS_DB: number = parseInt(env.REDIS_DB ?? '0');
export const REDIS_PASSWORD: string = env.REDIS_PASSWORD ?? '';
export const REDIS_USER: string = env.REDIS_USER ?? '';

export const WAKATOKEN: string = env.WAKATOKEN ?? '';

export const BGPAS: string = env.BGPAS ?? '';
