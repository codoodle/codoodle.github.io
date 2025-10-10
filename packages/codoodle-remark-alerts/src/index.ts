import octicons from "@primer/octicons";
import { fromHtml } from "hast-util-from-html";
import { select } from "hast-util-select";
import { Blockquote, Paragraph, Root, Text } from "mdast";
import type { MdxJsxTextElement } from "mdast-util-mdx-jsx";
import { toHast } from "mdast-util-to-hast";
import type {
  Handler,
  MdastParents,
  State,
} from "mdast-util-to-hast/lib/state";
import { visit } from "unist-util-visit";

type ElementContent = Exclude<
  Exclude<Blockquote["data"], undefined>["hChildren"],
  undefined
>[number];

type Element = Extract<ElementContent, { type: "element" }>;

type ElementProperties = Element["properties"];

export type AlertType =
  | "NOTE"
  | "TIP"
  | "IMPORTANT"
  | "WARNING"
  | "CAUTION"
  | string;

const noteIcon = select("body", fromHtml(octicons.info.toSVG()))
  ?.children[0] ?? {
  type: "text",
  value: "Note",
};
const tipIcon = select("body", fromHtml(octicons["light-bulb"].toSVG()))
  ?.children[0] ?? {
  type: "text",
  value: "Tip",
};
const importantIcon = select("body", fromHtml(octicons.report.toSVG()))
  ?.children[0] ?? {
  type: "text",
  value: "Important",
};
const warningIcon = select("body", fromHtml(octicons.alert.toSVG()))
  ?.children[0] ?? {
  type: "text",
  value: "Warning",
};
const cautionIcon = select("body", fromHtml(octicons.stop.toSVG()))
  ?.children[0] ?? {
  type: "text",
  value: "Caution",
};

export default function remarkAlerts(options: { types?: AlertType[] }) {
  const defaultTypes = ["NOTE", "TIP", "IMPORTANT", "WARNING", "CAUTION"];
  const types = Array.from(
    new Set(
      [...defaultTypes, ...(options?.types ?? [])].map((t) =>
        String(t).toUpperCase(),
      ),
    ),
  );
  const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const ALERTS_REGEX = new RegExp(
    "^\\s*\\[!(" + types.map(escapeRegExp).join("|") + ")\\](.*)",
    "i",
  );

  return (tree: Root) => {
    function mdxJsxTextElementHandler(
      _state: State,
      node: MdxJsxTextElement,
      _parent: MdastParents,
    ) {
      return {
        type: "element",
        tagName: node.name!,
        properties: node.attributes
          ?.filter(
            (attr): attr is Extract<typeof attr, { name: string }> =>
              typeof attr === "object" &&
              attr !== null &&
              "name" in attr &&
              typeof attr.name === "string",
          )
          .reduce((props: ElementProperties, attr) => {
            if (attr.name && attr.value) {
              const value =
                typeof attr.value === "string"
                  ? attr.value
                  : String(attr.value);
              props[attr.name] = value;
            }
            return props;
          }, {} as ElementProperties),
        children: node.children.map(
          (c) =>
            toHast(c, {
              handlers: {
                mdxJsxTextElement: mdxJsxTextElementHandler as Handler,
              },
            }) as ElementContent,
        ),
      } satisfies ElementContent;
    }

    visit(tree, "blockquote", (node) => {
      const child = node.children?.[0] as Paragraph | undefined;
      const childChild = child?.children?.[0] as Text | undefined;
      if (child?.type === "paragraph" && childChild?.type === "text") {
        const match = ALERTS_REGEX.exec(childChild.value);
        if (match) {
          const type = match[1].toLowerCase();
          const title = match[2].trimStart();
          const titleRight = childChild.value
            .replace(ALERTS_REGEX, "")
            .trimStart();
          node.data = {
            ...node.data,
            hName: "div",
            hProperties: {
              className: `alerts alerts-${type}`,
            },
            hChildren: [
              {
                type: "element",
                tagName: "p",
                properties: {
                  className: "alerts-title",
                },
                children: [
                  type === "note"
                    ? noteIcon
                    : type === "tip"
                      ? tipIcon
                      : type === "important"
                        ? importantIcon
                        : type === "warning"
                          ? warningIcon
                          : type === "caution"
                            ? cautionIcon
                            : {
                                type: "text",
                                value: type,
                              },
                  {
                    type: "text",
                    value: title || type,
                  },
                  ...(titleRight.length > 0
                    ? [
                        {
                          type: "text",
                          value: " " + titleRight,
                        } satisfies ElementContent,
                      ]
                    : []),
                  ...(child.children.length > 1
                    ? child.children.slice(1).map(
                        (c) =>
                          toHast(c, {
                            handlers: {
                              mdxJsxTextElement:
                                mdxJsxTextElementHandler as Handler,
                            },
                          }) as ElementContent,
                      )
                    : []),
                ],
              },
              ...node.children
                .slice(1)
                .filter((c) => c.type === "paragraph")
                .map(
                  (c) =>
                    ({
                      type: "element",
                      tagName: "p",
                      properties: {},
                      children: c.children.map(
                        (c) =>
                          toHast(c, {
                            handlers: {
                              mdxJsxTextElement:
                                mdxJsxTextElementHandler as Handler,
                            },
                          }) as ElementContent,
                      ),
                    }) satisfies ElementContent,
                ),
            ],
          };
        }
      }
    });
  };
}
