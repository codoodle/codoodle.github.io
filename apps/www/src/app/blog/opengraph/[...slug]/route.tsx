import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { blog, resolveContentBySlug } from "@/content";
import { toSlugArray } from "@codoodle/utils";
import { ImageResponse } from "next/og";

export const dynamicParams = false;

export function generateStaticParams() {
  const { categories, posts, tags } = blog;
  return [
    {
      slug: ["image"],
    },
    ...categories.reduce(
      (acc, category) => {
        acc.push({
          slug: toSlugArray(category.slug).concat("image"),
        });
        return acc;
      },
      [] as { slug: string[] }[],
    ),
    ...tags.reduce(
      (acc, tag) => {
        acc.push({
          slug: ["tags"].concat(toSlugArray(tag.slug)).concat("image"),
        });
        return acc;
      },
      [] as { slug: string[] }[],
    ),
    ...posts.map((post) => ({
      slug: toSlugArray(post.slug).concat("image"),
    })),
  ];
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug?: string[] }> },
) {
  const { slug: slugArray } = await params;
  const { blog, category, tag, post } = resolveContentBySlug(
    "blog",
    slugArray!.slice(0, -1).join("/"),
  );
  const logoData = await readFile(
    resolve(process.cwd(), "public", "images", "codoodle-128.png"),
    "base64",
  );
  const logoSrc = `data:image/png;base64,${logoData}`;

  return new ImageResponse(
    <div
      style={{
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        height: "100%",
        padding: "32px 32px",
        position: "relative",
        width: "100%",
      }}
    >
      <div
        style={{
          background: "radial-gradient(circle at center, #191919, black)",
          display: "flex",
          height: "630px",
          position: "absolute",
          width: "1200px",
        }}
      ></div>
      <div
        style={{
          display: "flex",
          height: "630px",
          position: "absolute",
          width: "1200px",
        }}
      >
        {Array.from({ length: 14 })
          .fill(0)
          .map((_, i) => (
            <div
              key={i}
              style={{
                background:
                  "radial-gradient(circle at center, black, transparent)",
                height: "2px",
                left: "0",
                position: "absolute",
                top: `${(i + 1) * 65 - 10}px`,
                width: "1200px",
              }}
            ></div>
          ))}
        {Array.from({ length: 26 })
          .fill(0)
          .map((_, i) => (
            <div
              key={i}
              style={{
                background:
                  "radial-gradient(circle at center, black, transparent)",
                bottom: "0",
                left: `${(i + 1) * 65 - 16}px`,
                position: "absolute",
                top: "0",
                width: "2px",
              }}
            ></div>
          ))}
      </div>
      <div
        style={{
          alignItems: "center",
          display: "flex",
        }}
      >
        {/* eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element */}
        <img src={logoSrc} height="128" style={{ filter: "invert(1)" }} />
      </div>
      <div
        style={{
          fontSize: "48px",
          paddingLeft: "16px",
        }}
      >
        {blog
          ? blog.name
          : category
            ? category.name
            : tag
              ? `#${tag.name}`
              : post.title}
      </div>
      <div
        style={{
          fontSize: "36px",
          paddingLeft: "16px",
        }}
      >
        {blog
          ? blog.description
          : category
            ? category.description
            : tag
              ? undefined
              : post.description}
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
    },
  );
}
