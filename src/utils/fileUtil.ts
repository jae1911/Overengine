import { readdirSync, statSync } from "fs";

import { Address6 } from "ip-address";

import { BASE_CONTENT_DIR } from "../environment";

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
  return new Address6(ip).v4;
};
