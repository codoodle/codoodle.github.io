import * as MDXComponents from "@/components/mdx";
import { Blog, Category, Tag } from "@/content";

export default function PostListHero({
  blog,
  category,
  tag,
}:
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
    }) {
  return blog ? (
    blog.ContentComponent ? (
      <blog.ContentComponent components={MDXComponents} />
    ) : (
      <h1>#{blog.name}</h1>
    )
  ) : category ? (
    category.ContentComponent ? (
      <category.ContentComponent components={MDXComponents} />
    ) : (
      <h1>#{category.name}</h1>
    )
  ) : (
    <h1>#{tag.name}</h1>
  );
}
