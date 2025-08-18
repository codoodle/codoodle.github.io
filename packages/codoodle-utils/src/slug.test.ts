import { describe, expect, it } from "vitest";
import { concatSlug, toSlugArray, trimSlugSuffix } from "./slug";

describe("slug utilities", () => {
  it("toSlugArray splits and trims empty segments", () => {
    expect(toSlugArray("/a/b//c/")).toEqual(["a", "b", "c"]);
  });

  it("concatSlug concatenates properly", () => {
    expect(concatSlug("a/b", "c", "d")).toBe("a/b/c/d");
    expect(concatSlug(["a", "", "b"], "c")).toBe("a/b/c");
  });

  it("trimSlugSuffix with count 0 returns original", () => {
    expect(trimSlugSuffix("a/b/c", 0)).toBe("a/b/c");
    expect(trimSlugSuffix(["a", "b"], 0)).toBe("a/b");
  });

  it("trimSlugSuffix trims suffix segments", () => {
    expect(trimSlugSuffix("a/b/c", 1)).toBe("a/b");
    expect(trimSlugSuffix("a/b/c", 2)).toBe("a");
    expect(trimSlugSuffix("a/b/c", 3)).toBe("");
  });
});
