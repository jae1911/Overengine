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

function pathToParse(path: string): PostMedatada {
    let res: PostMedatada;

    if(path.length < 1 || path.split('.').pop() != 'md' || !existsSync(path))
    {
        res = errorMeta;
        res.markdown = Marked.parse(errorMeta.markdown);
    }
    else {
        res = markToParsed(path);
        res.markdown = Marked.parse(res.markdown);
    }

    return res;
}

function markToParsed(path: string): PostMedatada {
    const mdh = parseMarkdownHeaders(readFileSync(path, 'utf-8'));

    let title = noMetaError.title;
    let description = noMetaError.description;
    let date = noMetaError.pubDate;


    if (mdh?.headers) {
        const headers = JSON.parse(JSON.stringify(mdh?.headers));
        title = headers.title ?? noMetaError.title;
        description = headers.description ?? noMetaError.description;
        date = new Date(headers.date) ?? noMetaError.pubDate;
    }
    
    const markdown = mdh?.markdown ?? noMetaError.markdown;

    const res: PostMedatada = {
        title: title,
        description: description,
        markdown: markdown,
        pubDate: date,
    };

    return res;
}

export default pathToParse;
