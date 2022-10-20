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
    public async cacheVal(key: string, value: string): Promise<string> {
        const finalValue = pickle.dumps(value);

        // Cache results for 1h only
        await cache.set(key, finalValue, 'EX', 60 * 60);

        return key;
    }

    public async getVal(key: string): Promise<string | null> {
        let value = await cache.get(key);
        
        console.log(`${key} ${value}`)
        if (value)
            value = pickle.loads(value)

        return value;
    }
}

export default RedisClient;
