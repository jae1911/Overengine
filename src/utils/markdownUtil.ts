import { existsSync, readFileSync } from 'fs';

import { marked } from 'marked';
import { parseMarkdownHeaders } from 'markdown-headers';
import { Feed } from 'feed';

import { PostMedatada } from '../types/postMetadata';
import { MenuList } from '../types/menuList';
import scourDirectory from './fileUtil';
import { BASE_CONTENT_DIR } from '../environment';


const errorMeta: PostMedatada = {
    title: '404',
    description: 'Page not found',
    markdown: '## 404\n\nPage not found.',
    pubDate: new Date(),
}

const noMetaError: PostMedatada = {
    title: 'No title provided',
    description: 'No description provided',
    markdown: "## No markdown found.",
    pubDate: new Date(),
}

function pathToParse(path: string): PostMedatada {
    let res: PostMedatada;

    if(path.length < 1 || path.split('.').pop() != 'md' || !existsSync(path))
    {
        res = errorMeta;
        res.markdown = marked.parse(errorMeta.markdown);
    }
    else {
        res = markToParsed(path);
        res.markdown = marked.parse(res.markdown);
    }

    return res;
}

function markToParsed(path: string): PostMedatada {
    const mdh = parseMarkdownHeaders(readFileSync(path, 'utf-8'));

    let title = noMetaError.title;
    let description = noMetaError.description;
    let date = noMetaError.pubDate;
    let menusList: string[] = [];

    if (mdh?.headers) {
        const headers = JSON.parse(JSON.stringify(mdh?.headers));
        title = headers.title ?? noMetaError.title;
        description = headers.description ?? noMetaError.description;
        date = new Date(headers.date) ?? noMetaError.pubDate;
        if (headers.menus)
            menusList = headers.menus;
    }
    
    const markdown = mdh?.markdown ?? noMetaError.markdown;

    const res: PostMedatada = {
        title: title,
        description: description,
        markdown: markdown,
        pubDate: date,
        menus: menusList,
    };

    return res;
}

// BaseDomain is request.hostname
// Protocol is request.protocol
function generateListFromFile(path: string, baseDomain: string, protocol?: string, onlyIndex?: boolean, noIndex?: boolean, menuName?: string, isBlog?: boolean): MenuList[] {
    const proto: string = protocol ?? 'https';
    let res: MenuList[] = [];

    const dirContent: string[] = scourDirectory(path);
    dirContent.forEach((entry) => {
        const postMeta: PostMedatada = markToParsed(BASE_CONTENT_DIR + entry);

        let listUri: string = '';

        if (!isBlog) {
            listUri = `${proto}://${baseDomain}${entry.replace(BASE_CONTENT_DIR, '').replace('.md', '').replaceAll(' ', '-')}`;

            // Take into account the subdir index
            if (listUri.substring(listUri.lastIndexOf("/")).replace("/", "") == '_index')
                listUri = listUri.replace('_index', '');
        } else if (isBlog) {
            const title = postMeta.title ?? 'No title';
            listUri = `${proto}://${baseDomain}/blog/${postMeta.pubDate.getFullYear()}/${String(postMeta.pubDate.getMonth() + 1).padStart(2, '0')}/${String(postMeta.pubDate.getDay() + 1).padStart(2, '0')}/${title.replaceAll(' ', '-').toLowerCase()}/`;
        }

        const menuEntry: MenuList = {
            title: postMeta.title as string,
            date: postMeta.pubDate,
            link: listUri,
        };

        if (menuName && postMeta.menus && postMeta.menus.length > 0){
            if (postMeta.menus.includes(menuName)) {
                res.push(menuEntry);
            }
        } else if (!menuName) {
            if (onlyIndex && entry.includes('_index.md'))
                res.push(menuEntry);
            else if (!onlyIndex && !noIndex)
                res.push(menuEntry);
            else if (!onlyIndex && noIndex && !entry.includes('_index.md'))
                res.push(menuEntry);
        }
    });

    return res;
}

