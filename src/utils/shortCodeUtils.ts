import { BASE_CONTENT_DIR, BGPAS, BLOGS_ENABLED, OWMKEY, WAKATOKEN } from "../environment";
import { WakaRes } from "../types/wakatime";

import { getBgpUpstreams, getbBgpIx, getWeatherForCity, getWeeklyHours } from "./apiClient";
import { listToMarkdown } from "./listUtils";

export const shortCodeConstruction = (input: string): string => {
    return input.replaceAll("{{< construction >}}", "<div class=\"construction\"><svg xmlns=\"http://www.w3.org/2000/svg\" fill=\"none\" viewBox=\"0 0 24 24\" stroke-width=\"1.5\" stroke=\"currentColor\" class=\"w-6 h-6\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M12 10.5v3.75m-9.303 3.376C1.83 19.126 2.914 21 4.645 21h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 4.88c-.866-1.501-3.032-1.501-3.898 0L2.697 17.626zM12 17.25h.007v.008H12v-.008z\"></path></svg><h2>What comes next is a work in progress!</h2></div>")
}

export const shortcodeBlogList = (markdown: string, baseDomain: string): string => {
    return BLOGS_ENABLED 
        ? markdown.replaceAll("{{< postlist >}}", listToMarkdown(BASE_CONTENT_DIR + "/blog", baseDomain, false, true, false, undefined, true, 5)) 
        : markdown.replaceAll("{{< postlist >}}", '');
}

export const shortCodeWakaTime = async (input: string): Promise<string> => {
    return WAKATOKEN && WAKATOKEN.length > 1
        ? input.replaceAll("{{< wakaCounter >}}", `<p>I spent ${await generateWakaString()} programming this week.`)
        : input.replaceAll("{{< wakaCounter >}}", "");
}

export const shortCodeBGP = async (input: string): Promise<string> => {
    return BGPAS
        ? input.replaceAll("{{< bgpUpstreams >}}", await getBgpUpstreams() ?? "").replaceAll("{{< bgpIx >}}", await getbBgpIx() ?? "")
        : input.replaceAll("{{< bgpUpstreams >}}", "").replaceAll("{{< bgpIx >}}", "");
}

export const shortCodeOWM = async (input: string): Promise<string> => {
    return OWMKEY
        ? input.replaceAll("{{< weatherWidget >}}", await getWeatherForCity() ?? "An error happened while trying to get weather data.")
        : input.replaceAll("{{< weatherWidget >}}", "");
}

export const generateWakaString = async (): Promise<string> => {
    const res = JSON.parse(await getWeeklyHours()) as WakaRes;

    return res.data.human_readable_total;
}
