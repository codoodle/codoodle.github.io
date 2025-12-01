import { DoodleItem } from "@/content";
import Link from "next/link";

export default function DoodleListItem({ item }: { item: DoodleItem }) {
  return (
    <>
      <div className="prose prose-sm dark:prose-invert max-w-none p-3">
        <h3 className="leading-none">
          <Link href={`/doodles/${item.slug}`} className="no-underline">
            {item.title}
          </Link>
        </h3>
        <p>{item.description}</p>
      </div>
      <div className="h-8 border-y border-separator last:hidden"></div>
    </>
  );
}
