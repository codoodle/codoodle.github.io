export function trimSlugPrefix(slug: string | string[], count: number): string {
  if (count <= 0) {
    return Array.isArray(slug) ? slug.join("/") : slug;
  }
  return (Array.isArray(slug) ? slug.filter((f) => !!f) : toSlugArray(slug))
    .slice(count)
    .join("/");
}

export function trimSlugSuffix(slug: string | string[], count: number): string {
  if (count <= 0) {
    return Array.isArray(slug) ? slug.join("/") : slug;
  }
  return (Array.isArray(slug) ? slug.filter((f) => !!f) : toSlugArray(slug))
    .slice(0, -count)
    .join("/");
}

export function concatSlug(slug: string | string[], ...add: string[]) {
  return [...(Array.isArray(slug) ? slug : toSlugArray(slug)), ...add]
    .filter((f) => !!f)
    .join("/");
}

export function toSlugArray(slug: string) {
  return slug.split("/").filter((f) => !!f);
}
