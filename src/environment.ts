import { env } from 'process';
import dotenv from 'dotenv';
import { join } from 'path';

dotenv.config();

export const BASE_CONTENT_DIR: string = env.CONTENT_DIR ?? join(__dirname, '../content');
