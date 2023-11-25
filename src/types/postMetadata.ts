export type PostMedatada = {
  readonly date: string | number | Date;
  readonly title?: string;
  readonly description?: string;
  readonly markdown: string;
  readonly pubDate: Date;
  readonly menus?: readonly string[];
  readonly tags?: readonly string[];
  readonly draft?: boolean;
  readonly picurl?: string;
  readonly picalt?: string;
  readonly picdesc?: string;
  readonly spoilered?: boolean;
};

export const notFoundMeta: PostMedatada = {
  title: "404",
  description: "Page not found",
  markdown: "## 404\n\nPage not found.",
  pubDate: new Date(),
  date: new Date(),
};
