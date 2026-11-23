import type { ReactNode } from 'react';

const BULLET = /^\s*[-•*]\s+/;

/**
 * A policy's plain text as the Admin typed it: lines starting with "- " become a bulleted list, other lines are
 * paragraphs. Rendered as text only, never as HTML.
 */
export function PolicyText({ text, className = '' }: { text: string; className?: string }) {
  const blocks: ReactNode[] = [];
  let bullets: string[] = [];
  const flush = () => {
    if (!bullets.length) return;
    blocks.push(
      <ul key={`ul-${blocks.length}`} className="list-disc space-y-1 pl-5">
        {bullets.map((b, i) => (
          <li key={i}>{b}</li>
        ))}
      </ul>,
    );
    bullets = [];
  };
  for (const line of text.split(/\r?\n/)) {
    if (BULLET.test(line)) {
      bullets.push(line.replace(BULLET, ''));
      continue;
    }
    flush();
    if (line.trim()) blocks.push(<p key={`p-${blocks.length}`}>{line}</p>);
  }
  flush();
  return <div className={`space-y-2 text-sm leading-relaxed ${className}`}>{blocks}</div>;
}
