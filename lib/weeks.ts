/**
 * Utility functions for handling calendar weeks (Monday-Sunday)
 */

/**
 * Get the bounds of a calendar week (Monday 00:00:00 to Sunday 23:59:59.999)
 * @param date - Any date within the week (defaults to current date)
 * @returns Object with start and end dates of the week
 */
export function getWeekBounds(date: Date = new Date()): { start: Date; end: Date } {
  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust to get Monday
  
  const start = new Date(date);
  start.setDate(date.getDate() + mondayOffset);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
}

/**
 * Check if a date is within the current calendar week
 * @param dt - Date to check
 * @returns boolean indicating if the date is within current week
 */
export function isWithinCurrentWeek(dt: Date): boolean {
  const { start, end } = getWeekBounds();
  return dt >= start && dt <= end;
}

/**
 * Get the start date of the previous week
 * @returns Start date of previous week (Monday 00:00:00)
 */
export function getPreviousWeekStart(): Date {
  const { start } = getWeekBounds();
  const previousWeekStart = new Date(start);
  previousWeekStart.setDate(start.getDate() - 7);
  return previousWeekStart;
}

/**
 * Format week start date for display
 * @param weekStart - Week start date
 * @returns Formatted string like "Oct 1 - Oct 7, 2024"
 */
export function formatWeekDisplay(weekStart: Date): string {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  
  const startMonth = weekStart.toLocaleDateString('en-US', { month: 'short' });
  const startDay = weekStart.getDate();
  const endMonth = weekEnd.toLocaleDateString('en-US', { month: 'short' });
  const endDay = weekEnd.getDate();
  const year = weekStart.getFullYear();
  
  if (startMonth === endMonth) {
    return `${startMonth} ${startDay} - ${endDay}, ${year}`;
  } else {
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
  }
}
