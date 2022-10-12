import { existsSync, readFileSync } from 'fs';

import { Marked } from '@ts-stack/markdown';
import { parseMarkdownHeaders } from 'markdown-headers';

import { PostMedatada } from '../types/postMetadata';


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

function pathToParse(path: string): string {
    let res = '';

    if(path.length < 1 || path.split('.').pop() != 'md' || !existsSync(path))
        res = Marked.parse(errorMeta.markdown);
    else
        res = Marked.parse(markToParsed(path).markdown);

    return res;
}

function markToParsed(path: string): PostMedatada {
    const mdh = parseMarkdownHeaders(readFileSync(path, 'utf-8'));

    const headers = JSON.parse(JSON.stringify(mdh?.headers));

    const markdown = mdh?.markdown ?? noMetaError.markdown;
    const title = headers.title ?? noMetaError.title;
    const description = headers.description ?? noMetaError.description;
    const date = new Date(headers.date) ?? noMetaError.pubDate;

    const res: PostMedatada = {
        title: title,
        description: description,
        markdown: markdown,
        pubDate: date,
    };

    return res;
}

export default pathToParse;
