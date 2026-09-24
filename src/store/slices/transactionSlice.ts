import type { StateCreator } from 'zustand';
import { Transaction } from '@/types/transaction';
import type { AppState, TransactionSlice } from './types';

export const createTransactionSlice: StateCreator<AppState, [], [], TransactionSlice> = (set) => ({
  transactions: [],

  addTransaction: (tx) => {
    const id = `TXN-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(
      Math.floor(Math.random() * 1000)
    ).padStart(3, '0')}`;
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
