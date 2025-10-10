# @codoodle/remark-alerts

GitHub style alert blocks를 지원하는 remark 플러그인입니다.

## 특징

- GitHub style alert 문법 지원 (`[!NOTE]`, `[!TIP]`, `[!IMPORTANT]`, `[!WARNING]`, `[!CAUTION]`)
- 커스텀 alert 타입 지원
- MDX JSX 요소 처리
- Octicons 아이콘 자동 포함
- TypeScript 타입 안전성

## 설치

```bash
npm install @codoodle/remark-alerts
# 또는
pnpm add @codoodle/remark-alerts
```

## 사용법

```javascript
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkAlerts from '@codoodle/remark-alerts';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';

const processor = unified()
  .use(remarkParse)
  .use(remarkAlerts)
  .use(remarkRehype)
  .use(rehypeStringify);

const markdown = `
> [!NOTE]
> 이것은 노트입니다.
`;

const result = await processor.process(markdown);
console.log(String(result));
```

## Alert 타입

### 기본 지원 타입

- `[!NOTE]` - 정보성 노트
- `[!TIP]` - 유용한 팁
- `[!IMPORTANT]` - 중요한 정보
- `[!WARNING]` - 경고
- `[!CAUTION]` - 주의사항

### 커스텀 타입

```javascript
.use(remarkAlerts, {
  types: ['INFO', 'SUCCESS', 'ERROR']
})
```

## 문법 예시

### 기본 alert

```markdown
> [!NOTE]
> 이것은 노트입니다.
```

### 커스텀 제목

```markdown
> [!TIP] 프로 팁
> 이것은 커스텀 제목이 있는 팁입니다.
```

### 복수 단락

```markdown
> [!WARNING]
> 첫 번째 단락입니다.
>
> 두 번째 단락입니다.
```

### 인라인 요소

```markdown
> [!IMPORTANT]
> **중요한** 내용과 [링크](https://example.com), `코드`가 포함된 alert입니다.
```

## 출력

Alert는 다음과 같은 HTML 구조로 변환됩니다:

```html
<div class="alerts alerts-note">
  <p class="alerts-title">
    <svg><!-- 아이콘 --></svg>
    Note
  </p>
  <!-- 내용 -->
</div>
```

## CSS 스타일링

기본 CSS 클래스:
- `.alerts` - alert 컨테이너
- `.alerts-{type}` - alert 타입별 클래스
- `.alerts-title` - alert 제목

## 테스트

```bash
pnpm test
```

## 라이선스

MIT
