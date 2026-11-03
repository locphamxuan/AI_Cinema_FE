import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { useAppStore } from '@/store/useAppStore';
import { memberHref } from '@/components/layout/header/NotificationList';
import { Backdrop } from '@/components/ui/Backdrop';

describe('MF-2 client state', () => {
  beforeEach(() => {
    useAppStore.setState({ wallet: { mainCoin: 40, bonusCoin: 10 } });
  });

  it('flags an episode the API granted without charging the wallet again', () => {
    useAppStore.setState({
      currentMovie: { id: 'm1', episodes: [{ id: 'ep-1', isUnlocked: false }] } as never,
      movies: [],
    });

    useAppStore.getState().markEpisodeUnlocked('ep-1');

    const state = useAppStore.getState();
    expect(state.currentMovie?.episodes[0].isUnlocked).toBe(true);
    expect(state.wallet).toEqual({ mainCoin: 40, bonusCoin: 10 });
  });

  it('records a credited check-in without adding a reward of its own', () => {
    useAppStore.getState().markCheckedInToday(3);

    const state = useAppStore.getState();
    expect(state.checkInStreak).toMatchObject({ todayClaimed: true, currentStreak: 3 });
    expect(state.wallet).toEqual({ mainCoin: 40, bonusCoin: 10 });
  });

  it('sends BE notification links to the member pages that exist', () => {
    expect(memberHref('/membership')).toBe('/profile/subscription');
    expect(memberHref('/wallet')).toBe('/profile/transactions');
    expect(memberHref('/watch/ep-1')).toBe('/watch/ep-1');
    expect(memberHref(null)).toBeNull();
  });

  it('closes a backdrop on its own click or Escape, not on a click inside the card', () => {
    const onClose = vi.fn();
    render(
      <Backdrop label="Hộp thoại" onClose={onClose} className="">
        <p>Nội dung</p>
      </Backdrop>,
    );

    fireEvent.click(screen.getByText('Nội dung'));
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('dialog'));
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
