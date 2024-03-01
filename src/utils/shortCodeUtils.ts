import { BASE_CONTENT_DIR, BLOGS_ENABLED } from "../environment";

import { listToMarkdown } from "./listUtils";

export const shortCodeConstruction = (input: string): string => {
  return input.replaceAll(
    "{{< construction >}}",
    '<div class="construction"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M12 10.5v3.75m-9.303 3.376C1.83 19.126 2.914 21 4.645 21h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 4.88c-.866-1.501-3.032-1.501-3.898 0L2.697 17.626zM12 17.25h.007v.008H12v-.008z"></path></svg><h2>What comes next is a work in progress!</h2></div>',
  );
};

export const shortcodeBlogList = (
  markdown: string,
  baseDomain: string,
): string => {
  return BLOGS_ENABLED
    ? markdown.replaceAll(
        "{{< postlist >}}",
        listToMarkdown(
          BASE_CONTENT_DIR + "/blog",
          baseDomain,
          false,
          true,
          false,
          undefined,
          true,
          5,
        ),
      )
    : markdown.replaceAll("{{< postlist >}}", "");
};
