import { blog, Category, Post, PostSimple, Tag } from "@/content";
import { format } from "date-fns";
import {
  Blog as SchemaBlog,
  BlogPosting as SchemaBlogPosting,
  CollectionPage as SchemaCollectionPage,
  ListItem as SchemaListItem,
  WebSite as SchemaWebSite,
  WithContext as SchemaWithContext,
} from "schema-dts";

const SITE_URL =
  process.env.SITE_URL?.replace(/\/$/, "") ??
  (() => {
    throw new Error("SITE_URL env is required");
  })();

function generateSiteJsonLd(): SchemaWithContext<SchemaWebSite> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: blog.name,
    description: blog.description,
    url: SITE_URL,
  };
}

function generateBlogJsonLd(): SchemaWithContext<SchemaBlog> {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: blog.name,
    description: blog.description,
    url: `${SITE_URL}/blog`,
  };
}

function generateBlogCategoryJsonLd(
  category: Category,
  part?: (Post | PostSimple)[],
): SchemaWithContext<SchemaCollectionPage> {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: category.name,
    description: category.description,
    url: `${SITE_URL}/blog/${category.slug}`,
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
          name: blog.name,
          item: `${SITE_URL}/blog`,
        },
        ...(category.categories?.map<SchemaListItem>((category, i) => ({
          "@type": "ListItem",
          position: i + 3,
          name: category.name,
          item: `${SITE_URL}/blog/${category.slug}`,
        })) ?? []),
        {
          "@type": "ListItem",
          position: 3 + (category.categories?.length ?? 0),
          name: category.name,
          item: `${SITE_URL}/blog/${category.slug}`,
        },
      ],
    },
    hasPart: part?.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      datePublished: format(post.datePublished, "yyyy-MM-dd"),
      dateModified: format(post.dateModified, "yyyy-MM-dd"),
      url: `${SITE_URL}/blog/${post.slug}`,
      author: {
        "@type": "Person",
        name: post.author ?? "Codoodle",
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": `${SITE_URL}/blog/${post.slug}`,
      },
      articleSection: post.categories?.at(-1)?.name,
    })),
  };
}

function generateBlogTagJsonLd(
  tag: Tag,
  part?: (Post | PostSimple)[],
): SchemaWithContext<SchemaCollectionPage> {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `#${tag.name}`,
    url: `${SITE_URL}/blog/tags/${tag.slug}`,
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
          name: blog.name,
          item: `${SITE_URL}/blog`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: `#${tag.name}`,
          item: `${SITE_URL}/blog/tags/${tag.slug}`,
        },
      ],
    },
    hasPart: part?.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      datePublished: format(post.datePublished, "yyyy-MM-dd"),
      dateModified: format(post.dateModified, "yyyy-MM-dd"),
      url: `${SITE_URL}/blog/${post.slug}`,
      author: {
        "@type": "Person",
        name: post.author ?? "Codoodle",
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": `${SITE_URL}/blog/${post.slug}`,
      },
      articleSection: post.categories?.at(-1)?.name,
    })),
  };
}

function generateBlogPostJsonLd(
  post: Post | PostSimple,
): SchemaWithContext<SchemaBlogPosting> {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: format(post.datePublished, "yyyy-MM-dd"),
    dateModified: format(post.dateModified, "yyyy-MM-dd"),
    url: `${SITE_URL}/blog/${post.slug}`,
    author: {
      "@type": "Person",
      name: post.author ?? "Codoodle",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/${post.slug}`,
    },
    articleSection: post.categories?.at(-1)?.name,
  };
}

function generateBlogPostJsonLdBreadcrumb(
  post: Post | PostSimple,
): SchemaWithContext<{
  "@type": "BreadcrumbList";
  itemListElement: SchemaListItem[];
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
      {
        "@type": "ListItem",
        position: 2,
        name: blog.name,
        item: `${SITE_URL}/blog`,
      },
      ...(post.categories?.map<SchemaListItem>((category, i) => ({
        "@type": "ListItem",
        position: i + 3,
        name: category.name,
        item: `${SITE_URL}/blog/${category.slug}`,
      })) ?? []),
      {
        "@type": "ListItem",
        position: 3 + (post.categories?.length ?? 0),
        name: post.title,
        item: `${SITE_URL}/blog/${post.slug}`,
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
  generateSiteJsonLd,
};
