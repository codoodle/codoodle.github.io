import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { cpus } from "node:os";
import { dirname, relative, resolve } from "node:path";

import { compile, CompileOptions } from "@mdx-js/mdx";
import chokidar from "chokidar";
import { globby } from "globby";
import matter from "gray-matter";
import * as yaml from "js-yaml";
import pMap from "p-map";
import picomatch from "picomatch";
import { z, ZodType } from "zod";

export type FrontmatterField =
  | {
      type: "string" | "date" | "number" | "boolean";
      required?: boolean;
    }
  | {
      type: "array";
      fields: Record<string, FrontmatterField>;
      required?: boolean;
    }
  | {
      type: "object";
      fields: Record<string, FrontmatterField>;
      required?: boolean;
    };

export type ContentConfig = {
  name: string;
  output: string;
  frontmatter?: Record<string, FrontmatterField>;
  single?: boolean;
  transform?: (args: {
    content: string;
    metadata: Record<string, unknown>;
    filePath: string;
  }) => Promise<{ content: string; metadata: Record<string, unknown> }>;
};

export type MdxConfig = {
  content: {
    [pattern: string]: ContentConfig;
  };
  contentCompileOptions?: Omit<CompileOptions, "outputFormat">;
  concurrency?: number;
};

type ProcessedContent = {
  type: string;
  filePath: string;
  relativePath: string;
  slug: string;
  frontmatter: Record<string, unknown>;
  outFilePath: string;
};

const [, , sourceDirectory, ...args] = process.argv;
const outputDirectory = resolve(process.cwd(), ".codoodle-mdx");
const indexFile = resolve(outputDirectory, "index.ts");
const isCleanMode = args.includes("--clean");
const isWatchMode = args.includes("--watch");

if (isCleanMode) {
  console.log(`Cleaning output directory: ${outputDirectory}`);
  await rm(outputDirectory, {
    recursive: true,
    force: true,
  });
  process.exit(0);
}

const CONCURRENCY_CONFIG = {
  MIN: 2,
  MAX: 12,
  CPU_MULTIPLIER: 2,
} as const;

function calculateOptimalConcurrency(): number {
  const cpuCount = cpus().length;
  const calculated = cpuCount * CONCURRENCY_CONFIG.CPU_MULTIPLIER;
  return Math.min(
    Math.max(calculated, CONCURRENCY_CONFIG.MIN),
    CONCURRENCY_CONFIG.MAX,
  );
}

function findMatchingContentConfig(
  filePath: string,
): ContentConfig | undefined {
  for (const pattern of globPatterns) {
    const patternMatcher = picomatch(pattern);
    if (patternMatcher(filePath)) {
      return config.content[pattern];
    }
  }
  return undefined;
}

function createZodSchema(
  frontmatter?: Record<string, FrontmatterField>,
): ZodType {
  if (!frontmatter) {
    return z.object({});
  }

  const shape: Record<string, ZodType> = {};

  for (const [key, field] of Object.entries(frontmatter)) {
    let zodType: ZodType;

    switch (field.type) {
      case "string":
        zodType = z.string();
        break;
      case "date":
        zodType = z.iso.datetime();
        break;
      case "number":
        zodType = z.number();
        break;
      case "boolean":
        zodType = z.boolean();
        break;
      case "array":
        zodType = z.array(createZodSchema(field.fields));
        break;
      case "object":
        zodType = createZodSchema(field.fields);
        break;
      default:
        zodType = z.any();
    }

    if (!field.required) {
      zodType = zodType.optional();
    }

    shape[key] = zodType;
  }

  return z.object(shape);
}

function createTypeScriptType(
  frontmatter?: Record<string, FrontmatterField>,
): string {
  if (!frontmatter) {
    return "{}";
  }

  const fields: string[] = [];

  for (const [key, field] of Object.entries(frontmatter)) {
    let typeStr: string;

    switch (field.type) {
      case "string":
        typeStr = "string";
        break;
      case "date":
        typeStr = "string";
        break;
      case "number":
        typeStr = "number";
        break;
      case "boolean":
        typeStr = "boolean";
        break;
      case "array": {
        const arrayType = createTypeScriptType(field.fields);
        typeStr = `${arrayType}[]`;
        break;
      }
      case "object":
        typeStr = createTypeScriptType(field.fields);
        break;
      default:
        typeStr = "unknown";
    }

    const optional = field.required ? "" : "?";
    fields.push(`  ${key}${optional}: ${typeStr};`);
  }

  return `{\n${fields.join("\n")}\n}`;
}

const configPath = resolve(process.cwd(), "codoodle.config.js");
const config = (await import(configPath)).default as MdxConfig;
const compileOptions: CompileOptions = {
  ...(config.contentCompileOptions ?? {}),
  outputFormat: "function-body",
};
const globPatterns = Object.keys(config.content);
const defaultConcurrency = calculateOptimalConcurrency();

