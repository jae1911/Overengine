import { RANGE, WakaTimeApi } from "@nick22985/wakatime-api";
import axios, { AxiosInstance } from 'axios';

import { WAKATOKEN, BGPAS, OWMKEY, OWMCITY, LINGVA_DOMAIN } from "../environment";

import { cacheVal, getVal } from "./redisUtil";

// Constants
const wClient = new WakaTimeApi(WAKATOKEN);
const bgpBaseUri = BGPAS
    ? `https://api.bgpview.io/asn/${BGPAS}/`
    : null;

// WAKATIME CLIENT
const getWeeklyHours = async (): Promise<string> => {
    const cachedRes = await getVal('waka_weekly');
    if (cachedRes) {
        return cachedRes;
    }

    const stats = await wClient.getMyStats(RANGE.LAST_7_DAYS) as string;
    const jsonRes = JSON.stringify(stats);

    await cacheVal('waka_weekly', jsonRes);

    return jsonRes;
};

// BGP CLIENT¨
const generateBgpAxios = (): AxiosInstance | undefined => {
    if (bgpBaseUri) {
        const axiosClient = axios.create({
            baseURL: bgpBaseUri,
            headers: {
                "Content-Type": "application/json",
                "User-Agent": "jae.fi/overengine",
            }
        });

        return axiosClient;
    }

    return;
};

interface bgpPeer {
    readonly ix_id: number;
    readonly name: string;
    readonly name_full: string;
    readonly country_code: string;
    readonly city: string;
    readonly ipv4_address: string;
    readonly ipv6_address: string;
    readonly speed: number;
}

interface bgpMeta {
    readonly time_zone: string;
    readonly api_version: number;
    readonly execution_time: string;
}

interface bgpIx {
    readonly status: string;
    readonly status_message: string;
    readonly data: readonly bgpPeer[];
    readonly meta: bgpMeta;
}

interface bgpUpstream {
    readonly asn: number;
    readonly name: string;
    readonly description: string;
    readonly country_code: string;
}

interface bgpUpstreamData {
    readonly ipv4_upstreams: readonly bgpUpstream[];
    readonly ipv6_upstreams: readonly bgpUpstream[];
}

interface bgpUpstreams {
    readonly status: string;
    readonly status_message: string;
    readonly data: bgpUpstreamData;
    readonly ipv4_graph: string;
    readonly ipv6_graph: string;
    readonly meta: bgpMeta;
}

const getbBgpIx = async (): Promise<string | undefined> => {
    const axiosClient = generateBgpAxios();
    if (!axiosClient) {
        return;
    }

    const cachedRes = await getVal("bgp_ix");
    if (cachedRes) {
        return cachedRes;
    }

    const res = await axiosClient.get("ixs");
    const resJson = JSON.stringify(res.data);

    const parsedJson = JSON.parse(resJson) as bgpIx;

    if (parsedJson.status != "ok") {
        return "No IXs detected.";
    } else {
        const ixList = parsedJson.data.forEach((peer: bgpPeer): string => {
            return `<li>${peer.name_full} [${peer.ipv6_address} - ${peer.ipv4_address} | ${peer.speed}Mbps]</li>`;
        }) as unknown as string;

        const response = "<ul>"
            + ixList
            + "</ul>";
        
        await cacheVal("bgp_ix", response);

        return response;
    }
}

const getBgpUpstreams = async (): Promise<string | undefined> => {
    const axiosClient = generateBgpAxios();
    if (!axiosClient) {
        return;
    }

    const cachedRes = await getVal('bgp_upstreams');
    if (cachedRes) {
        return cachedRes;
    }

    const res = await axiosClient.get("upstreams");
    const resJson = JSON.stringify(res.data);

    const parsedJson = JSON.parse(resJson) as bgpUpstreams;

    if (parsedJson.status != "ok") {
        return "No upstreams detected.";
    } else {
        const v4Upstreams: readonly string[] = parsedJson.data.ipv4_upstreams.map((upstream: bgpUpstream): string => {
            return `<li>${upstream.asn} - ${upstream.description}</li>`;
        }).filter((item) => item) as readonly string[];

        const v6Upstreams: readonly string[] = parsedJson.data.ipv6_upstreams.map((upstream: bgpUpstream): string => {
            return `<li>${upstream.asn} - ${upstream.description}</li>`;
        }).filter((item) => item) as readonly string[];

        const res = `<ul>${v4Upstreams.join("\n")}\n${v6Upstreams.join("\n")}</ul>`;

        await cacheVal("bgp_upstreams", res);

        return res;
    }
};

// OPENWEATHERMAP

interface weatherResponse {
    readonly description: string;
}

interface weatherMain {
    readonly temp: number;
}

interface weatherGenericResponse {
    readonly weather: readonly weatherResponse[];
    readonly main: weatherMain | null;
}

const getWeatherForCity = async (city?: string): Promise<string | undefined> => {
    if (!OWMKEY) {
        return;
    }

    const cachedRes = await getVal(`weather_city_${city ?? OWMCITY}`);
    if (cachedRes) {
        return cachedRes;
    }

    const axiosClient = axios.create({
        baseURL: "https://api.openweathermap.org/data/2.5/",
        headers: {
            "Content-Type": "application/json",
            "User-Agent": "jae.fi/overengine",
        },
    });

    const res = await axiosClient.get(`weather?q=${city ?? OWMCITY}&units=metric&appid=${OWMKEY}`);
    const resJson = JSON.stringify(res.data);

    const parsedJson = JSON.parse(resJson) as weatherGenericResponse;

    if (parsedJson.main == null) {
        return "Could not parse weather (instance rate limited?).";
    } else {
        const res = `Weather in ${city ?? OWMCITY} is ${parsedJson.weather[0].description} with ${parsedJson.main.temp}°C.`;

        await cacheVal(`weather_city_${city ?? OWMCITY}`, res);

        return res;
    }
};

// TRANSLATION

interface translationResponse {
    readonly translation: string;
}

const translateString = async(text: string, origin?: string, target?: string): Promise<string | null> => {
    if (!origin)
        origin = 'fi';
    if (!target)
        target = 'en';

    const cacheKey = `${origin}_${target}_${text.replaceAll(' ', '-')}`;

    const cachedResult = await getVal(cacheKey);
    if (cachedResult)
        return cachedResult;

    const axiosClient = axios.create({
        baseURL: `https://${LINGVA_DOMAIN}/api/v1`,
    });

    const translateUri = `/${origin}/${target}/${text}`;
    const jsonRes = JSON.parse(JSON.stringify((await axiosClient.get(translateUri)).data)) as translationResponse;

    const finalTranslation = jsonRes.translation ?? null;

    await cacheVal(cacheKey, finalTranslation);

    return finalTranslation;
};

export { getWeeklyHours, getBgpUpstreams, getbBgpIx, getWeatherForCity, translateString };
