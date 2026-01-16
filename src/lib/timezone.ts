import { format } from 'date-fns';

// Timezone offsets in hours from UTC
const TIMEZONE_OFFSETS: Record<string, number> = {
  'Asia/Shanghai': 8,
  'America/Los_Angeles': -8, // PST (winter)
  'America/New_York': -5, // EST (winter)
  'UTC': 0,
};

const TIMEZONE_LABELS: Record<string, string> = {
  'Asia/Shanghai': '北京时间',
  'America/Los_Angeles': '北美西部',
  'America/New_York': '北美东部',
  'UTC': 'UTC',
};

/**
 * Parse a datetime string in a specific timezone and return a UTC Date
 */
export function parseInTimezone(dateTimeStr: string, timezone: string): Date {
  const offset = TIMEZONE_OFFSETS[timezone] || 0;
  const localDate = new Date(dateTimeStr);
  // Adjust to UTC by subtracting the timezone offset
  return new Date(localDate.getTime() - offset * 60 * 60 * 1000);
}

/**
 * Format a UTC date in a specific timezone
 */
export function formatInTimezone(utcDate: Date, timezone: string, formatStr: string = 'yyyy-MM-dd HH:mm'): string {
  const offset = TIMEZONE_OFFSETS[timezone] || 0;
  const localDate = new Date(utcDate.getTime() + offset * 60 * 60 * 1000);
  return format(localDate, formatStr);
}

/**
 * Get display string for a scheduled time with both timezones
 */
export function getTimezoneDisplays(
  dateTimeStr: string, 
  originalTimezone: string,
  targetTimezone: string = 'America/Los_Angeles'
): { original: string; converted: string; originalLabel: string; convertedLabel: string } {
  const utcDate = parseInTimezone(dateTimeStr, originalTimezone);
  
  return {
    original: formatInTimezone(utcDate, originalTimezone, 'M月d日 HH:mm'),
    converted: formatInTimezone(utcDate, targetTimezone, 'M月d日 HH:mm'),
    originalLabel: TIMEZONE_LABELS[originalTimezone] || originalTimezone,
    convertedLabel: TIMEZONE_LABELS[targetTimezone] || targetTimezone,
  };
}

/**
 * Get a formatted string showing both timezone times
 */
export function formatDualTimezone(
  dateTimeStr: string, 
  originalTimezone: string,
  targetTimezone: string = 'America/Los_Angeles'
): string {
  const displays = getTimezoneDisplays(dateTimeStr, originalTimezone, targetTimezone);
  return `${displays.original} (${displays.originalLabel}) / ${displays.converted} (${displays.convertedLabel})`;
}
