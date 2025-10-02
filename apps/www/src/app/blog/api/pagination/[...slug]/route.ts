import { blog, resolveContentBySlug } from "@/content";
import { paginateBlogPost } from "@/lib/pagination";
import { toSlugArray } from "@codoodle/utils";
import { NextRequest, NextResponse } from "next/server";

const PAGE_SIZE = parseInt(process.env.PAGE_SIZE || "5", 10);

export const dynamicParams = false;

export function generateStaticParams() {
  const { categories, posts, tags } = blog;
  if (posts.length === 0) {
    return [{ slug: ["empty"] }];
  }
  return [
    ...Array.from({ length: Math.ceil(posts.length / PAGE_SIZE) }, (_, i) => ({
      slug: ["page", `${i + 1}`],
    })),
    ...categories.reduce(
      (acc, category) => {
        acc.push(
          ...Array.from(
            { length: Math.ceil((category.posts?.length ?? 0) / PAGE_SIZE) },
            (_, i) => ({
              slug: toSlugArray(category.slug).concat(["page", `${i + 1}`]),
            }),
          ),
        );
        return acc;
      },
      [] as { slug: string[] }[],
    ),
    ...tags.reduce(
      (acc, tag) => {
        acc.push(
          ...Array.from(
            { length: Math.ceil((tag.posts?.length ?? 0) / PAGE_SIZE) },
            (_, i) => ({
              slug: ["tags"].concat(
                toSlugArray(tag.slug).concat(["page", `${i + 1}`]),
              ),
            }),
          ),
        );
        return acc;
      },
      [] as { slug: string[] }[],
    ),
  ];
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug?: string[] }> },
) {
  const { slug: slugArray } = await params;
  const page = Number(slugArray!.at(-1)) || 1;
  const slugWithoutPagination = slugArray!.slice(0, -2).join("/");
  const { blog, category, tag } = resolveContentBySlug(
    "blog",
    slugWithoutPagination,
  );
  const { pageItems, pagePrev, pageNext } = paginateBlogPost(
    blog
      ? blog.posts
      : category
        ? (category.posts ?? [])
        : tag
          ? tag.posts
          : [],
    page,
  );

  return NextResponse.json({
    pageItems,
    pagePrev,
    pageNext,
  });
}
