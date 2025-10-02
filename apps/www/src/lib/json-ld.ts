import { Blog, Category, Post, PostSimple, Tag } from "@/content";
import { format } from "date-fns";
import {
  BlogPosting,
  CollectionPage,
  ListItem,
  WebSite,
  WithContext,
} from "schema-dts";

const SITE_URL =
  process.env.SITE_URL?.replace(/\/$/, "") ??
  (() => {
    throw new Error("SITE_URL env is required");
  })();

function generateBlogJsonLd(blog: Blog): WithContext<WebSite> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: blog.name,
    description: blog.description,
    url: SITE_URL,
  };
}

function generateBlogCategoryJsonLd(
  category: Category,
  part?: (Post | PostSimple)[],
): WithContext<CollectionPage> {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: category.name,
    description: category.description,
    url: `${SITE_URL}/${category.slug}`,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: SITE_URL,
        },
        ...(category.categories?.map<ListItem>((category, i) => ({
          "@type": "ListItem",
          position: i + 2,
          name: category.name,
          item: `${SITE_URL}/${category.slug}`,
        })) ?? []),
        {
          "@type": "ListItem",
          position: 2 + (category.categories?.length ?? 0),
          name: category.name,
          item: `${SITE_URL}/${category.slug}`,
        },
      ],
    },
    hasPart: part?.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      datePublished: format(post.datePublished, "yyyy-MM-dd"),
      dateModified: format(post.dateModified, "yyyy-MM-dd"),
      url: `${SITE_URL}/${post.slug}`,
      author: {
        "@type": "Person",
        name: post.author ?? "Codoodle",
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": `${SITE_URL}/${post.slug}`,
      },
      articleSection: post.categories?.at(-1)?.name,
    })),
  };
}

function generateBlogTagJsonLd(
  tag: Tag,
  part?: (Post | PostSimple)[],
): WithContext<CollectionPage> {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `#${tag.name}`,
    url: `${SITE_URL}/tags/${tag.slug}`,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: SITE_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: `#${tag.name}`,
          item: `${SITE_URL}/tags/${tag.slug}`,
        },
      ],
    },
    hasPart: part?.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      datePublished: format(post.datePublished, "yyyy-MM-dd"),
      dateModified: format(post.dateModified, "yyyy-MM-dd"),
      url: `${SITE_URL}/${post.slug}`,
      author: {
        "@type": "Person",
        name: post.author ?? "Codoodle",
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": `${SITE_URL}/${post.slug}`,
      },
      articleSection: post.categories?.at(-1)?.name,
    })),
  };
}

function generateBlogPostJsonLd(
  post: Post | PostSimple,
): WithContext<BlogPosting> {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: format(post.datePublished, "yyyy-MM-dd"),
    dateModified: format(post.dateModified, "yyyy-MM-dd"),
    url: `${SITE_URL}/${post.slug}`,
    author: {
      "@type": "Person",
      name: post.author ?? "Codoodle",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/${post.slug}`,
    },
    articleSection: post.categories?.at(-1)?.name,
  };
}

function generateBlogPostJsonLdBreadcrumb(
  post: Post | PostSimple,
): WithContext<{
  "@type": "BreadcrumbList";
  itemListElement: ListItem[];
}> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      ...(post.categories?.map<ListItem>((category, i) => ({
        "@type": "ListItem",
        position: i + 2,
        name: category.name,
        item: `${SITE_URL}/${category.slug}`,
      })) ?? []),
      {
        "@type": "ListItem",
        position: 2 + (post.categories?.length ?? 0),
        name: post.title,
        item: `${SITE_URL}/${post.slug}`,
      },
    ],
  };
}

export {
  generateBlogCategoryJsonLd,
  generateBlogJsonLd,
  generateBlogPostJsonLd,
  generateBlogPostJsonLdBreadcrumb,
  generateBlogTagJsonLd,
};
