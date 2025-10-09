import {
  concatSlug,
  toSlugArray,
  trimSlugPrefix,
  trimSlugSuffix,
} from "@codoodle/utils";
import { compareDesc } from "date-fns";
import { MDXContent } from "mdx/types";
import {
  blog as blogs,
  category as categories,
  post as posts,
} from "../.codoodle-mdx";

for (const blog of blogs) {
  blog.slug = trimSlugPrefix(blog.slug, 1) || "";
}
for (const category of categories) {
  category.slug = trimSlugPrefix(category.slug, 1) || "";
}
for (const post of posts) {
  post.slug = trimSlugPrefix(post.slug, 1) || "";
}

export type Blog = {
  name: string;
  description: string;
  categories: Category[];
  posts: Post[];
  tags: Tag[];
  ContentComponent?: MDXContent;
};

export type Category = {
  name: string;
  description: string;
  slug: string;
  categories?: Category[];
  posts?: Post[];
  ContentComponent?: MDXContent;
};

export type Tag = {
  name: string;
  slug: string;
  posts: Post[];
};

export type Post = {
  title: string;
  description: string;
  datePublished: string;
  dateModified: string;
  author: string;
  slug: string;
  tags?: Pick<Tag, "name" | "slug">[];
  categories?: Category[];
  categorySlug?: string;
  ContentComponent: MDXContent;
  prev?: {
    slug: string;
    title: string;
  };
  next?: {
    slug: string;
    title: string;
  };
};

export type PostSimple = {
  title: string;
  description: string;
  datePublished: string;
  dateModified: string;
  author: string;
  slug: string;
  categories?: {
    name: string;
    description: string;
    slug: string;
  }[];
};

const tagMap = new Map<string, Tag>();

for (const post of posts as Post[]) {
  if (post.tags) {
    for (const tag of post.tags) {
      if (tagMap.has(tag.slug)) {
        tagMap.get(tag.slug)!.posts.push(post);
      } else {
        tagMap.set(tag.slug, { ...tag, posts: [post] });
      }
    }
  }
}

posts.sort((a, b) => compareDesc(a.datePublished, b.datePublished));
for (const post of posts as Post[]) {
  if ((post.categorySlug = trimSlugSuffix(post.slug, 1) || undefined)) {
    post.categories = getCategories(post.categorySlug);
  }
  if (post.prev) {
    post.prev.title =
      posts.find((p) => p.slug === post.prev!.slug)?.title ?? "";
  }
  if (post.next) {
    post.next.title =
      posts.find((p) => p.slug === post.next!.slug)?.title ?? "";
  }
}

for (const category of categories as Category[]) {
  category.categories = getCategories(trimSlugSuffix(category.slug, 1));
  category.posts = (posts as Post[])
    .filter(
      ({ categorySlug }) =>
        categorySlug === category.slug ||
        categorySlug?.startsWith(`${category.slug}/`),
    )
    .sort((a, b) => compareDesc(a.datePublished, b.datePublished));
}

const tags = Array.from(tagMap.values());
for (const tag of tags) {
  tag.posts.sort((a, b) => compareDesc(a.datePublished, b.datePublished));
}

function getCategories(slug: string | string[]) {
  const ancestors: Category[] = [];
  const slugArray = Array.isArray(slug)
    ? [...slug.filter((f) => !!f)]
    : toSlugArray(slug);
  while (slugArray.length > 0) {
    const parentSlug = concatSlug(slugArray);
    const parent = categories.find((f) => f.slug === parentSlug) as
      | Category
      | undefined;
    if (parent) {
      ancestors.unshift(parent);
    }
    slugArray.pop();
  }
  if (ancestors.length > 0) {
    return ancestors;
  }
}

export const blog = {
  ...blogs[0],
  categories,
  posts,
  tags,
} as Blog;

export function resolveContentBySlug(target: "blog", slug?: string | string[]) {
  if (target !== "blog") {
    throw new Error(`Only "blog" target is supported.`);
  }

  if (slug && slug.length > 0) {
    const s = Array.isArray(slug) ? concatSlug(slug) : slug;
    const isTags = s.startsWith("tags/");
    if (isTags) {
      const tag = blog.tags.find((f) => `tags/${f.slug}` === s);
      if (tag) {
        return {
          tag,
        };
      }
    }
    const category = blog.categories.find((f) => f.slug === s);
    if (category) {
      return {
        category,
      };
    }
    const post = blog.posts.find((f) => f.slug === s);
    if (post) {
      return {
        post,
      };
    }
  }
  return {
    blog,
  };
}
