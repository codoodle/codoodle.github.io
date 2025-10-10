import rehypeStringify from "rehype-stringify";
import remarkMdx from "remark-mdx";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { describe, expect, it } from "vitest";
import remarkAlerts from "./index.js";

/**
 * 테스트용 헬퍼 함수: Markdown을 HTML로 변환
 */
async function processMarkdown(
  markdown: string,
  options?: { types?: string[] },
) {
  const processor = unified()
    .use(remarkParse)
    .use(remarkMdx)
    .use(remarkAlerts, options || {})
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeStringify, { allowDangerousHtml: true });

  const result = await processor.process(markdown);
  return String(result);
}

describe("remarkAlerts", () => {
  describe("Basic Alert Types", () => {
    it("should convert NOTE alert correctly", async () => {
      const markdown = `> [!NOTE]
> 이것은 노트입니다.`;

      const result = await processMarkdown(markdown);

      expect(result).toContain('class="alerts alerts-note"');
      expect(result).toContain('class="alerts-title"');
      expect(result).toContain("note");
    });

    it("should convert TIP alert correctly", async () => {
      const markdown = `> [!TIP]
> 이것은 팁입니다.`;

      const result = await processMarkdown(markdown);

      expect(result).toContain('class="alerts alerts-tip"');
      expect(result).toContain("tip");
    });

    it("should convert IMPORTANT alert correctly", async () => {
      const markdown = `> [!IMPORTANT]
> 이것은 중요한 내용입니다.`;

      const result = await processMarkdown(markdown);

      expect(result).toContain('class="alerts alerts-important"');
      expect(result).toContain("important");
    });

    it("should convert WARNING alert correctly", async () => {
      const markdown = `> [!WARNING]
> 이것은 경고입니다.`;

      const result = await processMarkdown(markdown);

      expect(result).toContain('class="alerts alerts-warning"');
      expect(result).toContain("warning");
    });

    it("should convert CAUTION alert correctly", async () => {
      const markdown = `> [!CAUTION]
> 이것은 주의사항입니다.`;

      const result = await processMarkdown(markdown);

      expect(result).toContain('class="alerts alerts-caution"');
      expect(result).toContain("caution");
    });
  });

  describe("Custom Titles", () => {
    it("should handle alerts with custom titles", async () => {
      const markdown = `> [!NOTE] 사용자 정의 제목
> 커스텀 제목이 있는 노트입니다.`;

      const result = await processMarkdown(markdown);

      expect(result).toContain("사용자 정의 제목");
      expect(result).toContain('class="alerts alerts-note"');
    });

    it("should handle alerts with empty titles", async () => {
      const markdown = `> [!TIP]
> 빈 제목이 있는 팁입니다.`;

      const result = await processMarkdown(markdown);

      expect(result).toContain("tip");
      expect(result).toContain('class="alerts alerts-tip"');
    });
  });

  describe("Case Sensitivity", () => {
    it("should handle lowercase alert types", async () => {
      const markdown = `> [!note]
> 소문자 노트입니다.`;

      const result = await processMarkdown(markdown);

      expect(result).toContain('class="alerts alerts-note"');
    });

    it("should handle mixed case alert types", async () => {
      const markdown = `> [!WaRnInG]
> 혼합 대소문자 경고입니다.`;

      const result = await processMarkdown(markdown);

      expect(result).toContain('class="alerts alerts-warning"');
    });
  });

  describe("Multiple Paragraphs", () => {
    it("should handle alerts with multiple paragraphs", async () => {
      const markdown = `> [!NOTE] 다중 단락 노트
> 첫 번째 단락입니다.
>
> 두 번째 단락입니다.
>
> 세 번째 단락입니다.`;

      const result = await processMarkdown(markdown);

      expect(result).toContain("첫 번째 단락");
      expect(result).toContain("두 번째 단락");
      expect(result).toContain("세 번째 단락");
      expect(result).toContain('class="alerts alerts-note"');
    });
  });

  describe("Inline Elements", () => {
    it("should handle alerts with emphasis", async () => {
      const markdown = `> [!IMPORTANT]
> 이것은 **중요한** 내용이고 *기울임체*도 있습니다.`;

      const result = await processMarkdown(markdown);

      expect(result).toContain("<strong>중요한</strong>");
      expect(result).toContain("<em>기울임체</em>");
      expect(result).toContain('class="alerts alerts-important"');
    });

    it("should handle alerts with links", async () => {
      const markdown = `> [!TIP]
> 더 많은 정보는 [여기](https://example.com)를 참조하세요.`;

      const result = await processMarkdown(markdown);

      expect(result).toContain('<a href="https://example.com">여기</a>');
      expect(result).toContain('class="alerts alerts-tip"');
    });

    it("should handle alerts with code", async () => {
      const markdown = `> [!NOTE]
> \`console.log()\` 함수를 사용하세요.`;

      const result = await processMarkdown(markdown);

      expect(result).toContain("<code>console.log()</code>");
      expect(result).toContain('class="alerts alerts-note"');
    });
  });

  describe("Custom Alert Types", () => {
    it("should handle custom alert types", async () => {
      const markdown = `> [!CUSTOM]
> 커스텀 alert 타입입니다.`;

      const result = await processMarkdown(markdown, { types: ["CUSTOM"] });

      expect(result).toContain('class="alerts alerts-custom"');
      expect(result).toContain("custom");
    });

    it("should handle multiple custom alert types", async () => {
      const markdown1 = `> [!INFO]
> 정보 alert입니다.`;

      const markdown2 = `> [!SUCCESS]
> 성공 alert입니다.`;

      const options = { types: ["INFO", "SUCCESS"] };

      const result1 = await processMarkdown(markdown1, options);
      const result2 = await processMarkdown(markdown2, options);

      expect(result1).toContain('class="alerts alerts-info"');
      expect(result2).toContain('class="alerts alerts-success"');
    });
  });

  describe("Regular Blockquotes", () => {
    it("should not convert regular blockquotes", async () => {
      const markdown = `> 이것은 일반적인 blockquote입니다.
> 두 번째 줄입니다.`;

      const result = await processMarkdown(markdown);

      expect(result).not.toContain('class="alerts');
      expect(result).toContain("<blockquote>");
    });

    it("should ignore non-alert brackets", async () => {
      const markdown = `> [NOT_ALERT]
> 이것은 alert가 아닙니다.`;

      const result = await processMarkdown(markdown);

      expect(result).not.toContain('class="alerts');
      expect(result).toContain("<blockquote>");
    });
  });

  describe("MDX JSX Elements", () => {
    it("should handle alerts with self-closing JSX elements", async () => {
      const markdown = `> [!NOTE]
> 이것은 <CustomComponent prop="value" /> 가 있는 노트입니다.`;

      const result = await processMarkdown(markdown);

      expect(result).toContain('class="alerts alerts-note"');
      expect(result).toContain("CustomComponent");
    });

    it("should handle alerts with simple JSX elements with children", async () => {
      const markdown = `> [!TIP]
> 이것은 <Button>클릭하세요</Button> 버튼이 있습니다.`;

      const result = await processMarkdown(markdown);

      expect(result).toContain('class="alerts alerts-tip"');
      expect(result).toContain("Button");
      expect(result).toContain("클릭하세요");
    });

    it("should handle alerts with JSX elements in separate paragraphs", async () => {
      const markdown = `> [!WARNING]
> 첫 번째 단락입니다.
>
> <Card>카드 내용</Card>
>
> 세 번째 단락입니다.`;

      const result = await processMarkdown(markdown);

      expect(result).toContain('class="alerts alerts-warning"');
      expect(result).toContain("첫 번째 단락");
      expect(result).toContain("Card");
      expect(result).toContain("카드 내용");
      expect(result).toContain("세 번째 단락");
    });

    it("should handle alerts with JSX expressions in text", async () => {
      const markdown = `> [!IMPORTANT]
> 현재 시간: <Time />이고 사용자는 <span>홍길동</span>입니다.`;

      const result = await processMarkdown(markdown);

      expect(result).toContain('class="alerts alerts-important"');
      expect(result).toContain("Time");
      expect(result).toContain("span");
      expect(result).toContain("홍길동");
    });

    it("should handle alerts with JSX attributes", async () => {
      const markdown = `> [!NOTE]
> <Component className="custom-class" data-testid="test" />를 사용하세요.`;

      const result = await processMarkdown(markdown);

      expect(result).toContain('class="alerts alerts-note"');
      expect(result).toContain("Component");
      expect(result).toContain("custom-class");
    });

    it("should handle alerts with mixed JSX and markdown", async () => {
      const markdown = `> [!TIP] JSX와 마크다운 혼합
> 이것은 **볼드 텍스트**이고, <Code>인라인 코드</Code>입니다.
>
> 그리고 <Link href="/docs">문서</Link>로 이동할 수 있습니다.`;

      const result = await processMarkdown(markdown);

      expect(result).toContain('class="alerts alerts-tip"');
      expect(result).toContain("<strong>볼드 텍스트</strong>");
      expect(result).toContain("Code");
      expect(result).toContain("Link");
      expect(result).toContain("문서");
    });

    it("should handle alerts with inline JSX", async () => {
      const markdown = `> [!NOTE]
> 텍스트와 <em>강조</em> 그리고 <CustomIcon />를 함께 사용합니다.`;

      const result = await processMarkdown(markdown);

      expect(result).toContain('class="alerts alerts-note"');
      expect(result).toContain("<em>강조</em>");
      expect(result).toContain("CustomIcon");
      expect(result).toContain("텍스트와");
    });

    it("should handle alerts with React-style component names", async () => {
      const markdown = `> [!CAUTION]
> <Alert.Title>제목</Alert.Title>을 사용하세요.`;

      const result = await processMarkdown(markdown);

      expect(result).toContain('class="alerts alerts-caution"');
      expect(result).toContain("Alert.Title");
      expect(result).toContain("제목");
    });
  });

  describe("Whitespace and Special Characters", () => {
    it("should handle whitespace before alert types", async () => {
      const markdown = `>   [!NOTE]
> 앞에 공백이 있는 노트입니다.`;

      const result = await processMarkdown(markdown);

      expect(result).toContain('class="alerts alerts-note"');
    });

    it("should trim whitespace in titles", async () => {
      const markdown = `> [!TIP]   공백이 있는 제목
> 제목에 공백이 있는 팁입니다.`;

      const result = await processMarkdown(markdown);

      expect(result).toContain("공백이 있는 제목");
      expect(result).toContain('class="alerts alerts-tip"');
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty alerts", async () => {
      const markdown = `> [!NOTE]`;

      const result = await processMarkdown(markdown);

      expect(result).toContain('class="alerts alerts-note"');
      expect(result).toContain("note");
    });

    it("should handle nested blockquotes correctly", async () => {
      const markdown = `> > [!NOTE]
> > 중첩된 blockquote입니다.`;

      const result = await processMarkdown(markdown);

      // 중첩된 blockquote도 alert로 변환됨 (현재 구현의 동작)
      expect(result).toContain('class="alerts alerts-note"');
      expect(result).toContain("중첩된 blockquote");
    });

    it("should handle alert types with special characters", async () => {
      const markdown = `> [!SPECIAL-TYPE]
> 특수 문자가 있는 alert입니다.`;

      const result = await processMarkdown(markdown, {
        types: ["SPECIAL-TYPE"],
      });

      expect(result).toContain('class="alerts alerts-special-type"');
    });
  });

  describe("Icon Handling", () => {
    it("should include SVG icons for default types", async () => {
      const markdown = `> [!NOTE]
> 아이콘이 있는 노트입니다.`;

      const result = await processMarkdown(markdown);

      // SVG 요소가 있는지 확인 (octicons에서 생성된 SVG)
      expect(result).toContain("<svg");
    });

    it("should use text fallback for custom types", async () => {
      const markdown = `> [!CUSTOM]
> 커스텀 타입입니다.`;

      const result = await processMarkdown(markdown, { types: ["CUSTOM"] });

      expect(result).toContain("custom");
      expect(result).toContain('class="alerts alerts-custom"');
    });
  });
});
