import Redis from 'ioredis';
import { pickle } from 'picklefriend';

import { REDIS_HOST, REDIS_DB, REDIS_PASSWORD, REDIS_PORT, REDIS_USER } from '../environment';

const cache = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
    db: REDIS_DB,
    password: REDIS_PASSWORD,
    username: REDIS_USER,
})

class RedisClient {
    public cacheVal(key: string, value: string): string {
        const finalValue = pickle.dumps(value);

        cache.set(key, finalValue);

        return key;
    }

    public async getVal(key: string): Promise<string> {
        const value = await cache.get(key) as string;

        return pickle.loads(value);
    }
}
