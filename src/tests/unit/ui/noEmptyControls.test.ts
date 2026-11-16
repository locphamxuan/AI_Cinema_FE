import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const SRC = path.resolve(__dirname, '../../..');

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === 'tests' ? [] : sourceFiles(full);
    return entry.name.endsWith('.tsx') ? [full] : [];
  });
}

// A button or link with nothing between its tags renders as an invisible box (e.g. after an icon was dropped).
const EMPTY_CONTROL = /<(Button|button|Link)\b(?:[^<>]|=>|\{[^{}]*\})*>\s*<\/\1>/g;

describe('controls', () => {
  it('never leaves a button or link without visible content', () => {
    const empty = sourceFiles(SRC).flatMap((file) =>
      [...readFileSync(file, 'utf8').matchAll(EMPTY_CONTROL)].map((m) => `${path.relative(SRC, file)}: ${m[0].slice(0, 80)}`),
    );
    expect(empty).toEqual([]);
  });
});
