import Redis from 'ioredis';

import { REDIS_HOST, REDIS_DB, REDIS_PASSWORD, REDIS_PORT, REDIS_USER } from '../environment';

const defaultTtl = 60 * 60;

const cache = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
    db: REDIS_DB,
    password: REDIS_PASSWORD,
    username: REDIS_USER,
});

const cacheVal = async (key: string, value: string, ttl?: number, persist?: boolean): Promise<string> => {
    const result = persist
        ? await cache.set(key, value)
        : await cache.set(key, value, "EX", ttl ?? defaultTtl);
    
    return result;
}

const getVal = async (key: string): Promise<string | null> => {
    const res = await cache.get(key);
    return res;
}

export { cacheVal, getVal };
