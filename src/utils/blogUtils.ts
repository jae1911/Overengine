import { marked } from "marked";

import { BASE_CONTENT_DIR } from "../environment";
import { notFoundMeta, PostMedatada } from "../types/postMetadata";

import { scourDirectory } from "./fileUtil";
import { markToParsed } from "./markdownUtil";

export const blogFinder = (uri: string): PostMedatada => {
    const dirContent: readonly string[] = scourDirectory(`${BASE_CONTENT_DIR}/blog`);

    const listRes = dirContent.map((entry) => {
        const postMeta = markToParsed(`${BASE_CONTENT_DIR}${entry}`);

        if (postMeta.pubDate && postMeta.title) {
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
