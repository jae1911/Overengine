import { env } from 'process';
import dotenv from 'dotenv';

dotenv.config();

export const BASE_CONTENT_DIR: string = env.CONTENT_DIR ?? '../content';
