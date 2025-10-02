import PostDetail from "@/components/blog/post-detail";
import PostList from "@/components/blog/post-list";
import { blog, resolveContentBySlug } from "@/content";
import { toSlugArray } from "@codoodle/utils";
import { Metadata } from "next";
import { redirect } from "next/navigation";

const SITE_URL =
  process.env.SITE_URL?.replace(/\/$/, "") ??
  (() => {
    throw new Error("SITE_URL env is required");
  })();
const PAGE_SIZE = parseInt(process.env.PAGE_SIZE || "5", 10);
const BLOG_NAME = blog.name;
const BLOG_DESCRIPTION = blog.description;

export const dynamicParams = false;

export function generateStaticParams() {
  const { categories, posts, tags } = blog;
  return [
    {
      slug: undefined,
    },
    ...Array.from({ length: Math.ceil(posts.length / PAGE_SIZE) }, (_, i) => ({
      slug: ["page", `${i + 1}`],
    })),
    ...categories.reduce(
      (acc, category) => {
        acc.push({
          slug: toSlugArray(category.slug),
        });
        acc.push(
          ...Array.from(
            { length: Math.ceil((category.posts?.length ?? 0) / PAGE_SIZE) },
            (_, i) => ({
              slug: toSlugArray(category.slug).concat(["page", `${i + 1}`]),
            }),
          ),
        );
        return acc;
      },
      [] as { slug: string[] }[],
    ),
    ...tags.reduce(
      (acc, tag) => {
        acc.push({
          slug: ["tags"].concat(toSlugArray(tag.slug)),
        });
        acc.push(
          ...Array.from(
            { length: Math.ceil((tag.posts?.length ?? 0) / PAGE_SIZE) },
            (_, i) => ({
              slug: ["tags"].concat(
                toSlugArray(tag.slug).concat(["page", `${i + 1}`]),
              ),
            }),
          ),
        );
        return acc;
      },
      [] as { slug: string[] }[],
    ),
    ...posts.map((post) => ({
      slug: toSlugArray(post.slug),
    })),
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> {
  const { slug: slugArray } = await params;
  const isPagination =
    slugArray &&
    slugArray.at(-2) === "page" &&
    /^\d+$/.test(slugArray.at(-1) ?? "");
  const page = isPagination ? Number(slugArray.at(-1)) || 1 : 1;
  const slugWithoutPagination = isPagination
    ? slugArray.slice(0, -2).join("/")
    : slugArray?.join("/");

  const { category, tag, post } = resolveContentBySlug(
    "blog",
    slugWithoutPagination,
  );
  if (category) {
    return {
      metadataBase: new URL(SITE_URL),
      title: `${category.name} | ${BLOG_NAME}`,
      description: category.description,
      robots: {
        index: true,
        follow: true,
      },
      openGraph: {
        title: `${category.name} | ${BLOG_NAME}`,
        description: category.description,
        type: "website",
        url: `/blog/${category.slug}`,
        images: {
          url: `/blog/opengraph/${slugWithoutPagination}/image`,
          alt: `${category.name} | ${BLOG_NAME}`,
        },
      },
      alternates: {
        canonical: `/blog/${category.slug}${page > 1 ? `/page/${page}` : ""}`,
      },
    };
  }
  if (tag) {
    return {
      metadataBase: new URL(SITE_URL),
      title: `#${tag.name} | ${BLOG_NAME}`,
      robots: {
        index: true,
        follow: true,
      },
      openGraph: {
        title: `#${tag.name} | ${BLOG_NAME}`,
        type: "website",
        url: `/blog/tags/${tag.slug}`,
        images: {
          url: `/blog/opengraph/${slugWithoutPagination}/image`,
          alt: `#${tag.name} | ${BLOG_NAME}`,
        },
      },
      alternates: {
        canonical: `/blog/tags/${tag.slug}${page > 1 ? `/page/${page}` : ""}`,
      },
    };
  }
  if (post) {
    return {
      metadataBase: new URL(SITE_URL),
      authors: [
        {
          name: post.author ?? "Codoodle",
        },
      ],
      title: `${post.title} | ${BLOG_NAME}`,
      description: post.description,
      robots: {
        index: true,
        follow: true,
      },
      openGraph: {
        title: `${post.title} | ${BLOG_NAME}`,
        description: post.description,
        type: "article",
        url: `/blog/${post.slug}`,
        images: {
          url: `/blog/opengraph/${slugWithoutPagination}/image`,
          alt: `${post.title} | ${BLOG_NAME}`,
        },
      },
      alternates: {
        canonical: `/blog/${post.slug}`,
      },
      keywords: post.tags?.map((tag) => tag.name),
    };
  }
  return {
    metadataBase: new URL(SITE_URL),
    title: BLOG_NAME,
    description: BLOG_DESCRIPTION,
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: BLOG_NAME,
      description: BLOG_DESCRIPTION,
      type: "website",
      url: "/",
      images: {
        url: `/blog/opengraph/image`,
        alt: BLOG_NAME,
      },
    },
    alternates: {
      canonical: `/blog/${page > 1 ? `page/${page}` : ""}`,
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug: slugArray } = await params;
  const isPagination =
    slugArray &&
    slugArray.at(-2) === "page" &&
    /^\d+$/.test(slugArray.at(-1) ?? "");
  const page = isPagination ? Number(slugArray.at(-1)) || 1 : 1;
  const slugWithoutPagination = isPagination
    ? slugArray.slice(0, -2).join("/")
    : slugArray?.join("/");

  if (isPagination && page === 1) {
    redirect(`/blog/${slugWithoutPagination}`);
  }
  const { blog, category, tag, post } = resolveContentBySlug(
    "blog",
    slugWithoutPagination,
  );

  return (
    <div className="lg:col-[1/5] lg:grid grid-cols-subgrid">
      {blog ? (
        <PostList page={page} blog={blog} />
      ) : category ? (
        <PostList page={page} category={category} />
      ) : tag ? (
        <PostList page={page} tag={tag} />
      ) : post ? (
        <PostDetail post={post} />
      ) : undefined}
    </div>
  );
}
