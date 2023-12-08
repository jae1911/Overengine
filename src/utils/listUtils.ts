import { BASE_CONTENT_DIR, PRODUCTION } from "../environment";
import { MenuList } from "../types/menuList";

import { determineProtocol, isPostInFuture } from "./feedUtils";
import { scourDirectory } from "./fileUtil";
import { markToParsed, mdParser } from "./markdownUtil";

export const generateListFromFile = (
  path: string,
  baseDomain: string,
  onlyIndex?: boolean,
  noIndex?: boolean,
  menuName?: string,
  isBlog?: boolean,
  tag?: string,
): readonly MenuList[] => {
  const proto = determineProtocol(baseDomain);
  const dirContent = scourDirectory(path);

  return dirContent
    .map((entry: string): MenuList | undefined => {
      if (entry.includes("_index.tags.md")) {
        return undefined;
      }

      const postMeta = markToParsed(BASE_CONTENT_DIR + entry);
      const title = postMeta.title ?? "No title found";

      if (
        !PRODUCTION ||
        (PRODUCTION && !postMeta.draft && !isPostInFuture(postMeta.pubDate))
      ) {
        const uriList = isBlog
          ? `${proto}://${baseDomain}/blog/${postMeta.pubDate.getFullYear()}/${String(
              postMeta.pubDate.getMonth() + 1,
            ).padStart(2, "0")}/${String(
              postMeta.pubDate.getUTCDate(),
            ).padStart(2, "0")}/${title
              .replaceAll(" ", "-")
              .replaceAll('"', "")
              .replaceAll(":", "")
              .replaceAll("'", "")
              .toLowerCase()}/`
          : `${proto}://${baseDomain}${entry
              .replace(BASE_CONTENT_DIR, "")
              .replace(".md", "")
              .replaceAll(" ", "-")}`;

        const cannotBeSubDir =
          !isBlog &&
          uriList.substring(uriList.lastIndexOf("/")).replace("/", "") ==
            "_index";

        const finalUri = cannotBeSubDir
          ? uriList.replace("_index", "")
          : uriList;

        const menuEntry = {
          title: title,
          date: postMeta.pubDate,
          link: finalUri,
        };

        // Spaghetti incoming
        if (menuName && postMeta.menus && postMeta.menus.length > 0) {
          if (postMeta.menus.includes(menuName)) {
            return menuEntry;
          }
        } else if (!menuName && !tag) {
          if (onlyIndex && entry.includes("_index.md")) {
            return menuEntry;
          } else if (!onlyIndex && !noIndex) {
            return menuEntry;
          } else if (!onlyIndex && noIndex && !entry.includes("_index.md")) {
            return menuEntry;
          }
        } else if (!menuName && tag) {
          if (postMeta.tags && postMeta.tags.includes(tag)) {
            return menuEntry;
          }
        }
      }
    })
    .filter((item) => item) as readonly MenuList[];
};

export const listToMarkdown = (
  path: string,
  baseDomain: string,
  onlyIndex?: boolean,
  noIndex?: boolean,
  showDate?: boolean,
  menuName?: string,
  isBlog?: boolean,
  number?: number,
  tag?: string,
): string => {
  const fileList = generateListFromFile(
    path,
    baseDomain,
    onlyIndex,
    noIndex,
    menuName,
    isBlog,
    tag,
  );

  const sortedList = [...fileList]
    .sort((objA, objB) => objB.date.getTime() - objA.date.getTime())
    .slice(0, number);

  const listRes: readonly string[] = sortedList
    .map((page): string => {
      return showDate
        ? ` - ${page.date.getFullYear()}/${String(
            page.date.getMonth() + 1,
          ).padStart(2, "0")}/${String(page.date.getUTCDate()).padStart(
            2,
            "0",
          )} [${page.title}](${page.link})`
        : ` - [${page.title}](${page.link})`;
    })
    .filter((item) => item);

  return listRes.join("\n");
};

// Menus generators
export const generateList = (path: string, baseDomain: string): string => {
  return mdParser.render(
    listToMarkdown(path.replace(/.$/, ""), baseDomain, false, true),
  );
};

export const generatePageMenu = (baseDomain: string): string => {
  const listMd = listToMarkdown(
    BASE_CONTENT_DIR,
    baseDomain,
    false,
    false,
    false,
    "main",
  );
  return mdParser.render(listMd);
};

export const generateWikiMenu = (baseDomain: string): string => {
  const listMd = listToMarkdown(
    BASE_CONTENT_DIR,
    baseDomain,
    true,
    false,
    false,
    "wiki",
  );
  return mdParser.render(listMd);
};

export const generateBlogList = (baseDomain: string): string => {
  const listMd = listToMarkdown(
    BASE_CONTENT_DIR + "/blog",
    baseDomain,
    false,
    true,
    true,
    undefined,
    true,
  );
  return mdParser.render(listMd);
};

export const generateBlogListTagged = (
  baseDomain: string,
  tag: string,
): string => {
  const listMd = listToMarkdown(
    BASE_CONTENT_DIR + "/blog",
    baseDomain,
    false,
    true,
    false,
    undefined,
    true,
    undefined,
    tag,
  );
  return mdParser.render(listMd);
};
