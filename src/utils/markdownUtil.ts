import { existsSync, readFileSync } from "fs";

import { Feed } from "feed";
import { parseMarkdownHeaders } from 'markdown-headers';
import { marked } from "marked";

import { BASE_CONTENT_DIR, BGPAS, OWMKEY, PRODUCTION, WAKATOKEN } from "../environment";
import { MenuList } from "../types/menuList";
import { PostMedatada } from "../types/postMetadata";

import { getbBgpIx, getBgpUpstreams, getWeatherForCity, getWeeklyHours } from "./apiClient";
import { scourDirectory } from "./fileUtil";
import MarkdownIt from "markdown-it";
import MarkdownItFootnote from "markdown-it-footnote";


const notFoundMeta: PostMedatada = {
    title: "404",
    description: "Page not found",
    markdown: "## 404\n\nPage not found.",
    pubDate: new Date(),
    date: new Date(),
}

const mdParser = MarkdownIt().use(MarkdownItFootnote)

// PARSE MD AND RETURN IT
const pathToParse = async (path: string, blog?: boolean, baseDomain?: string): Promise<PostMedatada> => {
    if (path.length < 1 || [...path.split(".")].pop() != "md" || !existsSync(path)) {
        const resMeta: PostMedatada = {
            title: notFoundMeta.title,
            description: notFoundMeta.description,
            markdown: marked.parse(notFoundMeta.markdown),
            pubDate: notFoundMeta.pubDate,
            date: notFoundMeta.date,
        }

        return resMeta;
    }

    const parsedMeta = markToParsed(path);

    // SHORTCODES
    const shortCodedMarkdown = await shortCodeOWM(await shortCodeBGP(await shortCodeWakaTime(shortCodeConstruction(parsedMeta.markdown))));

    // Convert markdown to end
    const parsedMarkdownWithReferences = mdParser.render(parsedMeta.markdown);

    // Launch rendering
    if (blog && baseDomain) {
        const specialBlogListMd = marked.parse(shortCodedMarkdown.replaceAll("{{< postlist >}}", listToMarkdown(BASE_CONTENT_DIR + "/blog", baseDomain, false, true, false, undefined, true, 5)));

        const response: PostMedatada = {
            date: parsedMeta.date,
            markdown: parsedMarkdownWithReferences,
            pubDate: parsedMeta.pubDate,
            draft: parsedMeta.draft,
            picalt: parsedMeta.picalt,
            picdesc: parsedMeta.picdesc,
            picurl: parsedMeta.picurl,
            menus: parsedMeta.menus,
            tags: parsedMeta.tags,
            title: parsedMeta.title,
            description: parsedMeta.description,
        }

        return response;
    } else {
        const response: PostMedatada = {
            date: parsedMeta.date,
            markdown: parsedMarkdownWithReferences,
            pubDate: parsedMeta.pubDate,
            draft: parsedMeta.draft,
            picalt: parsedMeta.picalt,
            picdesc: parsedMeta.picdesc,
            picurl: parsedMeta.picurl,
            menus: parsedMeta.menus,
            tags: parsedMeta.tags,
            title: parsedMeta.title,
            description: parsedMeta.description,
        }

        return response;
    }
};

// Shortcodes
const shortCodeConstruction = (input: string): string => {
    return input.replaceAll("{{< construction >}}", "<div class=\"construction\"><svg xmlns=\"http://www.w3.org/2000/svg\" fill=\"none\" viewBox=\"0 0 24 24\" stroke-width=\"1.5\" stroke=\"currentColor\" class=\"w-6 h-6\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M12 10.5v3.75m-9.303 3.376C1.83 19.126 2.914 21 4.645 21h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 4.88c-.866-1.501-3.032-1.501-3.898 0L2.697 17.626zM12 17.25h.007v.008H12v-.008z\"></path></svg><h2>What comes next is a work in progress!</h2></div>")
}

const shortCodeWakaTime = async (input: string): Promise<string> => {
    const isWakaEnabled = WAKATOKEN && WAKATOKEN.length > 1;

    const res = isWakaEnabled
        ? input.replaceAll("{{< wakaCounter >}}", `<p>I spent ${await generateWakaString()} programming this week.`)
        : input.replaceAll("{{< wakaCounter >}}", "");
    
    return res;
}

const shortCodeBGP = async (input: string): Promise<string> => {
    const res = BGPAS
        ? input.replaceAll("{{< bgpUpstreams >}}", await getBgpUpstreams() ?? "").replaceAll("{{< bgpIx >}}", await getbBgpIx() ?? "")
        : input.replaceAll("{{< bgpUpstreams >}}", "").replaceAll("{{< bgpIx >}}", "");
    
    return res;
}

const shortCodeOWM = async (input: string): Promise<string> => {
    const res = OWMKEY
        ? input.replaceAll("{{< weatherWidget >}}", await getWeatherForCity() ?? "An error happened while trying to get weather data.")
        : input.replaceAll("{{< weatherWidget >}}", "");

    return res;
}

// WakaTime stuff
interface WakaData {
    readonly human_readable_total: string;
}

