import { doodle, resolveContentBySlug } from "@/content";
import { paginateDoodleItem } from "@/lib/pagination";
import { toSlugArray } from "@codoodle/utils";
import { NextRequest, NextResponse } from "next/server";

const PAGE_SIZE = parseInt(process.env.PAGE_SIZE || "5", 10);

export const dynamicParams = false;

export function generateStaticParams() {
  const { items, tags } = doodle;
  if (items.length === 0) {
    return [{ slug: ["empty"] }];
  }
  return [
    ...Array.from({ length: Math.ceil(items.length / PAGE_SIZE) }, (_, i) => ({
      slug: ["page", `${i + 1}`],
    })),
    ...tags.reduce(
      (acc, tag) => {
        acc.push(
          ...Array.from(
            { length: Math.ceil((tag.doodleItems?.length ?? 0) / PAGE_SIZE) },
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
  const { doodle, tag } = resolveContentBySlug("doodle", slugWithoutPagination);
  const { pageItems, pagePrev, pageNext } = paginateDoodleItem(
    doodle ? doodle.items : tag ? tag.doodleItems : [],
    page,
  );

  return NextResponse.json({
    pageItems,
    pagePrev,
    pageNext,
  });
}
