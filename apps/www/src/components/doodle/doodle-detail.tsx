import * as MDXComponents from "@/components/mdx";
import { DoodleItem } from "@/content";
import {
  generateDoodleItemJsonLd,
  generateDoodleItemJsonLdBreadcrumb,
} from "@/lib/json-ld";
import Link from "next/link";

export default function DoodleDetail({ item }: { item: DoodleItem }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateDoodleItemJsonLd(item)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateDoodleItemJsonLdBreadcrumb(item)),
        }}
      />
      <div className="prose prose-sm dark:prose-invert max-w-none p-3 [&_h1]:leading-none">
        <h1 className="leading-none text-2xl font-semibold">{item.title}</h1>
        <p className="text-gray-400 dark:text-gray-600">{item.description}</p>
      </div>
      <div className="prose prose-sm dark:prose-invert max-w-none p-3">
        {item.ContentComponent && (
          <item.ContentComponent components={MDXComponents} />
        )}
        <footer>
          {item.tags && item.tags.length > 0 && (
            <ul
              aria-label="Tags"
              className="flex flex-wrap gap-x-2 m-0 p-0 list-none text-xs"
            >
              {item.tags.map((tag) => (
                <li key={tag.slug} className="p-0">
                  <Link
                    className="no-underline hover:underline text-muted-foreground"
                    href={`/doodles/tags/${tag.slug}`}
                  >
                    #{tag.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </footer>
      </div>
    </>
  );
}
