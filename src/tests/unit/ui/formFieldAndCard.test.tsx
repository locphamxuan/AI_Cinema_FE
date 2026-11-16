import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormField, fieldInputClass } from '@/components/ui/FormField';
import { NotificationCard } from '@/features/notifications/NotificationCard';
import type { AppNotification } from '@/types/production';

function PriceField() {
  const [value, setValue] = useState('');
  const error = value && Number(value) % 1000 !== 0 ? 'Bội số của 1.000 ₫' : null;
  return (
    <FormField label="Giá" error={error}>
      <input aria-label="Giá" value={value} onChange={(e) => setValue(e.target.value)} className={fieldInputClass} />
    </FormField>
  );
}

describe('FormField', () => {
  it('keeps the control mounted and focused while an error appears and clears', async () => {
    render(<PriceField />);
    const input = screen.getByLabelText('Giá');
    await userEvent.type(input, '1500');
    expect(screen.getByRole('alert')).toHaveTextContent('Bội số của 1.000 ₫');
    await userEvent.type(input, '000');
    expect(screen.getByLabelText('Giá')).toBe(input);
    expect(input).toHaveFocus();
    expect(input).toHaveValue('1500000');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

describe('NotificationCard', () => {
  const item = {
    id: 'n1',
    type: 'SCRIPT_SUBMITTED',
    title: 'Kịch bản mới',
    body: 'Creator nộp kịch bản.',
    readAt: null,
    createdAt: '2026-11-15T00:00:00.000Z',
  } as unknown as AppNotification;

  it('opens from the keyboard as well as by click', async () => {
    const onOpen = vi.fn();
    render(<NotificationCard item={item} href={null} onOpen={onOpen} />);
    const card = screen.getByRole('button', { name: /Kịch bản mới/ });
    card.focus();
    await userEvent.keyboard('{Enter}');
    await userEvent.click(card);
    expect(onOpen).toHaveBeenCalledTimes(2);
  });
});
