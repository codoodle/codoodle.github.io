import { PostSimple } from "@/content";
import Link from "next/link";
import PostMeta from "./post-meta";

export default function PostListItem({ post }: { post: PostSimple }) {
  return (
    <>
      <div className="text-xs max-lg:text-muted-foreground p-3 pb-0 border-t border-separator lg:col-[1/2]">
        <PostMeta post={post} />
      </div>
      <div
        className="hidden border-x lg:border-t border-separator lg:block lg:col-[2/3]"
        aria-hidden="true"
      ></div>
      <div className="prose prose-sm dark:prose-invert max-w-none p-3 border-separator lg:border-t lg:block lg:col-[3/4]">
        <h3 className="leading-none">
          <Link href={`/blog/${post.slug}`} className="no-underline">
            {post.title}
          </Link>
        </h3>
        <p>{post.description}</p>
      </div>
      <div
        className="hidden border-t border-separator lg:block lg:col-[4/5]"
        aria-hidden="true"
      ></div>
      <div className="group lg:col-[1/5] grid grid-cols-subgrid">
        <div
          className="hidden h-8 border-t border-separator lg:block lg:col-[1/2] group-last:hidden"
          aria-hidden="true"
        ></div>
        <div
          className="hidden h-8 border-t border-x border-separator lg:block lg:col-[2/3] group-last:hidden"
          aria-hidden="true"
        ></div>
        <div
          className="h-8 border-t border-separator lg:col-[3/5] group-last:hidden"
          aria-hidden="true"
        ></div>
      </div>
    </>
  );
}
