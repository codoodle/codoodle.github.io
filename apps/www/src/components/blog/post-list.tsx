import { Blog, Category, Tag } from "@/content";
import {
  generateBlogCategoryJsonLd,
  generateBlogJsonLd,
  generateBlogTagJsonLd,
} from "@/lib/json-ld";
import { paginateBlogPost } from "@/lib/pagination";
import { getQueryClient } from "@/lib/query-client";
import { classNames } from "@codoodle/utils";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import PostListHero from "./post-list-hero";
import PostListInfinite from "./post-list-infinite";
import PostListTitle from "./post-list-title";

type BlogOrCategoryOrTag =
  | {
      blog: Blog;
      category?: never;
      tag?: never;
    }
  | {
      blog?: never;
      category: Category;
      tag?: never;
    }
  | {
      blog?: never;
      category?: never;
      tag: Tag;
    };

export default async function PostList({
  page,
  blog,
  category,
  tag,
}: {
  page: number;
} & BlogOrCategoryOrTag) {
  const { pageItems, pagePrev, pageNext } = paginateBlogPost(
    (blog ? blog.posts : category ? category.posts : tag.posts) ?? [],
    page,
  );
  const queryClient = getQueryClient();
  await queryClient.prefetchInfiniteQuery({
    queryKey: [
      "BLOG",
      blog ? undefined : category ? category.slug : tag.slug,
      "PAGINATION",
    ],
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
      {(blog || category || tag) && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              blog
                ? generateBlogJsonLd(blog)
                : category
                  ? generateBlogCategoryJsonLd(category)
                  : generateBlogTagJsonLd(tag),
            ),
          }}
        />
      )}
      {((blog && blog.ContentComponent) ||
        (category && category.ContentComponent)) && (
        <>
          <div className="hidden lg:block lg:col-[1/2] bg-[url(/images/pattern.svg)]"></div>
          <div className="hidden border-x border-separator lg:block lg:col-[2/3]"></div>
          <div
            className={classNames(
              "prose prose-sm dark:prose-invert max-w-none p-3 [&_h1]:leading-none lg:block lg:col-[3/4]",
              tag && "sr-only",
            )}
          >
            <PostListHero
              {...({ blog, category, tag } as BlogOrCategoryOrTag)}
            />
          </div>
        </>
      )}
      <div
        className={classNames(
          ((blog && blog.ContentComponent) ||
            (category && category.ContentComponent)) &&
            "border-t",
          "border-separator prose prose-sm dark:prose-invert max-w-none p-3 lg:col-[1/5]",
        )}
      >
        <PostListTitle {...({ blog, category, tag } as BlogOrCategoryOrTag)} />
      </div>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <PostListInfinite />
      </HydrationBoundary>
    </>
  );
}
