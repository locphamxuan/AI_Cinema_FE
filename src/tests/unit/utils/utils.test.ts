import { describe, it, expect } from 'vitest';
import { formatNumber, formatCoin, formatVND, formatDuration, formatDate, cn } from '@/lib/utils';

describe('Utility Functions (src/lib/utils.ts)', () => {
  describe('formatNumber', () => {
    it('formats numbers with Vietnamese separators', () => {
      expect(formatNumber(1000)).toBe('1.000');
      expect(formatNumber(1250000)).toBe('1.250.000');
      expect(formatNumber(0)).toBe('0');
    });
  });

  describe('formatCoin', () => {
    it('formats main coin without prefix', () => {
      expect(formatCoin(120, 'main')).toBe('120 Coin');
    });

    it('formats bonus coin with plus prefix', () => {
      expect(formatCoin(80, 'bonus')).toBe('+80 Coin');
    });
  });

  describe('formatVND', () => {
    it('formats numeric values into currency string', () => {
      const result = formatVND(99000);
      expect(result).toContain('99.000');
    });
  });

  describe('formatDuration', () => {
    it('formats duration in minutes to hours and minutes', () => {
      expect(formatDuration(105)).toBe('1h 45m');
      expect(formatDuration(60)).toBe('1 giờ');
      expect(formatDuration(45)).toBe('45 phút');
      expect(formatDuration(0)).toBe('0 phút');
    });
  });

  describe('formatDate', () => {
    it('formats ISO date string properly', () => {
      const formatted = formatDate('2026-03-01T10:00:00Z');
      expect(formatted).toBeDefined();
      expect(typeof formatted).toBe('string');
    });
  });

  describe('cn (Classnames)', () => {
    it('joins truthy classnames cleanly', () => {
      expect(cn('btn', 'btn-primary', false && 'hidden', null, undefined, 'active')).toBe(
        'btn btn-primary active'
      );
    });
  });
});
