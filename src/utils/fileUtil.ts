import { existsSync, readdirSync, readFileSync, statSync } from "fs";

import { Address6 } from "ip-address";

import { BASE_CONTENT_DIR, CONTENT_ROOT_DIR } from "../environment";

export const scourDirectory = (path: string): readonly string[] => {
  const files = readdirSync(path);

  const everything = files
    .map((file: string) => {
      const fileName = `${path}/${file}`;

      if (statSync(fileName).isDirectory()) return scourDirectory(fileName);
      else if (fileName.split(".")[fileName.split(".").length - 1] == "md")
        return fileName.replace(BASE_CONTENT_DIR, "");
    })
    .filter((item) => item) as unknown as readonly string[];

  return everything.flatMap((item) =>
    Array.isArray(item) ? item : [item],
  ) as readonly string[];
};

export const isLegacy = (ip: string): boolean => {
  try {
    const addr = new Address6(ip);

    return !!addr.address4;
  } catch (_e) {
    return true;
  }
};

export const getLatestGitHash = (): string => {
  if (!existsSync(`${CONTENT_ROOT_DIR}/.git/FETCH_HEAD`)) return "Unknown";

  const headRef = readFileSync(`${CONTENT_ROOT_DIR}/.git/FETCH_HEAD`, "utf8");

  const hash = headRef
    .substring(0, headRef.indexOf(" "))
    .replaceAll(" branch", "")
    .substring(0, 8);

  return hash;
};
