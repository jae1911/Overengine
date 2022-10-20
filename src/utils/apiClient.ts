import { RANGE, WakaTimeApi } from "@nick22985/wakatime-api";

import { WAKATOKEN } from "../environment";
import RedisClient from "./redisUtil";

class WakaClient {
    private wClient: WakaTimeApi;
    private cache: RedisClient;

    constructor() {
        this.wClient = new WakaTimeApi(WAKATOKEN);
        this.cache = new RedisClient();
    }

    public async getWeeklyHours(): Promise<string> {
        let res = '';

        const cacheRes = await this.cache.getVal('waka_weekly');
        if (cacheRes)
            return cacheRes;

        const stats = await this.wClient.getMyStats(RANGE.LAST_7_DAYS);

        res = stats;

        this.cache.cacheVal('waka_weekly', res);

        return res;
    }
}

export default WakaClient;
