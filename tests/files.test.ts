import { describe, expect, test } from "@jest/globals";

import { getLatestGitHash, isLegacy, scourDirectory } from "../src/utils/fileUtil";

describe("ScourDirectory testing", () => {
  test("listing module empty", () => {
    expect(scourDirectory("src/routes")).toStrictEqual([]);
  });

  test("listing module with files", () => {
    expect(scourDirectory("tests/fakedir")).toStrictEqual([
      "tests/fakedir/1.md",
      "tests/fakedir/2.md",
    ]);
  });
});

describe("ip module testing", () => {
  test("isIpv4", () => {
    expect(isLegacy("1.0.0.0")).toBe(true);
  });

  test("isIpv6", () => {
    expect(isLegacy("2001:0db8:85a3:0000:0000:8a2e:0370:7334")).toBe(false);
  });
});

describe("git module testing", () => {
  test("git not found", () => {
    expect(getLatestGitHash()).toBe("Unknown");
  });
});
