import { PostSimple } from "@/content";
import { format } from "date-fns";
import Link from "next/link";

export default function PostMeta({ post }: { post: PostSimple }) {
  return (
    <>
      <time dateTime={post.datePublished} className="leading-none uppercase">
        {format(post.datePublished, "LLL d, yyyy")}
      </time>
      {post.categories && post.categories.length > 0 && (
        <div className="inline-block ml-2 lg:block lg:ml-0 lg:mt-1">
          in{" "}
          {post.categories.map((category, i, arr) => (
            <span key={category.slug}>
              <Link href={`/blog/${category.slug}`}>{category.name}</Link>
              {i < arr.length - 1 && ", "}
            </span>
          ))}
        </div>
      )}
    </>
  );
}
