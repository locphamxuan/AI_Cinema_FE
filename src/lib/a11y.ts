import type { KeyboardEvent } from 'react';

/** onKeyDown for an element given role="button": Enter and Space act like a click. */
export function onActivateKey(action: () => void) {
  return (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };
}
