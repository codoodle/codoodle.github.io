import { Doodle, Tag } from "@/content";

export default function DoodleListTitle({
  doodle,
  tag,
}:
  | {
      doodle: Doodle;
      tag?: never;
    }
  | {
      doodle?: never;
      tag: Tag;
    }) {
  return (
    <h2 className="uppercase">
      {doodle ? doodle.description : `Doodles in “#${tag.name}”`}
    </h2>
  );
}
