import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AdBreakOverlay } from '@/components/watch/PlayerOverlays';
import type { AdScheduleItem } from '@/types/playback';

const cue: AdScheduleItem = {
  breakId: 'b1',
  positionSeconds: 60,
  ad: { id: 'a1', title: 'TestQC', mediaUrl: 'https://cdn.example/ad.mp4', clickUrl: null, durationSeconds: 15 },
};

describe('AdBreakOverlay', () => {
  it('offers "Bỏ qua quảng cáo" only once the ad has played to the end', () => {
    const onDone = vi.fn();
    render(<AdBreakOverlay cue={cue} onDone={onDone} />);
    expect(screen.queryByText(/Bỏ qua quảng cáo/)).toBeNull();
    expect(screen.getByText('Quảng cáo · 0:15')).toBeTruthy();

    fireEvent.ended(screen.getByTestId('ad-break').querySelector('video')!);
    expect(onDone).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText(/Bỏ qua quảng cáo/));

    expect(onDone).toHaveBeenCalledWith(true);
  });

  it('hands the episode back without a completed view when the ad cannot load', () => {
    const onDone = vi.fn();
    render(<AdBreakOverlay cue={cue} onDone={onDone} />);
    fireEvent.error(screen.getByTestId('ad-break').querySelector('video')!);
    expect(onDone).toHaveBeenCalledWith(false);
  });
});