interface WakaRes {
    readonly data: WakaData;
}

const generateWakaString = async (): Promise<string> => {
    const res = JSON.parse(await getWeeklyHours()) as WakaRes;

    return res.data.human_readable_total;
}

// PARSE MARKDOWN FILE
const markToParsed = (path: string): PostMedatada => {
    const parsedFile = parseMarkdownHeaders(readFileSync(path, "utf-8"));

    if (parsedFile && parsedFile?.headers && parsedFile.markdown) {
        const headers = JSON.parse(JSON.stringify(parsedFile?.headers)) as PostMedatada;

        const title = headers.title ?? "No title provided.";
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const pubDate = new Date(headers.date) ?? new Date();
        const menus = headers.menus;
        const tags = headers.tags;
        const draft = headers.draft;
        const description = headers.description
            ? headers.description
            : parsedFile.markdown.substring(0, 160).replaceAll("#", "").replaceAll(/(\r\n|\n|\r)/gm, ' ').replaceAll("*", "");
        
        const picurl = headers.picurl;
        const picalt = headers.picalt;
        const picdesc = headers.picdesc;

        const finalMetadata: PostMedatada = {
            title,
            pubDate,
            date: pubDate,
            menus,
            tags,
            draft,
            description,
            picalt,
            picdesc,
            picurl,
            markdown: parsedFile.markdown,
        }

        return finalMetadata;
    } else {
        return notFoundMeta;
    }
}

// LIST GENERATORS
const generateListFromFile = (path: string, baseDomain: string, onlyIndex?: boolean, noIndex?: boolean, menuName?: string, isBlog?: boolean, tag?: string): readonly MenuList[] => {
    const proto = determineProtocol(baseDomain);
    const dirContent = scourDirectory(path);

    const res: readonly MenuList[] = dirContent.map((entry: string): MenuList | undefined => {
        if (entry.includes('_index.tags.md')) {
            return undefined;
        }

        const postMeta = markToParsed(BASE_CONTENT_DIR + entry);
        const title = postMeta.title ?? "No title found";

        if (!PRODUCTION || (PRODUCTION && !postMeta.draft && !isPostInFuture(postMeta.pubDate))) {

            const uriList = isBlog
                ? `${proto}://${baseDomain}/blog/${postMeta.pubDate.getFullYear()}/${String(postMeta.pubDate.getMonth() + 1).padStart(2, "0")}/${String(postMeta.pubDate.getDay() + 1).padStart(2, "0")}/${title.replaceAll(" ", "-").replaceAll('"', '').replaceAll(':', '').replaceAll('\'', '').toLowerCase()}/`
                : `${proto}://${baseDomain}${entry.replace(BASE_CONTENT_DIR, "").replace(".md", "").replaceAll(" ", "-")}`;

            const cannotBeSubDir = !isBlog && (uriList.substring(uriList.lastIndexOf("/")).replace("/", "") == "_index");

            const finalUri = cannotBeSubDir
                ? uriList.replace("_index", "")
                : uriList;

            const menuEntry = {
                title: title,
                date: postMeta.pubDate,
                link: finalUri,
            }

            // Spaghetti incoming
            if (menuName && postMeta.menus && postMeta.menus.length > 0){
                if (postMeta.menus.includes(menuName)) {
                    return menuEntry;
                }
            } else if (!menuName && !tag) {
                if (onlyIndex && entry.includes('_index.md')) {
                    return menuEntry;
                }
                else if (!onlyIndex && !noIndex) {
                    return menuEntry;
                }
                else if (!onlyIndex && noIndex && !entry.includes('_index.md')) {
                    return menuEntry;
                }
            } else if (!menuName && tag) {
                if (postMeta.tags && postMeta.tags.includes(tag)) {
                    return menuEntry;
                }
            }
        }
    }).filter((item) => item) as readonly MenuList[];

    return res;
}

const listToMarkdown = (path: string, baseDomain: string, onlyIndex?: boolean, noIndex?: boolean, showDate?: boolean, menuName?: string, isBlog?: boolean, number?: number, tag?: string): string => {
    const fileList = generateListFromFile(path, baseDomain, onlyIndex, noIndex, menuName, isBlog, tag);

    const sortedList = [...fileList].sort(
        (objA, objB) => objB.date.getTime() - objA.date.getTime(),
    ).slice(0, number);

    const listRes: readonly string[] = sortedList.map((page): string => {
        return showDate
            ? ` - ${page.date.getFullYear()}/${String(page.date.getMonth() + 1).padStart(2, '0')}/${String(page.date.getDay() + 1).padStart(2, '0')} [${page.title}](${page.link})`
            : ` - [${page.title}](${page.link})`;
    }).filter((item) => item);

    const res = listRes.join("\n");

    return res;
};

// Menus generators
const generateList = (path: string, baseDomain: string): string => {
    return marked.parse(listToMarkdown(path.replace(/.$/, ""), baseDomain, false, true));
}

const generatePageMenu = (baseDomain: string): string => {
    const listMd = listToMarkdown(BASE_CONTENT_DIR, baseDomain, false, false, false, "main");
    return marked.parse(listMd);
}

