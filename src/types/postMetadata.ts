export type PostMedatada = {
    title?: string;
    description?: string;
    markdown: string;
    pubDate: Date;
    menus?: string[];
    tags?: string[];
    draft?: boolean;
};
