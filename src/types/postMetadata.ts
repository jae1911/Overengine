/* eslint-disable functional/prefer-readonly-type */
export type PostMedatada = {
    date: string | number | Date;
    title?: string;
    description?: string;
    markdown: string;
    pubDate: Date;
    menus?: string[];
    tags?: string[];
    draft?: boolean;
    picurl?: string;
    picalt?: string;
    picdesc?: string;
};
