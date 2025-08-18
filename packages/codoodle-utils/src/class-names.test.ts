import { describe, expect, it } from "vitest";
import { classNames } from "./class-names";

describe("classNames utility", () => {
  it("joins class strings", () => {
    expect(classNames("a", "b")).toBe("a b");
  });

  it("filters falsy values", () => {
    expect(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      classNames("a", undefined as any, false as any, "", null as any),
    ).toBe("a");
  });

  it("handles object shorthand", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(classNames({ foo: true, bar: false } as any)).toBe("foo");
  });

  it("merges conflicting tailwind classes (twMerge)", () => {
    // twMerge should prefer the latter utility (p-4) over p-2
    const result = classNames("p-2", "p-4");
    expect(result.includes("p-4")).toBe(true);
    expect(result.includes("p-2")).toBe(false);
  });
});
