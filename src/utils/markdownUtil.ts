import { existsSync, readFileSync } from "fs";

import { Feed } from "feed";
import { parseMarkdownHeaders } from 'markdown-headers';
import MarkdownIt from "markdown-it";
import anchor from "markdown-it-anchor";
import MarkdownItFootnote from "markdown-it-footnote";
import highlightjs from "markdown-it-highlightjs";
import { marked } from "marked";
import slugify from "slugify";

import { BASE_CONTENT_DIR, PRODUCTION } from "../environment";
import { MenuList } from "../types/menuList";
import { PostMedatada } from "../types/postMetadata";

import { scourDirectory } from "./fileUtil";
import { shortCodeOWM, shortCodeBGP, shortCodeWakaTime, shortCodeConstruction, shortcodeBlogList } from "./shortCodeUtils";

const notFoundMeta: PostMedatada = {
    title: "404",
    description: "Page not found",
    markdown: "## 404\n\nPage not found.",
    pubDate: new Date(),
    date: new Date(),
}

const mdParser = MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
})  .use(MarkdownItFootnote)
    .use(highlightjs)
    .use(anchor, {
        slugify: s => slugify(s, {
            lower: true,
        }),
    });

// PARSE MD AND RETURN IT
const pathToParse = async (path: string, isBlog?: boolean, baseDomain?: string): Promise<PostMedatada> => {
    if (path.length < 1 || [...path.split(".")].pop() != "md" || !existsSync(path)) {
        return {
            title: notFoundMeta.title,
            description: notFoundMeta.description,
            markdown: marked.parse(notFoundMeta.markdown),
            pubDate: notFoundMeta.pubDate,
            date: notFoundMeta.date,
        }
    }

    const parsedMeta = markToParsed(path);

    // SHORTCODES
    const shortCodedMarkdown = await shortCodeOWM(await shortCodeBGP(await shortCodeWakaTime(shortCodeConstruction(parsedMeta.markdown))));

    // Launch rendering
    const gotBlogDomain = isBlog && baseDomain;
    return {
        date: parsedMeta.date,
        markdown: mdParser.render(
            gotBlogDomain
                ? shortcodeBlogList(shortCodedMarkdown, baseDomain)
                : shortCodedMarkdown),
        pubDate: parsedMeta.pubDate,
        draft: parsedMeta.draft,
        picalt: parsedMeta.picalt,
        picdesc: parsedMeta.picdesc,
        picurl: parsedMeta.picurl,
        menus: parsedMeta.menus,
        tags: parsedMeta.tags,
        title: parsedMeta.title,
        description: parsedMeta.description,
        spoilered: parsedMeta.spoilered,
    };
};

// PARSE MARKDOWN FILE
const markToParsed = (path: string): PostMedatada => {
    const parsedFile = parseMarkdownHeaders(readFileSync(path, "utf-8"));

    if (parsedFile && parsedFile?.headers && parsedFile.markdown) {
        const headers = JSON.parse(JSON.stringify(parsedFile?.headers)) as PostMedatada;

        const title = headers.title ?? "No title provided.";
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
        const spoilered = headers.spoilered;

        return {
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
            spoilered,
        }
    } else {
        return notFoundMeta;
    }
}

// LIST GENERATORS
const generateListFromFile = (path: string, baseDomain: string, onlyIndex?: boolean, noIndex?: boolean, menuName?: string, isBlog?: boolean, tag?: string): readonly MenuList[] => {
    const proto = determineProtocol(baseDomain);
    const dirContent = scourDirectory(path);

    return dirContent.map((entry: string): MenuList | undefined => {
        if (entry.includes('_index.tags.md')) {
            return undefined;
        }

        const postMeta = markToParsed(BASE_CONTENT_DIR + entry);
        const title = postMeta.title ?? "No title found";

        if (!PRODUCTION || (PRODUCTION && !postMeta.draft && !isPostInFuture(postMeta.pubDate))) {

            const uriList = isBlog
                ? `${proto}://${baseDomain}/blog/${postMeta.pubDate.getFullYear()}/${String(postMeta.pubDate.getMonth() + 1).padStart(2, "0")}/${String(postMeta.pubDate.getUTCDate()).padStart(2, "0")}/${title.replaceAll(" ", "-").replaceAll('"', '').replaceAll(':', '').replaceAll('\'', '').toLowerCase()}/`
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
}

export const listToMarkdown = (path: string, baseDomain: string, onlyIndex?: boolean, noIndex?: boolean, showDate?: boolean, menuName?: string, isBlog?: boolean, number?: number, tag?: string): string => {
    const fileList = generateListFromFile(path, baseDomain, onlyIndex, noIndex, menuName, isBlog, tag);

    const sortedList = [...fileList].sort(
        (objA, objB) => objB.date.getTime() - objA.date.getTime(),
    ).slice(0, number);

    const listRes: readonly string[] = sortedList.map((page): string => {
        return showDate
            ? ` - ${page.date.getFullYear()}/${String(page.date.getMonth() + 1).padStart(2, '0')}/${String(page.date.getUTCDate()).padStart(2, '0')} [${page.title}](${page.link})`
            : ` - [${page.title}](${page.link})`;
    }).filter((item) => item);

    return listRes.join("\n");
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
            const formattedTitle = `/blog/${postMeta.pubDate.getFullYear()}/${String(postMeta.pubDate.getMonth() + 1).padStart(2, '0')}/${String(postMeta.pubDate.getUTCDate()).padStart(2, '0')}/${postMeta.title.replaceAll(' ', '-').replaceAll('"', '').replaceAll(':', '').replaceAll('\'', '').toLowerCase()}/`;

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
                    spoilered: postMeta.spoilered,
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
    return host.includes('.onion') || host.includes('127.0.0.1') || host.includes('192.168.0') || host.includes('localhost') || host.includes('.i2p') || host.includes('.jj')
        ? "http"
        : "https";
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
            return markToParsed(BASE_CONTENT_DIR + entry);
        }
    }).filter((item) => item) as readonly PostMedatada[];

    const sortedPosts: readonly PostMedatada[] = [...allThePosts].sort(
        (objA, objB) => objB.pubDate.getTime() - objA.pubDate.getTime(),
    );

    sortedPosts.forEach((postMeta) => {
        if (postMeta.title && ((PRODUCTION && !postMeta.draft && !isPostInFuture(postMeta.pubDate)) || !PRODUCTION)) {
            const formattedURi = `${protocol}://${hostname}/blog/${postMeta.pubDate.getFullYear()}/${String(postMeta.pubDate.getMonth() + 1).padStart(2, '0')}/${String(postMeta.pubDate.getUTCDate()).padStart(2, '0')}/${postMeta.title.replaceAll(' ', '-').replaceAll('"', '').replaceAll(':', '').replaceAll('\'', '').toLowerCase()}/`;

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
