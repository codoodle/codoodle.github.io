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
  doodleitem as doodleItems,
  doodle as doodles,
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
for (const doodle of doodles) {
  doodle.slug = trimSlugPrefix(doodle.slug, 1) || "";
}
for (const doodleItem of doodleItems) {
  doodleItem.slug = trimSlugPrefix(doodleItem.slug, 1) || "";
}

export type Tag = {
  name: string;
  slug: string;
  posts: Post[];
  doodleItems: DoodleItem[];
};

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

export type Doodle = {
  name: string;
  description?: string;
  items: DoodleItem[];
  tags: Tag[];
  ContentComponent?: MDXContent;
};

export type DoodleItem = {
  title: string;
  description: string;
  datePublished: string;
  dateModified: string;
  author: string;
  slug: string;
  tags?: Pick<Tag, "name" | "slug">[];
  ContentComponent?: MDXContent;
};

const tagMap = new Map<string, Tag>();

posts.sort((a, b) => compareDesc(a.datePublished, b.datePublished));
for (const post of posts as Post[]) {
  if (post.tags) {
    for (const tag of post.tags) {
      if (tagMap.has(tag.slug)) {
        tagMap.get(tag.slug)!.posts.push(post);
      } else {
        tagMap.set(tag.slug, {
          ...tag,
          posts: [post],
          doodleItems: [],
        });
      }
    }
  }
}

doodleItems.sort((a, b) => compareDesc(a.datePublished, b.datePublished));
for (const doodleItem of doodleItems as DoodleItem[]) {
  if (doodleItem.tags) {
    for (const tag of doodleItem.tags) {
      if (tagMap.has(tag.slug)) {
        tagMap.get(tag.slug)!.doodleItems.push(doodleItem);
      } else {
        tagMap.set(tag.slug, {
          ...tag,
          posts: [],
          doodleItems: [doodleItem],
        });
      }
    }
  }
}

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

export const doodle = {
  ...doodles[0],
  items: doodleItems as DoodleItem[],
  tags,
};

export function resolveContentBySlug(
  target: "blog",
  slug?: string | string[],
):
  | {
      tag: Tag;
      category?: undefined;
      post?: undefined;
      blog?: undefined;
    }
  | {
      category: Category;
      tag?: undefined;
      post?: undefined;
      blog?: undefined;
    }
  | {
      post: Post;
      tag?: undefined;
      category?: undefined;
      blog?: undefined;
    }
  | {
      blog: Blog;
      tag?: undefined;
      category?: undefined;
      post?: undefined;
    };
export function resolveContentBySlug(
  target: "doodle",
  slug?: string | string[],
):
  | {
      tag: Tag;
      item?: undefined;
      doodle?: undefined;
    }
  | {
      item: DoodleItem;
      tag?: undefined;
      doodle?: undefined;
    }
  | {
      doodle: Doodle;
      tag?: undefined;
      item?: undefined;
    };
export function resolveContentBySlug(
  target: "blog" | "doodle",
  slug?: string | string[],
):
  | {
      tag: Tag;
      category?: undefined;
      post?: undefined;
      blog?: undefined;
    }
  | {
      category: Category;
      tag?: undefined;
      post?: undefined;
      blog?: undefined;
    }
  | {
      post: Post;
      tag?: undefined;
      category?: undefined;
      blog?: undefined;
    }
  | {
      blog: Blog;
      tag?: undefined;
      category?: undefined;
      post?: undefined;
    }
  | {
      tag: Tag;
      item?: undefined;
      doodle?: undefined;
    }
  | {
      item: DoodleItem;
      tag?: undefined;
      doodle?: undefined;
    }
  | {
      doodle: Doodle;
      tag?: undefined;
      item?: undefined;
    } {
  if (target !== "blog" && target !== "doodle") {
    throw new Error(`Only "blog" or "doodle" target is supported.`);
  }

  if (target === "doodle") {
    if (slug && slug.length > 0) {
      const s = Array.isArray(slug) ? concatSlug(slug) : slug;
      const isTags = s.startsWith("tags/");
      if (isTags) {
        const tag = doodle.tags.find((f) => `tags/${f.slug}` === s);
        if (tag) {
          return {
            tag,
          };
        }
      }
      const item = doodle.items.find((f) => f.slug === s);
      if (item) {
        return {
          item,
        };
      }
    }
    return {
      doodle,
    };
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
