export interface WalletState {
  mainCoin: number;
  bonusCoin: number;
}

/** What the header knows of the check-in: the BE ladder itself is read by the check-in modal. */
export interface CheckInStreak {
  currentStreak: number;
  lastCheckInDate: string | null; // ISO date string
  todayClaimed: boolean;
}
