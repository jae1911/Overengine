import { describe, expect, test } from "@jest/globals";

import { scourDirectory } from "../src/utils/fileUtil";

describe("Test directory listing utils", () => {
  test("tests the listing module empty", () => {
    expect(scourDirectory("src/routes")).toStrictEqual([]);
  });
});
