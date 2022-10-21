import Redis from 'ioredis';
import { pickle } from 'picklefriend';

import { REDIS_HOST, REDIS_DB, REDIS_PASSWORD, REDIS_PORT, REDIS_USER } from '../environment';

const defaultTtl = 60 * 60;

const cache = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
    db: REDIS_DB,
    password: REDIS_PASSWORD,
    username: REDIS_USER,
})

class RedisClient {
    public async cacheVal(key: string, value: string, ttl?: number, persist?: boolean): Promise<string> {

        if (!persist)
            await cache.set(key, value, 'EX', ttl ?? defaultTtl);
        else if (persist)
            await cache.set(key, value);

        return key;
    }

    public async getVal(key: string): Promise<string | null> {
        let value = await cache.get(key);

        return value;
    }
}

export default RedisClient;
