import { describe, expect, test } from "@jest/globals";

import {
  elementSchemeGenerator,
  matrixSchemeGenerator,
} from "../src/utils/matrixUtils";

describe("Matrix scheme generator", () => {
  test("scheme generator room", () => {
    const sampleScheme =
      "matrix:roomid/test:example.com?action=join&via=jae.fi";

    expect(matrixSchemeGenerator("test", "example.com")).toBe(sampleScheme);
  });

  test("scheme generator user", () => {
    const sampleScheme = "matrix:u/test:example.com?action=join&via=jae.fi";

    expect(matrixSchemeGenerator("test", "example.com", undefined, true)).toBe(
      sampleScheme,
    );
  });
});

describe("Element scheme generator", () => {
  test("scheme generator room", () => {
    const sampleScheme =
      "element://vector/webapp/#/room/!test:example.com?via=jae.fi";

    expect(elementSchemeGenerator("test", "example.com", false)).toBe(
      sampleScheme,
    );
  });

  test("scheme generator user", () => {
    const sampleScheme =
      "element://vector/webapp/#/room/#test:example.com?via=jae.fi";

    expect(elementSchemeGenerator("test", "example.com", true)).toBe(
      sampleScheme,
    );
  });
});
