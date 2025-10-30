import { MetadataRoute } from "next";
import { blog, Post } from "../content";

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

  const mainPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: getLatestModifiedDate(blog.posts),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: getLatestModifiedDate(blog.posts),
      changeFrequency: "daily",
      priority: 0.9,
    },
    // {
    //   url: `${SITE_URL}/about`,
    //   lastModified: new Date(),
    //   changeFrequency: "monthly",
    //   priority: 0.8,
    // },
    // {
    //   url: `${SITE_URL}/projects`,
    //   lastModified: new Date(),
    //   changeFrequency: "monthly",
    //   priority: 0.8,
    // },
  ];

  return mainPages;
}
