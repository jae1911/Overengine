import { describe, expect, test } from "@jest/globals";

import { scourDirectory } from "../src/utils/fileUtil";

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
