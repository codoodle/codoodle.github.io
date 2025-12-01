import DoodleDetail from "@/components/doodle/doodle-detail";
import DoodleList from "@/components/doodle/doodle-list";
import { doodle, resolveContentBySlug } from "@/content";
import { toSlugArray } from "@codoodle/utils";
import { Metadata } from "next";
import { redirect } from "next/navigation";

const SITE_URL =
  process.env.SITE_URL?.replace(/\/$/, "") ??
  (() => {
    throw new Error("SITE_URL env is required");
  })();
const PAGE_SIZE = parseInt(process.env.PAGE_SIZE || "5", 10);
const DOODLE_NAME = doodle.name;
const DOODLE_DESCRIPTION = doodle.description;

export const dynamicParams = false;

export function generateStaticParams() {
  const { items, tags } = doodle;
  return [
    {
      slug: undefined,
    },
    ...Array.from({ length: Math.ceil(items.length / PAGE_SIZE) }, (_, i) => ({
      slug: ["page", `${i + 1}`],
    })),
    ...tags.reduce(
      (acc, tag) => {
        acc.push({
          slug: ["tags"].concat(toSlugArray(tag.slug)),
        });
        acc.push(
          ...Array.from(
            { length: Math.ceil((tag.doodleItems?.length ?? 0) / PAGE_SIZE) },
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
    ...items.map((item) => ({
      slug: toSlugArray(item.slug),
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

  const { tag, item } = resolveContentBySlug("doodle", slugWithoutPagination);

  if (tag) {
    return {
      metadataBase: new URL(SITE_URL),
      title: `#${tag.name} | ${DOODLE_NAME}`,
      robots: {
        index: true,
        follow: true,
      },
      openGraph: {
        title: `#${tag.name} | ${DOODLE_NAME}`,
        type: "website",
        url: `/doodles/tags/${tag.slug}`,
        images: {
          url: `/doodles/opengraph/${slugWithoutPagination}/image`,
          alt: `#${tag.name} | ${DOODLE_NAME}`,
        },
      },
      alternates: {
        canonical: `/doodles/tags/${tag.slug}${page > 1 ? `/page/${page}` : ""}`,
      },
    };
  }
  if (item) {
    return {
      metadataBase: new URL(SITE_URL),
      authors: [
        {
          name: item.author ?? "Codoodle",
        },
      ],
      title: `${item.title} | ${DOODLE_NAME}`,
      description: item.description,
      robots: {
        index: true,
        follow: true,
      },
      openGraph: {
        title: `${item.title} | ${DOODLE_NAME}`,
        description: item.description,
        type: "article",
        url: `/doodles/${item.slug}`,
        images: {
          url: `/doodles/opengraph/${slugWithoutPagination}/image`,
          alt: `${item.title} | ${DOODLE_NAME}`,
        },
      },
      alternates: {
        canonical: `/doodles/${item.slug}`,
      },
      keywords: item.tags?.map((tag) => tag.name),
    };
  }
  return {
    metadataBase: new URL(SITE_URL),
    title: DOODLE_NAME,
    description: DOODLE_DESCRIPTION,
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: DOODLE_NAME,
      description: DOODLE_DESCRIPTION,
      type: "website",
      url: "/",
      images: {
        url: `/doodles/opengraph/image`,
        alt: DOODLE_NAME,
      },
    },
    alternates: {
      canonical: `/doodles/${page > 1 ? `page/${page}` : ""}`,
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
    redirect(`/doodles/${slugWithoutPagination}`);
  }
  const { doodle, tag, item } = resolveContentBySlug(
    "doodle",
    slugWithoutPagination,
  );

  return (
    <>
      {doodle ? (
        <DoodleList page={page} doodle={doodle} />
      ) : tag ? (
        <DoodleList page={page} tag={tag} />
      ) : item ? (
        <DoodleDetail item={item} />
      ) : undefined}
    </>
  );
}