async function processSingleFile(
  filePath: string,
  sourceDir: string,
): Promise<ProcessedContent | null> {
  try {
    const relativeFilePath = relative(sourceDir, filePath);
    const contentConfig = findMatchingContentConfig(relativeFilePath);
    if (!contentConfig) {
      console.warn(`[${relativeFilePath}] No matching config found.`);
      return null;
    }

    const rawContent = (await readFile(filePath, "utf-8")).trim();
    const { data, content } = matter(rawContent, {
      engines: {
        yaml: {
          parse(input) {
            return yaml.load(input, {
              schema: yaml.JSON_SCHEMA,
            }) as object;
          },
        },
      },
    });

    const validationSchema = createZodSchema(contentConfig.frontmatter);
    let parsedFrontmatter = validationSchema.parse(data);
    let contentToProcess = content;

    if (contentConfig.transform) {
      const transformedResult = await contentConfig.transform({
        content,
        metadata: parsedFrontmatter as Record<string, unknown>,
        filePath,
      });
      parsedFrontmatter = transformedResult.metadata;
      contentToProcess = transformedResult.content;
    }

    const compiledMdx = contentToProcess
      ? await compile(contentToProcess, compileOptions)
      : undefined;
    const generatedCode = `/* Auto-generated file - do not edit directly */
/* eslint-disable prettier/prettier */

const frontmatter = ${JSON.stringify(parsedFrontmatter, null, 2)};
export default {
  ...frontmatter,
  ContentComponent: ${
    compiledMdx
      ? `(() => {
    ${compiledMdx}
  })().default`
      : "undefined"
  },
};`;

    const contentSlug = relativeFilePath
      .replace(/\.[^/.]+$/, "")
      .replace(/\/index$/, "")
      .replace(/^\//, "");

    const outputSubDirectory = contentConfig.output;
    const outputFileName = contentSlug
      ? contentSlug.replace(/\//g, "_")
      : "index";
    const outputFilePath = resolve(
      outputDirectory,
      outputSubDirectory,
      `${outputFileName}.jsx`,
    );

    const outputDir = dirname(outputFilePath);
    await ensureDirectoryExists(outputDir);
    await writeFile(outputFilePath, generatedCode, "utf-8");

    const processedItem: ProcessedContent = {
      type: contentConfig.name,
      filePath,
      relativePath: relativeFilePath,
      slug: contentSlug,
      frontmatter: parsedFrontmatter as Record<string, unknown>,
      outFilePath: outputFilePath,
    };

    console.log(
      `✅ Processed: ${relativeFilePath} → ${relative(outputDirectory, outputFilePath)}`,
    );
    return processedItem;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.warn(
      `❌ Failed to process ${relative(sourceDir, filePath)}: ${errorMessage}`,
    );

    if (isWatchMode) {
      console.warn(`   → File path: ${filePath}`);
      if (error instanceof z.ZodError) {
        console.warn(`   → Validation errors:`, error.issues);
      }
    }
    return null;
  }
}

async function processAllFiles(): Promise<ProcessedContent[]> {
  const globMatchedPaths = await globby(globPatterns, {
    cwd: sourceDirectory,
    absolute: true,
  });

  const processedContents: ProcessedContent[] = (
    await pMap(
      globMatchedPaths,
      async (path) => processSingleFile(path, sourceDirectory),
      {
        concurrency: config.concurrency ?? defaultConcurrency,
      },
    )
  ).filter((item) => !!item) as ProcessedContent[];

  return processedContents;
}

const processedContentsCache: Map<string, ProcessedContent> = new Map();
const createdDirectories = new Set<string>();

async function ensureDirectoryExists(dirPath: string) {
  if (isWatchMode && createdDirectories.has(dirPath)) {
    return;
  }

  await mkdir(dirPath, { recursive: true });

  if (isWatchMode) {
    createdDirectories.add(dirPath);
  }
}

async function updateCacheAndIndex(
  filePath: string,
  operation: "add" | "update" | "remove",
) {
  const normalizedPath = resolve(filePath);

  if (operation === "remove") {
    const existingEntry = Array.from(processedContentsCache.values()).find(
      (content) => resolve(content.filePath) === normalizedPath,
    );
    if (existingEntry) {
      processedContentsCache.delete(existingEntry.filePath);

      try {
        await rm(existingEntry.outFilePath, { force: true });
        console.log(
          `🗑️  Removed output file: ${relative(outputDirectory, existingEntry.outFilePath)}`,
        );
      } catch {
        // Ignore if file doesn't exist
      }
    }
  } else {
    const processedContent = await processSingleFile(filePath, sourceDirectory);
    if (processedContent) {
      processedContentsCache.set(processedContent.filePath, processedContent);
    }
  }

  const allContents = Array.from(processedContentsCache.values());
  await generateIndexFile(allContents);
}

async function generateIndexFile(processedContents: ProcessedContent[]) {
  const sortedContents = processedContents.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type.localeCompare(b.type);
    }
    return a.slug.localeCompare(b.slug);
  });

  const contentsByType = new Map<string, ProcessedContent[]>();
  for (const contentItem of sortedContents) {
    if (!contentsByType.has(contentItem.type)) {
      contentsByType.set(contentItem.type, []);
    }
    contentsByType.get(contentItem.type)!.push(contentItem);
  }

  const imports: string[] = [];
  const exports: string[] = [];
  const variableNames = new Map<ProcessedContent, string>();
  const indexFileDir = dirname(indexFile);

  for (const contentItem of sortedContents) {
    const componentVariableName =
      `${contentItem.type}_${contentItem.slug}`.replace(/[^a-zA-Z0-9]/g, "_");
    const relativeImportPath = `./${relative(indexFileDir, contentItem.outFilePath).replace(/\.jsx$/, "")}`;

    imports.push(
      `import ${componentVariableName} from "${relativeImportPath}";`,
    );
    variableNames.set(contentItem, componentVariableName);
  }

  const contentTypeExports = new Map<string, string>();

  for (const [contentTypeName, contentItems] of contentsByType) {
    const itemExports = contentItems
      .map((contentItem) => {
        const componentVariableName = variableNames.get(contentItem)!;
        return `  {
    ...${componentVariableName},
    slug: "${contentItem.slug}",
  },`;
      })
      .join("\n");

    contentTypeExports.set(contentTypeName, itemExports);
    exports.push(
      `  ${contentTypeName.toLowerCase()}: ${contentTypeName}Array,`,
    );
  }

  const arrayDefinitions: string[] = [];
  for (const [contentTypeName, exportContent] of contentTypeExports) {
    const arrayVariableName = `${contentTypeName}Array`;

    // 해당 콘텐츠 타입의 첫 번째 아이템에서 frontmatter 스키마 가져오기
    const firstItem = contentsByType.get(contentTypeName)?.[0];
    const contentConfig = firstItem
      ? findMatchingContentConfig(firstItem.relativePath)
      : undefined;
    const frontmatterType = createTypeScriptType(contentConfig?.frontmatter);

    arrayDefinitions.push(`const ${arrayVariableName} = [
${exportContent}
] as (${frontmatterType} & {
  ContentComponent?: (props?: Record<string, unknown>) => React.JSX.Element;
} & { slug: string })[];`);
  }

  const multipleExports: string[] = [];
  for (const contentTypeName of contentsByType.keys()) {
    const arrayVariableName = `${contentTypeName}Array`;
    multipleExports.push(
      `export const ${contentTypeName.toLowerCase()} = ${arrayVariableName};`,
    );
  }

  const indexContent = `/* Auto-generated file - do not edit directly */
/* eslint-disable prettier/prettier */

${imports.join("\n")}

${arrayDefinitions.join("\n\n")}

${multipleExports.join("\n")}

export default {
${exports.join("\n")}
};
`;

  await writeFile(indexFile, indexContent, "utf-8");

  const totalFiles = processedContents.length;
  const totalTypes = contentsByType.size;

  console.log(
    `\n✅ Generated index file: ${relative(process.cwd(), indexFile)}`,
  );
  console.log(`📊 Summary: ${totalFiles} files, ${totalTypes} content types`);
  for (const [contentTypeName, contentItems] of contentsByType) {
    console.log(`   ${contentTypeName}: ${contentItems.length} files`);
  }
}

