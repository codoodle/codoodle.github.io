import remarkAlerts from "@codoodle/remark-alerts";
import rehypeMermaid from "rehype-mermaid";
import rehypePrettyCode from "rehype-pretty-code";
import remarkGfm from "remark-gfm";

/**
 * @type {import("@codoodle/mdx").MdxConfig}
 */
export default {
  content: {
    "blog/index.md{,x}": {
      name: "Blog",
      output: "blog",
      frontmatter: {
        name: {
          type: "string",
          required: true,
        },
        description: {
          type: "string",
        },
      },
    },
    "blog/**/index.md{,x}": {
      name: "Category",
      output: "blog/categories",
      frontmatter: {
        name: {
          type: "string",
          required: true,
        },
        description: {
          type: "string",
        },
      },
    },
    "blog/**/*.md{,x}": {
      name: "Post",
      output: "blog/posts",
      frontmatter: {
        title: {
          type: "string",
          required: true,
        },
        description: {
          type: "string",
        },
        datePublished: {
          type: "date",
          required: true,
        },
        dateModified: {
          type: "date",
        },
        author: {
          type: "string",
        },
        tags: {
          type: "array",
          fields: {
            slug: {
              type: "string",
              required: true,
            },
            name: {
              type: "string",
              required: true,
            },
          },
        },
        prev: {
          type: "object",
          fields: {
            slug: {
              type: "string",
              required: true,
            },
            title: {
              type: "string",
            },
          },
        },
        next: {
          type: "object",
          fields: {
            slug: {
              type: "string",
              required: true,
            },
            title: {
              type: "string",
            },
          },
        },
      },
    },
    "doodle/index.md{,x}": {
      name: "Doodle",
      output: "doodle",
      frontmatter: {
        name: {
          type: "string",
          required: true,
        },
        description: {
          type: "string",
        },
      },
    },
    "doodle/**/*.md{,x}": {
      name: "DoodleItem",
      output: "doodle/items",
      frontmatter: {
        title: {
          type: "string",
          required: true,
        },
        description: {
          type: "string",
        },
        datePublished: {
          type: "date",
          required: true,
        },
        dateModified: {
          type: "date",
        },
        author: {
          type: "string",
        },
        tags: {
          type: "array",
          fields: {
            slug: {
              type: "string",
              required: true,
            },
            name: {
              type: "string",
              required: true,
            },
          },
        },
      },
    },
  },
  contentCompileOptions: {
    jsx: true,
    remarkPlugins: [remarkGfm, remarkAlerts],
    rehypePlugins: [
      rehypeMermaid,
      [
        rehypePrettyCode,
        {
          theme: {
            light: "material-theme-lighter",
            dark: "material-theme-darker",
          },
        },
      ],
    ],
  },
};
