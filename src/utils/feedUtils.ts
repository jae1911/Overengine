import { Feed } from "feed";
import { marked } from "marked";

import { BASE_CONTENT_DIR, PRODUCTION, SITE_COPYRIGHT, SITE_DESCRIPTION, SITE_LANGUAGE, SITE_NAME } from "../environment";
import { PostMedatada } from "../types/postMetadata";

import { scourDirectory } from "./fileUtil";
import { markToParsed } from "./markdownUtil";

export const determineProtocol = (host: string): string => {
    return host.includes('.onion') || host.includes('127.0.0.1') || host.includes('192.168.0') || host.includes('localhost') || host.includes('.i2p') || host.includes('.jj')
        ? "http"
        : "https";
}

export const isPostInFuture = (date: Date): boolean => {
    return date.getTime() > Date.now();
}

export const generateFeeds = (hostname: string): Feed => {
    const protocol = determineProtocol(hostname);

    const feed = new Feed({
        id: `${protocol}://{hostname}`,
        link: `${protocol}://{hostname}`,
        title: SITE_NAME,
        copyright: SITE_COPYRIGHT,
        description: SITE_DESCRIPTION,
        generator: 'Overengine by Jae',
        language: SITE_LANGUAGE,
        feedLinks: {
            xml: `${protocol}://${hostname}/blog/index.xml`,
            json: `${protocol}://${hostname}/blog/index.json`,
            atom: `${protocol}://${hostname}/blog/index.atom`,
        },
    });

    const dirContent: readonly string[] = scourDirectory(`${BASE_CONTENT_DIR}/blog`);
    const allThePosts: readonly PostMedatada[] = dirContent.map((entry: string): PostMedatada | undefined => {
        if (!entry.includes('_index')) {
            return markToParsed(`${BASE_CONTENT_DIR}${entry}`);
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
