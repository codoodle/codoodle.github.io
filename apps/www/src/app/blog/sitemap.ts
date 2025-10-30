import { MetadataRoute } from "next";
import { blog, Post } from "../../content";

const SITE_URL =
  process.env.SITE_URL?.replace(/\/$/, "") ??
  (() => {
    throw new Error("SITE_URL env is required");
  })();

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const getLatestModifiedDate = (posts: Post[]) => {
    if (posts.length === 0) {
      return new Date();
    }

    const latestPost = posts.reduce((latest, current) => {
      const currentDate = new Date(
        current.dateModified || current.datePublished,
      );
      const latestDate = new Date(latest.dateModified || latest.datePublished);
      return currentDate > latestDate ? current : latest;
    });

    return new Date(latestPost.dateModified || latestPost.datePublished);
  };

  const blogMainPage: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/blog`,
      lastModified: getLatestModifiedDate(blog.posts),
      changeFrequency: "daily",
      priority: 1,
    },
  ];

  const categoryPages: MetadataRoute.Sitemap = blog.categories.map(
    (category) => {
      return {
        url: `${SITE_URL}/blog/${category.slug}`,
        lastModified: getLatestModifiedDate(category.posts ?? []),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      };
    },
  );

  const postPages: MetadataRoute.Sitemap = blog.posts.map((post, index) => {
    const totalPosts = blog.posts.length;
    const priorityScore = Math.max(0.5, 0.9 - (index / totalPosts) * 0.4);

    return {
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: new Date(post.dateModified || post.datePublished),
      changeFrequency: "monthly" as const,
      priority: Number(priorityScore.toFixed(1)),
    };
  });

  const tagPages: MetadataRoute.Sitemap = blog.tags.map((tag) => ({
    url: `${SITE_URL}/blog/tags/${tag.slug}`,
    lastModified: getLatestModifiedDate(tag.posts),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...blogMainPage, ...categoryPages, ...postPages, ...tagPages];
}
