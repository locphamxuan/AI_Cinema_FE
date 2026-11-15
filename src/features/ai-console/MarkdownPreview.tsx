import type { ReactNode } from 'react';

/** `**bold**` inside a line; everything stays React text, so no HTML from the article is ever injected. */
function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') && part.length > 4 ? <strong key={i}>{part.slice(2, -2)}</strong> : part,
  );
}

/**
 * The Markdown an article is written in, as the AI's chunker reads it: headings cut the article into sections,
 * lists and paragraphs stay inside them. A preview only — not a full Markdown engine.
 */
export function MarkdownPreview({ source }: { source: string }) {
  const blocks: ReactNode[] = [];
  let list: string[] = [];
  let para: string[] = [];
  const flush = () => {
    if (para.length) blocks.push(<p key={`p${blocks.length}`}>{inline(para.join(' '))}</p>);
    if (list.length) {
      blocks.push(
        <ul key={`u${blocks.length}`} className="list-disc space-y-1 pl-5">
          {list.map((item, i) => (
            <li key={i}>{inline(item)}</li>
          ))}
        </ul>,
      );
    }
    para = [];
    list = [];
  };

  for (const raw of source.split('\n')) {
    const line = raw.trim();
    const heading = /^(#{1,3})\s+(.*)$/.exec(line);
    const item = /^[-*]\s+(.*)$/.exec(line) ?? /^\d+[.)]\s+(.*)$/.exec(line);
    if (!line) flush();
    else if (heading) {
      flush();
      const size = heading[1].length === 1 ? 'text-base' : 'text-sm';
      blocks.push(
        <p key={`h${blocks.length}`} className={`${size} pt-1 font-semibold text-foreground`}>
          {inline(heading[2])}
        </p>,
      );
    } else if (item) {
      if (para.length) flush();
      list.push(item[1]);
    } else {
      if (list.length) flush();
      para.push(line);
    }
  }
  flush();

  if (!blocks.length) return <p className="text-muted-foreground">Chưa có nội dung.</p>;
  return <div className="space-y-2.5 text-sm leading-relaxed text-muted-foreground">{blocks}</div>;
}
