import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn', () => {
  it('joins truthy classnames cleanly', () => {
    expect(cn('btn', 'btn-primary', false && 'hidden', null, undefined, 'active')).toBe('btn btn-primary active');
  });

  it('lets a later Tailwind utility override a conflicting earlier one', () => {
    expect(cn('px-2 text-sm', 'px-4')).toBe('text-sm px-4');
  });
});