const generateWikiMenu = (baseDomain: string): string => {
    const listMd = listToMarkdown(BASE_CONTENT_DIR, baseDomain, true, false, false, "wiki");
    return marked.parse(listMd);
}

const generateBlogList = (baseDomain: string): string => {
    const listMd = listToMarkdown(BASE_CONTENT_DIR + "/blog", baseDomain, false, true, true, undefined, true);
    return marked.parse(listMd);
}

const generateBlogListTagged = (baseDomain: string, tag: string): string => {
    const listMd = listToMarkdown(BASE_CONTENT_DIR + "/blog", baseDomain, false, true, false, undefined, true, undefined, tag);
    return marked.parse(listMd);
}

// Blog Finder
const blogFinder = (uri: string): PostMedatada => {
    const dirContent: readonly string[] = scourDirectory(BASE_CONTENT_DIR + "/blog");

    const listRes = dirContent.map((entry) => {
        const postMeta = markToParsed(BASE_CONTENT_DIR + entry);

        if(postMeta.pubDate && postMeta.title) {
            const formattedTitle = `/blog/${postMeta.pubDate.getFullYear()}/${String(postMeta.pubDate.getMonth() + 1).padStart(2, '0')}/${String(postMeta.pubDate.getDay() + 1).padStart(2, '0')}/${postMeta.title.replaceAll(' ', '-').replaceAll('"', '').replaceAll(':', '').replaceAll('\'', '').toLowerCase()}/`;

            if (formattedTitle == uri) {
                const finalMeta: PostMedatada = {
                    title: postMeta.title,
                    markdown: marked.parse(postMeta.markdown),
                    pubDate: postMeta.pubDate,
                    date: postMeta.pubDate,
                    menus: postMeta.menus,
                    tags: postMeta.tags,
                    draft: postMeta.draft,
                    picalt: postMeta.picalt,
                    picurl: postMeta.picurl,
                    picdesc: postMeta.picdesc,
                };

                return finalMeta;
            }
        }
    }).filter((item) => item) as readonly PostMedatada[];

    const res = listRes[0];

    return res ?? notFoundMeta;
}

// DETERMINE PROTOCOL FOR GENERATORS
const determineProtocol = (host: string): string => {
    const res = host.includes('.onion') || host.includes('127.0.0.1') || host.includes('192.168.0') || host.includes('localhost') || host.includes('.i2p')
        ? "http"
        : "https";
    
    return res;
}

// Feed Generator
const generateFeeds = (hostname: string, isBlog: boolean, path?: string): Feed => {
    const protocol = determineProtocol(hostname);

    const feed = new Feed({
        title: "Jae's Blog",
        description: "The blog of Jae.",
        id: `${protocol}://${hostname}`,
        link: `${protocol}://${hostname}`,
        language: "en",
        copyright: "CC BY-SA 4.0 Jae Lo Presti",
        generator: "Overengine by J4",
        feedLinks: {
            xml: `${protocol}://${hostname}/blog/index.xml`,
            json: `${protocol}://${hostname}/blog/index.json`,
            atom: `${protocol}://${hostname}/blog/index.atom`,
        },
    });

    const dirContent: readonly string[] = scourDirectory(BASE_CONTENT_DIR + "/blog");
    const allThePosts: readonly PostMedatada[] = dirContent.map((entry: string): PostMedatada | undefined => {
        if (!entry.includes("_index")) {
            const postMeta: PostMedatada = markToParsed(BASE_CONTENT_DIR + entry);
            return postMeta;
        }
    }).filter((item) => item) as readonly PostMedatada[];

    const sortedPosts: readonly PostMedatada[] = [...allThePosts].sort(
        (objA, objB) => objB.pubDate.getTime() - objA.pubDate.getTime(),
    );

    sortedPosts.forEach((postMeta) => {
        if (postMeta.title && ((PRODUCTION && !postMeta.draft && !isPostInFuture(postMeta.pubDate)) || !PRODUCTION)) {
            const formattedURi = `${protocol}://${hostname}/blog/${postMeta.pubDate.getFullYear()}/${String(postMeta.pubDate.getMonth() + 1).padStart(2, '0')}/${String(postMeta.pubDate.getDay() + 1).padStart(2, '0')}/${postMeta.title.replaceAll(' ', '-').replaceAll('"', '').replaceAll(':', '').replaceAll('\'', '').toLowerCase()}/`;

            feed.addItem({
                title: postMeta.title,
                id: formattedURi,
                link: formattedURi,
                description: postMeta.description,
                date: postMeta.pubDate,
                image: postMeta.picurl,
                content: marked.parse(postMeta.markdown),
                author: [
                    {
                        name: "Jae Lo Presti",
                        email: "jae@j4.lc",
                        link: "https://j4.lc",
                    }
                ],
            });
        }
    });

    return feed;
}

const isPostInFuture = (date: Date): boolean => {
    return date.getTime() > Date.now();
}

// Export those bad bois
export { determineProtocol, pathToParse, blogFinder, generateList, generatePageMenu, generateWikiMenu, generateBlogList, generateBlogListTagged, generateFeeds };
