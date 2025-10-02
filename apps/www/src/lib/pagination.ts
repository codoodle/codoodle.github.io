import { PostSimple } from "@/content";

const PAGE_SIZE = parseInt(process.env.PAGE_SIZE || "5", 10);

export function paginate<T>(
  items: T[],
  page: number,
  itemsPerPage = PAGE_SIZE,
): T[] {
  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return items.slice(start, end);
}

export function paginateBlogPost(pageSources: PostSimple[], page: number) {
  const pageCount = Math.ceil(pageSources.length / PAGE_SIZE);
  const pagePrev = page > 1 ? page - 1 : undefined;
  const pageNext = page < pageCount ? page + 1 : undefined;
  const pageItems = paginate(pageSources, page, PAGE_SIZE).map<PostSimple>(
    ({
      title,
      description,
      datePublished,
      dateModified,
      author,
      slug,
      categories,
    }) => ({
      title,
      description,
      datePublished,
      dateModified,
      author,
      slug,
      categories: categories?.map(({ name, description, slug }) => ({
        name,
        description,
        slug,
      })),
    }),
  );
  return {
    pageItems,
    pagePrev,
    pageNext,
  };
}
