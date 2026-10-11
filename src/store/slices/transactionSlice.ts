import type { StateCreator } from 'zustand';
import { Transaction } from '@/types/transaction';
import type { AppState, TransactionSlice } from './types';
import { randomInt } from '@/lib/random';

export const createTransactionSlice: StateCreator<AppState, [], [], TransactionSlice> = (set) => ({
  transactions: [],

  addTransaction: (tx) => {
    const id = `TXN-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${randomInt(0, 999).toString().padStart(3, '0')}`;
    const newTx: Transaction = {
      ...tx,
      id,
      createdAt: new Date().toISOString(),
    };
    set((s) => ({
      transactions: [newTx, ...s.transactions],
    }));
  },
});
