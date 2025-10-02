import { Blog, Category, Tag } from "@/content";

export default function PostListTitle({
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
  return (
    <h2 className="uppercase">
      {blog
        ? "Latest Posts"
        : category
          ? `Posts in “${category.name}”`
          : `Posts in “#${tag.name}”`}
    </h2>
  );
}
