import { existsSync, readFileSync } from "fs";

import { parseMarkdownHeaders } from 'markdown-headers';
import MarkdownIt from "markdown-it";
import anchor from "markdown-it-anchor";
import MarkdownItFootnote from "markdown-it-footnote";
import highlightjs from "markdown-it-highlightjs";
import { marked } from "marked";
import slugify from "slugify";

import { notFoundMeta, PostMedatada } from "../types/postMetadata";

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

// Export those bad bois
export { pathToParse };
