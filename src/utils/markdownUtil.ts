import { existsSync, readFileSync } from "fs";

import { parseMarkdownHeaders } from 'markdown-headers';
import MarkdownIt from "markdown-it";
import anchor from "markdown-it-anchor";
import MarkdownItFootnote from "markdown-it-footnote";
import highlightjs from "markdown-it-highlightjs";
import { marked } from "marked";
import slugify from "slugify";

import { BASE_CONTENT_DIR, PRODUCTION } from "../environment";
import { MenuList } from "../types/menuList";
import { notFoundMeta, PostMedatada } from "../types/postMetadata";

import { determineProtocol, isPostInFuture } from "./feedUtils";
import { scourDirectory } from "./fileUtil";
import { shortCodeOWM, shortCodeBGP, shortCodeWakaTime, shortCodeConstruction, shortcodeBlogList } from "./shortCodeUtils";

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
export const markToParsed = (path: string): PostMedatada => {
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

// Export those bad bois
export { pathToParse, generateList, generatePageMenu, generateWikiMenu, generateBlogList, generateBlogListTagged };
