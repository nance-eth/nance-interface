import { unified } from 'unified';
import remarkParse from 'remark-parse';
import type { Root, Paragraph, PhrasingContent } from 'mdast';

export function getParagraphOfMarkdown(raw: string, paragraphIndex: number = 0) {
  const parsed = unified().use(remarkParse).parse(raw) as Root;
  const texts: string[] = parsed.children
    .filter((c): c is Paragraph => c.type === "paragraph")
    .map(c => c.children[0])
    .filter((c): c is PhrasingContent & { value: string } =>
      'value' in c && typeof c.value === 'string' && c.value.trim().length > 5
    )
    .map(c => c.value);

  const ret = texts[paragraphIndex] || "THE END";
  return ret;
}
