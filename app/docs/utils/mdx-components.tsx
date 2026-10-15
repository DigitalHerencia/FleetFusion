import type { ReactNode } from 'react';

export interface MarkdownHeading {
  id: string;
  title: string;
  level: number;
}

interface MarkdownResult {
  blocks: ReactNode[];
  headings: MarkdownHeading[];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[`]/g, '')
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-');
}

function inlineMarkdown(text: string): ReactNode[] {
  const pattern = /(\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`)/g;
  const result: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) result.push(text.slice(lastIndex, match.index));

    if (match[2] && match[3]) {
      const href = match[3].trim();
      if (href.startsWith('/') || href.startsWith('#')) {
        result.push(
          <a href={href} key={key++}>
            {match[2]}
          </a>,
        );
      } else if (/^https?:\/\//i.test(href)) {
        result.push(
          <a href={href} key={key++} rel="noreferrer" target="_blank">
            {match[2]}
          </a>,
        );
      } else {
        result.push(match[2]);
      }
    } else if (match[4]) {
      result.push(<strong key={key++}>{match[4]}</strong>);
    } else if (match[5]) {
      result.push(<em key={key++}>{match[5]}</em>);
    } else if (match[6]) {
      result.push(<code key={key++}>{match[6]}</code>);
    }
    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) result.push(text.slice(lastIndex));
  return result;
}

function isTableSeparator(line: string): boolean {
  return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);
}

function cells(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim());
}

function isBlockStart(lines: string[], index: number): boolean {
  const line = lines[index]?.trim() ?? '';
  const nextLine = lines[index + 1];
  return (
    line === '' ||
    /^#{1,3}\s+/.test(line) ||
    /^```/.test(line) ||
    /^>\s?/.test(line) ||
    /^[-*]\s+/.test(line) ||
    /^\d+[.)]\s+/.test(line) ||
    (line.includes('|') && nextLine !== undefined && isTableSeparator(nextLine))
  );
}

export function parseMarkdown(markdown: string): MarkdownResult {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const blocks: ReactNode[] = [];
  const headings: MarkdownHeading[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index]!.trim();
    if (!line) {
      index += 1;
      continue;
    }

    const heading = /^(#{1,3})\s+(.+)$/.exec(line);
    if (heading) {
      const level = heading[1]!.length;
      const title = heading[2]!.replace(/[`*_]/g, '').trim();
      const id = slugify(title);
      headings.push({ id, title, level });
      const Tag = `h${level}` as 'h1' | 'h2' | 'h3';
      blocks.push(
        <Tag id={id} key={`heading-${index}`}>
          {inlineMarkdown(heading[2]!)}
        </Tag>,
      );
      index += 1;
      continue;
    }

    if (line.startsWith('```')) {
      const language = line.slice(3).trim();
      index += 1;
      const code: string[] = [];
      while (index < lines.length && !lines[index]!.trim().startsWith('```')) {
        code.push(lines[index]!);
        index += 1;
      }
      index += 1;
      blocks.push(
        <pre key={`code-${index}`} data-language={language || undefined}>
          <code>{code.join('\n')}</code>
        </pre>,
      );
      continue;
    }

    if (line.startsWith('>')) {
      const quote: string[] = [];
      while (index < lines.length && lines[index]!.trim().startsWith('>')) {
        quote.push(lines[index]!.trim().replace(/^>\s?/, ''));
        index += 1;
      }
      blocks.push(
        <blockquote key={`quote-${index}`}>{inlineMarkdown(quote.join(' '))}</blockquote>,
      );
      continue;
    }

    if (
      line.includes('|') &&
      lines[index + 1] !== undefined &&
      isTableSeparator(lines[index + 1]!)
    ) {
      const headers = cells(line);
      index += 2;
      const rows: string[][] = [];
      while (index < lines.length && lines[index]!.includes('|') && lines[index]!.trim()) {
        rows.push(cells(lines[index]!));
        index += 1;
      }
      blocks.push(
        <div className="docs-table-scroll" key={`table-${index}`}>
          <table>
            <thead>
              <tr>
                {headers.map((cell, cellIndex) => (
                  <th key={`${cell}-${cellIndex}`}>{inlineMarkdown(cell)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={`row-${rowIndex}`}>
                  {headers.map((_, cellIndex) => (
                    <td key={`cell-${cellIndex}`}>{inlineMarkdown(row[cellIndex] ?? '')}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    const unordered = /^[-*]\s+(.+)$/.exec(line);
    if (unordered) {
      const items: string[] = [];
      while (index < lines.length) {
        const item = /^[-*]\s+(.+)$/.exec(lines[index]!.trim());
        if (!item) break;
        items.push(item[1]!);
        index += 1;
      }
      blocks.push(
        <ul key={`list-${index}`}>
          {items.map((item, itemIndex) => (
            <li key={itemIndex}>{inlineMarkdown(item)}</li>
          ))}
        </ul>,
      );
      continue;
    }

    const ordered = /^\d+[.)]\s+(.+)$/.exec(line);
    if (ordered) {
      const items: string[] = [];
      while (index < lines.length) {
        const item = /^\d+[.)]\s+(.+)$/.exec(lines[index]!.trim());
        if (!item) break;
        items.push(item[1]!);
        index += 1;
      }
      blocks.push(
        <ol key={`ordered-${index}`}>
          {items.map((item, itemIndex) => (
            <li key={itemIndex}>{inlineMarkdown(item)}</li>
          ))}
        </ol>,
      );
      continue;
    }

    const paragraph = [line];
    index += 1;
    while (index < lines.length && !isBlockStart(lines, index)) {
      paragraph.push(lines[index]!.trim());
      index += 1;
    }
    blocks.push(<p key={`paragraph-${index}`}>{inlineMarkdown(paragraph.join(' '))}</p>);
  }

  return { blocks, headings };
}

export function MarkdownDocument({ markdown }: { markdown: string }) {
  const { blocks } = parseMarkdown(markdown);
  return <>{blocks}</>;
}

export function DocumentContents({ headings }: { headings: MarkdownHeading[] }) {
  const entries = headings.filter((heading) => heading.level > 1);
  if (entries.length === 0) return null;

  return (
    <nav aria-label="On this page" className="docs-contents">
      <h2>On this page</h2>
      <ul>
        {entries.map((heading) => (
          <li
            className={heading.level === 3 ? 'docs-contents-subitem' : undefined}
            key={heading.id}
          >
            <a href={`#${heading.id}`}>{heading.title}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
