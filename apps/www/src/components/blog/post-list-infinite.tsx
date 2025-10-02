"use client";

import { PostSimple } from "@/content";
import { useInfiniteQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import PostListInfiniteTrigger from "./post-list-infinite-trigger";
import PostListItem from "./post-list-item";

export default function PostListInfinite() {
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
    queryKey: ["BLOG", slugWithoutPagination, "PAGINATION"],
    queryFn: async ({ pageParam, queryKey }) => {
      const response = await fetch(
        `/blog/api/pagination/${[
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
        pageItems: PostSimple[];
        pagePrev: number | undefined;
        pageNext: number | undefined;
      }>;
    },
    initialPageParam: 1,
    maxPages: 10,
    getNextPageParam: (lastPage) => lastPage.pageNext,
    getPreviousPageParam: (firstPage) => firstPage.pagePrev,
  });

  const posts = data?.pages.flatMap((p) => p.pageItems) ?? [];

  return (
    <>
      {hasPreviousPage && (
        <>
          <div
            className="hidden lg:border-t border-separator lg:block lg:col-[1/2]"
            aria-hidden="true"
          ></div>
          <div
            className="hidden border-x lg:border-t border-separator lg:block lg:col-[2/3]"
            aria-hidden="true"
          ></div>
          <div className="p-3 border-t border-separator lg:col-[3/4] leading-none text-sm">
            <Link
              href="#"
              rel="prev"
              className="sr-only"
              tabIndex={-1}
              aria-hidden="true"
            >
              Newer posts
            </Link>
            {!isFetchingPreviousPage && (
              <PostListInfiniteTrigger
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
          <div
            className="hidden border-t border-separator lg:block lg:col-[4/5]"
            aria-hidden="true"
          ></div>
        </>
      )}
      {posts.map((post) => (
        <PostListItem key={post.slug} post={post} />
      ))}
      {hasNextPage && (
        <>
          <div
            className="hidden lg:border-t border-separator lg:block lg:col-[1/2]"
            aria-hidden="true"
          ></div>
          <div
            className="hidden border-x lg:border-t border-separator lg:block lg:col-[2/3]"
            aria-hidden="true"
          ></div>
          <div className="p-3 border-t border-separator lg:col-[3/4] leading-none text-sm">
            <Link
              href="#"
              rel="next"
              className="sr-only"
              tabIndex={-1}
              aria-hidden="true"
            >
              Older posts
            </Link>
            {!isFetchingNextPage && (
              <PostListInfiniteTrigger isNext onEndReached={fetchNextPage} />
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
          <div
            className="hidden border-t border-separator lg:block lg:col-[4/5]"
            aria-hidden="true"
          ></div>
        </>
      )}
    </>
  );
}
