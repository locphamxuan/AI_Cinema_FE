import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SeasonEpisodesEditor } from '@/features/workflow/components/reviewer/modals/SeasonEpisodesEditor';
import { GenrePicker } from '@/features/workflow/components/reviewer/modals/GenrePicker';
import type { ApiGenre } from '@/types/workflow-api';

function Seasons({ initial, onChange }: { initial: number[][]; onChange: (s: number[][]) => void }) {
  const [seasons, setSeasons] = useState(initial);
  return (
    <SeasonEpisodesEditor
      seasons={seasons}
      onChange={(next) => {
        setSeasons(next);
        onChange(next);
      }}
    />
  );
}

describe('SeasonEpisodesEditor', () => {
  it('gives each season its own episode count', async () => {
    const onChange = vi.fn();
    render(<Seasons initial={[[30, 30, 30]]} onChange={onChange} />);

    await userEvent.click(screen.getByRole('button', { name: '2 mùa' }));
    await userEvent.click(screen.getByRole('button', { name: 'Tăng số tập mùa 2' }));

    expect(onChange).toHaveBeenLastCalledWith([
      [30, 30, 30],
      [30, 30, 30, 30],
    ]);
    expect(screen.getByText('2 mùa · 7 tập')).toBeInTheDocument();
  });

  it('lets a duration be typed freely and keeps it within the limit on blur', async () => {
    const onChange = vi.fn();
    render(<Seasons initial={[[30, 30, 30]]} onChange={onChange} />);

    const field = screen.getByLabelText('Thời lượng mùa 1 tập 2 (phút)');
    await userEvent.clear(field);
    await userEvent.type(field, '18');
    expect(onChange).toHaveBeenLastCalledWith([[30, 18, 30]]);

    await userEvent.clear(field);
    await userEvent.type(field, '99');
    await userEvent.tab();
    expect(field).toHaveValue(30);
    expect(onChange).toHaveBeenLastCalledWith([[30, 30, 30]]);
  });

  it('applies the common duration to one season only', async () => {
    const onChange = vi.fn();
    render(<Seasons initial={[[30, 30, 30], [30, 30, 30]]} onChange={onChange} />);

    const common = screen.getByLabelText('Thời lượng chung (phút)');
    await userEvent.clear(common);
    await userEvent.type(common, '25');
    await userEvent.click(screen.getAllByRole('button', { name: 'Áp dụng 25 phút cho mùa này' })[1]);

    expect(onChange).toHaveBeenLastCalledWith([
      [30, 30, 30],
      [25, 25, 25],
    ]);
  });
});

describe('GenrePicker', () => {
  const genres: ApiGenre[] = [{ id: 'kinh-di', name: 'Kinh dị' }];

  it('finds a genre ignoring diacritics instead of creating a duplicate', async () => {
    const onChange = vi.fn();
    render(<GenrePicker genres={genres} selected={[]} onChange={onChange} onCreate={vi.fn()} />);

    await userEvent.type(screen.getByPlaceholderText('Tìm hoặc nhập thể loại mới…'), 'kinh di{Enter}');

    expect(onChange).toHaveBeenCalledWith(['kinh-di']);
    expect(screen.getByRole('button', { name: /Thêm mới/ })).toBeDisabled();
  });

  it('creates a genre missing from the list and selects it', async () => {
    const onChange = vi.fn();
    const onCreate = vi.fn().mockResolvedValue({ id: 'hau-tan-the', name: 'Hậu tận thế' });
    render(<GenrePicker genres={genres} selected={[]} onChange={onChange} onCreate={onCreate} />);

    await userEvent.type(screen.getByPlaceholderText('Tìm hoặc nhập thể loại mới…'), '  Hậu tận thế ');
    await userEvent.click(screen.getByRole('button', { name: /Thêm mới/ }));

    expect(onCreate).toHaveBeenCalledWith('Hậu tận thế');
    await waitFor(() => expect(onChange).toHaveBeenCalledWith(['hau-tan-the']));
  });
});
