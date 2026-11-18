import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmModal } from '@/components/data/ConfirmModal';

const base = { open: true, title: 'Ký hợp đồng?', description: 'Ký Bên A cho vòng 1.', confirmLabel: 'Ký hợp đồng' };

describe('ConfirmModal', () => {
  it('lists the facts it acts on and what follows, then confirms', async () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmModal
        {...base}
        tone="warning"
        details={[['Giá trị', '200.000.000 ₫'], ['Studio', 'Lumen Studio']]}
        consequence="Dự án chuyển sang Đang sản xuất."
        onClose={vi.fn()}
        onConfirm={onConfirm}
      />,
    );
    expect(screen.getByText('200.000.000 ₫')).toBeInTheDocument();
    expect(screen.getByText('Lumen Studio')).toBeInTheDocument();
    expect(screen.getByText('Dự án chuyển sang Đang sản xuất.')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Ký hợp đồng' }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('keeps danger as a shorthand, shows the busy state and cancels', async () => {
    const onClose = vi.fn();
    const { rerender } = render(<ConfirmModal {...base} danger onClose={onClose} onConfirm={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: 'Huỷ' }));
    expect(onClose).toHaveBeenCalled();
    rerender(<ConfirmModal {...base} busy onClose={onClose} onConfirm={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Đang xử lý…' })).toBeDisabled();
  });
});
