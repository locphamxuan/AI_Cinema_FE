/**
 * Barrel for demo/seed data, split by domain into wallet.ts, subscription.ts,
 * movie.ts, transactions.ts, chatData.ts. Keep importing from
 * '@/mocks/mockData' — it still re-exports everything.
 */
export * from './wallet';
export * from './subscription';
export * from './movie';
export * from './transactions';
export * from './chatData';
