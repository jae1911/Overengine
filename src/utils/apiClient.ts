import { RANGE, WakaTimeApi } from "@nick22985/wakatime-api";
import axios, { AxiosInstance } from 'axios';

import { WAKATOKEN, BGPAS } from "../environment";
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

        res = JSON.stringify(stats);

        this.cache.cacheVal('waka_weekly', res);

        return res;
    }
}

class BGPClient {
    private asNumber: string;
    private baseUri: string;
    private client: AxiosInstance;
    private cache: RedisClient;

    constructor() {
        this.asNumber = BGPAS;
        this.baseUri = `https://api.bgpview.io/asn/${this.asNumber}/`;

        this.client = axios.create({
            baseURL: this.baseUri,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'jae.fi/overengine'
            }
        });

        this.cache = new RedisClient();
    }

    public async getUpstreams(): Promise<string> {
        let res = '';

        const cacheRes = await this.cache.getVal('bgp_upstreams');
        if (cacheRes)
            return cacheRes;

        const response = await this.client.get('upstreams');

        const parsedJson = JSON.parse(JSON.stringify(response.data));

        if (parsedJson.status != "ok")
            res = "No upstreams detected.";
        else if (parsedJson.status == 'ok') {

            res += '<ul>';

            if (parsedJson.data.ipv4_upstreams) {
                parsedJson.data.ipv4_upstreams.forEach((upstream: any) => {
                    res += `<li>${upstream.asn} - ${upstream.description}</li>\n`;
                });
            }

            if (parsedJson.data.ipv6_upstreams) {
                parsedJson.data.ipv6_upstreams.forEach((upstream: any) => {
                    res += `<li>${upstream.asn} - ${upstream.description}</li>\n`;
                });
            }

            res += '</ul>';

        }

        this.cache.cacheVal('bgp_upstreams', res);

        return res;
    }
}

export { WakaClient, BGPClient };
