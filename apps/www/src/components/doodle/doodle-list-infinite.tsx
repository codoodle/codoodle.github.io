"use client";

import { DoodleItem } from "@/content";
import { useInfiniteQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import DoodleListInfiniteTrigger from "./doodle-list-infinite-trigger";
import DoodleListItem from "./doodle-list-item";

export default function DoodleListInfinite() {
  const { slug: slugArray } = useParams<{ slug?: string[] }>();

  const isPagination =
    slugArray &&
    slugArray.at(-2) === "page" &&
    /^\d+$/.test(slugArray.at(-1) ?? "");
  const slugWithoutPagination = isPagination
    ? slugArray.slice(0, -2).join("/")
    : slugArray?.join("/");

  const {
    data,
    fetchPreviousPage,
    hasPreviousPage,
    isFetchingPreviousPage,
    isFetchPreviousPageError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
  } = useInfiniteQuery({
    queryKey: ["DOODLE", slugWithoutPagination, "PAGINATION"],
    queryFn: async ({ pageParam, queryKey }) => {
      const response = await fetch(
        `/doodles/api/pagination/${[
          ...(queryKey[1] ? queryKey[1].split("/").filter((f) => !!f) : []),
          "page",
          `${pageParam}`,
        ]
          .filter((f) => !!f)
          .join("/")}`,
        {
          method: "GET",
        },
      );
      if (!response.ok) {
        throw new Error("Failed to fetch");
      }
      return response.json() as Promise<{
        pageItems: DoodleItem[];
        pagePrev: number | undefined;
        pageNext: number | undefined;
      }>;
    },
    initialPageParam: 1,
    maxPages: 10,
    getNextPageParam: (lastPage) => lastPage.pageNext,
    getPreviousPageParam: (firstPage) => firstPage.pagePrev,
  });

  const items = data?.pages.flatMap((p) => p.pageItems) ?? [];

  return (
    <>
      {hasPreviousPage && (
        <div className="p-3 border-t border-separator leading-none text-sm">
          <Link
            href="#"
            rel="prev"
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
          >
            Newer items
          </Link>
          {!isFetchingPreviousPage && (
            <DoodleListInfiniteTrigger
              isPrevious
              onStartReached={fetchPreviousPage}
            />
          )}
          {isFetchingPreviousPage && (
            <span aria-live="polite">Loading more...</span>
          )}
          {!isFetchingPreviousPage && isFetchPreviousPageError && (
            <button
              type="button"
              onClick={() => fetchPreviousPage()}
              className="text-red-600 underline underline-offset-4"
            >
              Retry
            </button>
          )}
        </div>
      )}
      {items.map((item) => (
        <DoodleListItem key={item.slug} item={item} />
      ))}
      {hasNextPage && (
        <div className="p-3 border-t border-separator leading-none text-sm">
          <Link
            href="#"
            rel="next"
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
          >
            Older items
          </Link>
          {!isFetchingNextPage && (
            <DoodleListInfiniteTrigger isNext onEndReached={fetchNextPage} />
          )}
          {isFetchingNextPage && (
            <span aria-live="polite">Loading more...</span>
          )}
          {!isFetchingNextPage && isFetchNextPageError && (
            <button
              type="button"
              onClick={() => fetchNextPage()}
              className="text-red-600 underline underline-offset-4"
            >
              Retry
            </button>
          )}
        </div>
      )}
    </>
  );
}