/**
 * Main execution logic
 */
if (isWatchMode) {
  console.log(
    `🔍 Watch mode enabled. Watching for changes in: ${sourceDirectory}`,
  );

  console.log("📦 Initial build...");
  const initialContents = await processAllFiles();

  for (const content of initialContents) {
    processedContentsCache.set(content.filePath, content);
  }

  await generateIndexFile(initialContents);

  const watcher = chokidar.watch(".", {
    cwd: sourceDirectory,
    ignored: (path, stats) =>
      !!stats?.isFile() && !path.endsWith(".md") && !path.endsWith(".mdx"),
    ignoreInitial: true,
    persistent: true,
  });

  watcher.on("ready", () => {
    console.log("📡 Watcher is ready and watching for changes");
  });

  watcher.on("change", async (changedFile) => {
    console.log(`\n🔄 File changed: ${changedFile}`);
    const fullPath = resolve(sourceDirectory, changedFile);

    console.log("🔨 Updating index...");
    await updateCacheAndIndex(fullPath, "update");
    console.log("✅ Index updated");
  });

  watcher.on("add", async (addedFile) => {
    console.log(`\n➕ File added: ${addedFile}`);
    const fullPath = resolve(sourceDirectory, addedFile);

    console.log("🔨 Updating index...");
    await updateCacheAndIndex(fullPath, "add");
    console.log("✅ Index updated");
  });

  watcher.on("unlink", async (removedFile) => {
    console.log(`\n🗑️  File removed: ${removedFile}`);
    const fullPath = resolve(sourceDirectory, removedFile);

    console.log("🔨 Updating index...");
    await updateCacheAndIndex(fullPath, "remove");
    console.log("✅ Index updated");
  });

  watcher.on("error", (error) => {
    console.error("❌ Watcher error:", error);
  });

  console.log("👀 Watching for file changes... (Press Ctrl+C to stop)");

  const gracefulShutdown = async (signal: string) => {
    console.log(`\n🛑 Received ${signal}, stopping watch mode...`);
    await watcher.close();
    process.exit(0);
  };

  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
} else {
  const processedContents = await processAllFiles();
  await generateIndexFile(processedContents);
}
