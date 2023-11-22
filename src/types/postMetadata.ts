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
  spoilered?: boolean;
};

export const notFoundMeta: PostMedatada = {
  title: "404",
  description: "Page not found",
  markdown: "## 404\n\nPage not found.",
  pubDate: new Date(),
  date: new Date(),
};
