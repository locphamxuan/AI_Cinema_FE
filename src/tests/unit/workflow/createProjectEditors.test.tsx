import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SeasonEpisodesEditor } from '@/features/workflow/components/reviewer/modals/SeasonEpisodesEditor';
import { GenrePicker } from '@/features/workflow/components/reviewer/modals/GenrePicker';
import { SubtitleLanguagePicker } from '@/features/workflow/components/reviewer/modals/SubtitleLanguagePicker';
import type { ApiGenre } from '@/types/workflow-api';

function Seasons({ initial, onChange, maxMinutes = 45 }: { initial: number[][]; onChange: (s: number[][]) => void; maxMinutes?: number | null }) {
  const [seasons, setSeasons] = useState(initial);
  return (
    <SeasonEpisodesEditor
      seasons={seasons}
      maxMinutes={maxMinutes}
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

    await userEvent.click(screen.getByRole('button', { name: 'Thêm mùa 2' }));
    await userEvent.click(screen.getByRole('button', { name: 'Thêm 1 tập ở mùa 2' }));

    expect(onChange).toHaveBeenLastCalledWith([
      [30, 30, 30],
      [30, 30, 30, 30],
    ]);
    expect(screen.getByText('2 mùa · 7 tập · 210 phút')).toBeInTheDocument();
  });

  it('lets the episode count be typed, within the season limits', async () => {
    const onChange = vi.fn();
    render(<Seasons initial={[[30, 30, 30]]} onChange={onChange} />);

    const count = screen.getByRole('spinbutton', { name: 'Số tập mùa 1' });
    await userEvent.clear(count);
    await userEvent.type(count, '5');
    expect(onChange).toHaveBeenLastCalledWith([[30, 30, 30, 30, 30]]);
    expect(screen.getByRole('button', { name: 'Thêm 1 tập ở mùa 1' })).toBeDisabled();
  });

  it('keeps a duration over the Admin limit as typed and flags it instead of cutting it', async () => {
    const onChange = vi.fn();
    render(<Seasons initial={[[30, 30, 30]]} onChange={onChange} />);

    const field = screen.getByLabelText('Thời lượng mùa 1 tập 2 (phút)');
    await userEvent.clear(field);
    await userEvent.type(field, '18');
    expect(onChange).toHaveBeenLastCalledWith([[30, 18, 30]]);

    await userEvent.clear(field);
    await userEvent.type(field, '50');
    await userEvent.tab();
    expect(field).toHaveValue(50);
    expect(field).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('1 tập dài hơn mức tối đa 45 phút');
  });

  it('flags nothing when the Admin removed the limit', async () => {
    render(<Seasons initial={[[120, 90, 30]]} onChange={vi.fn()} maxMinutes={null} />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByText(/thời lượng tập không giới hạn/)).toBeInTheDocument();
  });

  it('removes a season but always keeps one', async () => {
    const onChange = vi.fn();
    render(<Seasons initial={[[30, 30, 30], [20, 20, 20]]} onChange={onChange} />);

    await userEvent.click(screen.getByRole('button', { name: 'Xoá mùa 1' }));

    expect(onChange).toHaveBeenLastCalledWith([[20, 20, 20]]);
    expect(screen.queryByRole('button', { name: /Xoá mùa/ })).not.toBeInTheDocument();
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

describe('SubtitleLanguagePicker', () => {
  it('adds a translation language after the source one', async () => {
    const onChange = vi.fn();
    render(<SubtitleLanguagePicker selected={['vi']} onChange={onChange} />);

    await userEvent.click(screen.getByRole('button', { name: /English/ }));

    expect(onChange).toHaveBeenCalledWith(['vi', 'en']);
  });

  it('keeps at least one subtitle language', async () => {
    const onChange = vi.fn();
    render(<SubtitleLanguagePicker selected={['vi']} onChange={onChange} />);

    const only = screen.getByRole('button', { name: /Tiếng Việt/ });
    expect(only).toBeDisabled();
    await userEvent.click(only);
    expect(onChange).not.toHaveBeenCalled();
  });
});
