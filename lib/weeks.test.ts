import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getWeekBounds, isWithinCurrentWeek, getPreviousWeekStart, formatWeekDisplay } from './weeks';

describe('Weeks Utilities', () => {
  beforeEach(() => {
    // Mock the current date to a known Monday for consistent testing
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01')); // This is a Monday
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('getWeekBounds', () => {
    it('should return correct week bounds for Monday', () => {
      const result = getWeekBounds(new Date('2024-01-01')); // Monday
      
      expect(result.start).toEqual(new Date('2024-01-01T00:00:00.000Z'));
      expect(result.end).toEqual(new Date('2024-01-07T23:59:59.999Z'));
    });

    it('should return correct week bounds for Wednesday', () => {
      const result = getWeekBounds(new Date('2024-01-03')); // Wednesday
      
      expect(result.start).toEqual(new Date('2024-01-01T00:00:00.000Z'));
      expect(result.end).toEqual(new Date('2024-01-07T23:59:59.999Z'));
    });

    it('should return correct week bounds for Sunday', () => {
      const result = getWeekBounds(new Date('2024-01-07')); // Sunday
      
      expect(result.start).toEqual(new Date('2024-01-01T00:00:00.000Z'));
      expect(result.end).toEqual(new Date('2024-01-07T23:59:59.999Z'));
    });

    it('should use current date when no date provided', () => {
      const result = getWeekBounds();
      
      expect(result.start).toEqual(new Date('2024-01-01T00:00:00.000Z'));
      expect(result.end).toEqual(new Date('2024-01-07T23:59:59.999Z'));
    });
  });

  describe('isWithinCurrentWeek', () => {
    it('should return true for dates within current week', () => {
      expect(isWithinCurrentWeek(new Date('2024-01-01'))).toBe(true); // Monday
      expect(isWithinCurrentWeek(new Date('2024-01-03'))).toBe(true); // Wednesday
      expect(isWithinCurrentWeek(new Date('2024-01-07'))).toBe(true); // Sunday
    });

    it('should return false for dates outside current week', () => {
      expect(isWithinCurrentWeek(new Date('2023-12-31'))).toBe(false); // Previous Sunday
      expect(isWithinCurrentWeek(new Date('2024-01-08'))).toBe(false); // Next Monday
    });
  });

  describe('getPreviousWeekStart', () => {
    it('should return start of previous week', () => {
      const result = getPreviousWeekStart();
      
      expect(result).toEqual(new Date('2023-12-25T00:00:00.000Z')); // Previous Monday
    });
  });

  describe('formatWeekDisplay', () => {
    it('should format week within same month', () => {
      const result = formatWeekDisplay(new Date('2024-01-01'));
      
      expect(result).toBe('Jan 1 - 7, 2024');
    });

    it('should format week spanning two months', () => {
      const result = formatWeekDisplay(new Date('2024-01-29')); // Week starting Jan 29 ends Feb 4
      
      expect(result).toBe('Jan 29 - Feb 4, 2024');
    });

    it('should format week spanning two years', () => {
      const result = formatWeekDisplay(new Date('2023-12-25')); // Week starting Dec 25 ends Dec 31
      
      expect(result).toBe('Dec 25 - 31, 2023');
    });
  });
});
