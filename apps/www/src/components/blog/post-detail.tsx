import * as MDXComponents from "@/components/mdx";
import { Post } from "@/content";
import {
  generateBlogPostJsonLd,
  generateBlogPostJsonLdBreadcrumb,
} from "@/lib/json-ld";
import Link from "next/link";
import PostMeta from "./post-meta";

export default function PostDetail({ post }: { post: Post }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateBlogPostJsonLd(post)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateBlogPostJsonLdBreadcrumb(post)),
        }}
      />
      <div className="text-xs max-lg:text-muted-foreground p-3 lg:col-[1/2]">
        <PostMeta post={post} />
      </div>
      <div
        className="hidden border-x border-separator lg:block lg:col-[2/3]"
        aria-hidden="true"
      ></div>
      <div className="prose prose-sm dark:prose-invert max-w-none p-3 [&_h1]:leading-none lg:block lg:col-[3/4]">
        <h1 className="leading-none text-2xl font-semibold">{post.title}</h1>
        <p className="text-gray-400 dark:text-gray-600">{post.description}</p>
      </div>
      <div
        className="hidden border-x border-separator lg:block lg:col-[2/3]"
        aria-hidden="true"
      ></div>
      <div className="prose prose-sm dark:prose-invert max-w-none p-3 [&_h1]:leading-none lg:block lg:col-[3/4]">
        <post.ContentComponent components={MDXComponents} />
        <footer>
          {post.tags && post.tags.length > 0 && (
            <ul
              aria-label="Tags"
              className="flex flex-wrap gap-x-2 m-0 p-0 list-none text-xs"
            >
              {post.tags.map((tag) => (
                <li key={tag.slug} className="p-0">
                  <Link
                    className="no-underline hover:underline text-muted-foreground"
                    href={`/blog/tags/${tag.slug}`}
                  >
                    #{tag.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {(post.prev || post.next) && (
            <nav className="flex justify-between gap-16 text-sm mt-12">
              {post.prev ? (
                <Link
                  href={`/blog/${post.prev.slug}`}
                  className="no-underline hover:underline text-muted-foreground text-left"
                >
                  ← {post.prev.title}
                </Link>
              ) : (
                <div />
              )}
              {post.next ? (
                <Link
                  href={`/blog/${post.next.slug}`}
                  className="no-underline hover:underline text-muted-foreground text-right"
                >
                  {post.next.title} →
                </Link>
              ) : (
                <div />
              )}
            </nav>
          )}
        </footer>
      </div>
    </>
  );
}