function listToMarkdown(path: string, baseDomain: string, protocol?: string, onlyIndex?: boolean, noIndex?: boolean, showDate?: boolean, menuName?: string, isBlog?: boolean): string {
    let res: string = '';

    let fileList: MenuList[] = generateListFromFile(path, baseDomain, protocol, onlyIndex, noIndex, menuName, isBlog);

    fileList = fileList.sort(
        (objA, objB) => objB.date.getTime() - objA.date.getTime(),
    );

    fileList.forEach((page) => {
        if (showDate){
            const date = `${page.date.getFullYear()}/${String(page.date.getMonth() + 1).padStart(2, '0')}/${String(page.date.getDay() + 1).padStart(2, '0')}`;
            res += ` - ${date} [${page.title}](${page.link})\n`;
        }
        else
            res += ` - [${page.title}](${page.link})\n`;
    });

    return res;
}

function generateList(path: string, baseDomain: string, protocol?: string): string {
    let res: string = '';

    res = marked.parse(listToMarkdown(path.replace(/.$/, ''), baseDomain, protocol, false, true));

    return res;
}

function generatePageMenu(baseDomain: string, protocol?: string): string {
    let res: string = '';

    const listMd = listToMarkdown(BASE_CONTENT_DIR, baseDomain, protocol, false, false, false, 'main');
    res = marked.parse(listMd);

    return res;
}

function generateWikiMenu(baseDomain: string, protocol?: string): string {
    let res: string = '';

    const listMd = listToMarkdown(BASE_CONTENT_DIR, baseDomain, protocol, true, false, false, 'wiki');
    res = marked.parse(listMd);

    return res;
}

function generateBlogList(baseDomain: string, protocol?: string): string {
    let res: string = '';

    res = marked.parse(listToMarkdown(BASE_CONTENT_DIR + '/blog', baseDomain, protocol, false, true, true, undefined, true));

    return res;
}

function blogFinder(uri: string): PostMedatada {
    let res: PostMedatada = errorMeta;

    const dirContent: string[] = scourDirectory(BASE_CONTENT_DIR + '/blog');
    dirContent.forEach((entry) => {
        const postMeta: PostMedatada = markToParsed(BASE_CONTENT_DIR  + entry);

        if(postMeta.pubDate && postMeta.title) {
            const formattedTitle = `/blog/${postMeta.pubDate.getFullYear()}/${String(postMeta.pubDate.getMonth() + 1).padStart(2, '0')}/${String(postMeta.pubDate.getDay() + 1).padStart(2, '0')}/${postMeta.title.replaceAll(' ', '-').toLowerCase()}/`;

            if (formattedTitle == uri) {
                res = postMeta;
                res.markdown = marked.parse(res.markdown);
            }
        }
    });

    return res;
}

function generateFeeds(hostname: string, protocol: string, isBlog: boolean, path?: string): Feed {
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
        }
    });

    const dirContent: string[] = scourDirectory(BASE_CONTENT_DIR + '/blog');

    let allThePosts: PostMedatada[] = [];
    dirContent.forEach((entry) => {
        if (!entry.includes("_index")) {
            const postMeta: PostMedatada = markToParsed(BASE_CONTENT_DIR  + entry);
            allThePosts.push(postMeta);
        }    
    });

    allThePosts = allThePosts.sort(
        (objA, objB) => objB.pubDate.getTime() - objA.pubDate.getTime(),
    );

    allThePosts.forEach((postMeta) => {
        if (postMeta.title) {
            const formattedURi = `${protocol}://${hostname}/blog/${postMeta.pubDate.getFullYear()}/${String(postMeta.pubDate.getMonth() + 1).padStart(2, '0')}/${String(postMeta.pubDate.getDay() + 1).padStart(2, '0')}/${postMeta.title.replaceAll(' ', '-').toLowerCase()}/`;

            feed.addItem({
                title: postMeta.title,
                id: formattedURi,
                link: formattedURi,
                description: postMeta.description,
                content: marked.parse(postMeta.markdown),
                author: [
                    {
                        name: "Jae Lo Presti",
                        email: "jae@j4.lc",
                        link: "https://j4.lc",
                    }
                ],
                date: postMeta.pubDate,
            });
        }
    })

    return feed;
}

export { pathToParse, generateListFromFile, listToMarkdown, generateList, generatePageMenu, generateWikiMenu, generateBlogList, blogFinder, generateFeeds };
