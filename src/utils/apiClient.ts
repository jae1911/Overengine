import { RANGE, WakaTimeApi } from "@nick22985/wakatime-api";
import axios, { AxiosInstance } from 'axios';

import { WAKATOKEN, BGPAS, OWMKEY, OWMCITY, LINGVA_DOMAIN } from "../environment";
import { bgpPeer, bgpIx, bgpUpstream, bgpUpstreams } from "../types/bgp";
import { translationResponse } from "../types/translate";
import { WakaRes } from "../types/wakatime";
import { weatherGenericResponse } from "../types/weather";

import { cacheVal, getVal } from "./redisUtil";

// Constants
const wClient = new WakaTimeApi(WAKATOKEN);
const bgpBaseUri = BGPAS
    ? `https://api.bgpview.io/asn/${BGPAS}/`
    : null;

// WAKATIME CLIENT
export const getWeeklyHours = async (): Promise<string> => {
    const cachedRes = await getVal('waka_weekly');
    if (cachedRes) {
        return cachedRes;
    }

    try {
        const stats = await wClient.getMyStats(RANGE.LAST_7_DAYS) as string;
        const jsonRes = JSON.stringify(stats);

        await cacheVal('waka_weekly', jsonRes);

        return jsonRes;
    } catch (error) {
        return "Error while fetching WakaTime.";
    }
};

export const generateWakaString = async (): Promise<string> => {
    const res = JSON.parse(await getWeeklyHours()) as WakaRes;

    return res.data.human_readable_total
}


// BGP CLIENT¨
export const generateBgpAxios = (): AxiosInstance | undefined => {
    if (bgpBaseUri) {
        return axios.create({
            baseURL: bgpBaseUri,
            headers: {
                "Content-Type": "application/json",
                "User-Agent": "jae.fi/overengine",
            }
        });
    }

    return;
};

export const getbBgpIx = async (): Promise<string | undefined> => {
    const axiosClient = generateBgpAxios();
    if (!axiosClient) {
        return;
    }

    const cachedRes = await getVal("bgp_ix");
    if (cachedRes) {
        return cachedRes;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const res = await axiosClient.get("ixs").catch((error) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return error as string;
      });

      if (typeof res === "string") {
        return "Error while fetching data.";
      }

      const resJson = JSON.stringify(res.data);

      const parsedJson = JSON.parse(resJson) as bgpIx;

      if (parsedJson.status != "ok") {
          return "No IXs detected.";
      } else {
          const ixList: readonly string[] = parsedJson.data.map((peer: bgpPeer): string => {
              return `<li>${peer.name_full} [${peer.ipv6_address} - ${peer.ipv4_address} | ${peer.speed}Mbps]</li>`;
          }).filter((item) => item) as readonly string[];

          const response = "<ul>"
              + ixList.join("\n")
              + "</ul>";
          
          await cacheVal("bgp_ix", response);

          return response;
      }
    } catch {
      return "Error: could not fetch BGP status.";
    }
}

export const getBgpUpstreams = async (): Promise<string | undefined> => {
    const axiosClient = generateBgpAxios();
    if (!axiosClient) {
        return;
    }

    const cachedRes = await getVal('bgp_upstreams');
    if (cachedRes) {
        return cachedRes;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const res = await axiosClient.get("upstreams").catch((error) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return error as string;
      });

      if (typeof res === "string") {
        return "Error while fetching data.";
      }

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
    } catch(err) {
      return "Error: could not fetch BGP status.";
    }
};

// OPENWEATHERMAP

export const getWeatherForCity = async (city?: string): Promise<string | undefined> => {
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

    const res = await axiosClient.get(`weather?q=${city ?? OWMCITY}&units=metric&appid=${OWMKEY}`).catch((error) => {
        return {
            data: [
                {
                    weather: "Error while fetching weather data (is your token OK?)",
                    main: null,
                }
            ]
        }
    });
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

export const translateString = async(text: string, origin?: string, target?: string): Promise<string | null> => {
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

    const resFromLingva = await axiosClient.get(translateUri).catch((_error) => {
        return {
            data: [
                {
                    translation: "Error: could no reach the Lingva instance.",
                }
            ],
        }
    });

    const jsonRes = JSON.parse(JSON.stringify(resFromLingva.data)) as translationResponse;

    const finalTranslation = jsonRes.translation ?? null;

    await cacheVal(cacheKey, finalTranslation);

    return finalTranslation;
};
