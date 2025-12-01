import { Doodle, Tag } from "@/content";
import { generateDoodleJsonLd, generateDoodleTagJsonLd } from "@/lib/json-ld";
import { paginateDoodleItem } from "@/lib/pagination";
import { getQueryClient } from "@/lib/query-client";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import DoodleListInfinite from "./doodle-list-infinite";
import DoodleListTitle from "./doodle-list-title";

type DoodleOrTag =
  | {
      doodle: Doodle;
      tag?: never;
    }
  | {
      doodle?: never;
      tag: Tag;
    };

export default async function DoodleList({
  page,
  doodle,
  tag,
}: {
  page: number;
} & DoodleOrTag) {
  const { pageItems, pagePrev, pageNext } = paginateDoodleItem(
    (doodle ? doodle.items : tag.doodleItems) ?? [],
    page,
  );
  const queryClient = getQueryClient();
  await queryClient.prefetchInfiniteQuery({
    queryKey: ["DOODLE", doodle ? undefined : tag.slug, "PAGINATION"],
    queryFn: () =>
      Promise.resolve({
        pageItems,
        pagePrev,
        pageNext,
      }),
    initialPageParam: 1,
  });

  return (
    <>
      {(doodle || tag) && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              doodle
                ? generateDoodleJsonLd()
                : generateDoodleTagJsonLd(tag, pageItems),
            ),
          }}
        />
      )}
      <div className="border-separator prose prose-sm dark:prose-invert max-w-none p-3">
        <DoodleListTitle {...({ doodle: doodle, tag } as DoodleOrTag)} />
      </div>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <DoodleListInfinite />
      </HydrationBoundary>
    </>
  );
}
