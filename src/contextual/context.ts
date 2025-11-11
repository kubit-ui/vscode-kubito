/**
 * Temporal context detection for contextual messages
 * Provides time-aware message selection based on day of week, time of day, etc.
 */

/**
 * Time-based context types
 */
export enum TimeContext {
  MORNING = 'morning',
  AFTERNOON = 'afternoon',
  EVENING = 'evening',
  LATE_NIGHT = 'lateNight',
  MONDAY = 'monday',
  TUESDAY = 'tuesday',
  WEDNESDAY = 'wednesday',
  THURSDAY = 'thursday',
  FRIDAY = 'friday',
  SATURDAY = 'saturday',
  SUNDAY = 'sunday',
  WEEKEND = 'weekend',
  WORKDAY = 'workday'
}

/**
 * Context-based message mapping
 * Maps time contexts to specific message keys that should be prioritized
 */
export const CONTEXTUAL_MESSAGES: Record<TimeContext, string[]> = {
  [TimeContext.MORNING]: ['letsCode', 'coffee', 'caffeinated', 'productive', 'inspired'],
  [TimeContext.AFTERNOON]: ['keepCoding', 'productive', 'refactorTime', 'almostThere'],
  [TimeContext.EVENING]: ['workingLate', 'oneMoreBug', 'almostThere', 'tired'],
  [TimeContext.LATE_NIGHT]: ['workingLate', 'tired', 'sleeping', 'caffeinated', 'infiniteLoop'],
  [TimeContext.MONDAY]: ['mondayBlues', 'letsCode', 'coffee', 'motivated'],
  [TimeContext.TUESDAY]: ['keepCoding', 'productive', 'debugTime'],
  [TimeContext.WEDNESDAY]: ['keepCoding', 'refactorTime', 'testsPassing'],
  [TimeContext.THURSDAY]: ['almostThere', 'productive', 'greatCode'],
  [TimeContext.FRIDAY]: ['fridayFeeling', 'deployFriday', 'almostThere', 'weekend'],
  [TimeContext.SATURDAY]: ['weekend', 'procrastinating', 'inspired'],
  [TimeContext.SUNDAY]: ['weekend', 'procrastinating', 'mondayBlues'],
  [TimeContext.WEEKEND]: ['weekend', 'procrastinating', 'inspired', 'sideProject'],
  [TimeContext.WORKDAY]: ['productive', 'keepCoding', 'meetingTime', 'debugTime']
};

/**
 * Time range definitions
 */
interface TimeRange {
  start: number; // Hour in 24h format
  end: number; // Hour in 24h format
}

/**
 * Time ranges for different parts of the day
 */
export const TIME_RANGES = {
  morning: { start: 6, end: 12 },
  afternoon: { start: 12, end: 18 },
  evening: { start: 18, end: 22 },
  lateNight: { start: 22, end: 6 } // Wraps around midnight
} as const;

/**
 * Gets the current time context based on the system time
 * @returns Array of applicable time contexts
 */
export function getCurrentTimeContexts(): TimeContext[] {
  const now = new Date();
  const hour = now.getHours();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.

  const contexts: TimeContext[] = [];

  // Add time-of-day contexts
  if (isInTimeRange(hour, TIME_RANGES.morning)) {
    contexts.push(TimeContext.MORNING);
  } else if (isInTimeRange(hour, TIME_RANGES.afternoon)) {
    contexts.push(TimeContext.AFTERNOON);
  } else if (isInTimeRange(hour, TIME_RANGES.evening)) {
    contexts.push(TimeContext.EVENING);
  } else if (isInTimeRange(hour, TIME_RANGES.lateNight)) {
    contexts.push(TimeContext.LATE_NIGHT);
  }

  // Add day-of-week contexts
  switch (dayOfWeek) {
    case 0: // Sunday
      contexts.push(TimeContext.SUNDAY, TimeContext.WEEKEND);
      break;
    case 1: // Monday
      contexts.push(TimeContext.MONDAY, TimeContext.WORKDAY);
      break;
    case 2: // Tuesday
      contexts.push(TimeContext.TUESDAY, TimeContext.WORKDAY);
      break;
    case 3: // Wednesday
      contexts.push(TimeContext.WEDNESDAY, TimeContext.WORKDAY);
      break;
    case 4: // Thursday
      contexts.push(TimeContext.THURSDAY, TimeContext.WORKDAY);
      break;
    case 5: // Friday
      contexts.push(TimeContext.FRIDAY, TimeContext.WORKDAY);
      break;
    case 6: // Saturday
      contexts.push(TimeContext.SATURDAY, TimeContext.WEEKEND);
      break;
  }

  return contexts;
}

/**
 * Checks if a given hour falls within a time range
 * Handles ranges that wrap around midnight (e.g., 22:00 to 06:00)
 */
function isInTimeRange(hour: number, range: TimeRange): boolean {
  if (range.start <= range.end) {
    // Normal range (e.g., 9-17)
    return hour >= range.start && hour < range.end;
  } else {
    // Range wraps around midnight (e.g., 22-6)
    return hour >= range.start || hour < range.end;
  }
}

/**
 * Gets contextual message keys for the current time
 * @returns Array of message keys that are contextually relevant
 */
export function getContextualMessageKeys(): string[] {
  const contexts = getCurrentTimeContexts();
  const contextualKeys = new Set<string>();

  // Collect all contextual message keys
  contexts.forEach(context => {
    const messages = CONTEXTUAL_MESSAGES[context] || [];
    messages.forEach(key => contextualKeys.add(key));
  });

  return Array.from(contextualKeys);
}

/**
 * Gets a weighted selection bias for contextual messages
 * Contextual messages get higher probability of being selected
 * @returns Object with bias weights for message selection
 */
export function getContextualBias(): { contextualKeys: string[]; biasWeight: number } {
  const contextualKeys = getContextualMessageKeys();

  // Higher bias weight means contextual messages are more likely to be selected
  const biasWeight = contextualKeys.length > 0 ? 3 : 1;

  return {
    contextualKeys,
    biasWeight
  };
}

/**
 * Configuration for contextual messaging
 */
export interface ContextualConfig {
  enabled: boolean;
  biasWeight: number; // How much to favor contextual messages (1-10)
  fallbackToRandom: boolean; // Whether to fall back to random if no contextual messages
}

/**
 * Default contextual configuration
 */
export const DEFAULT_CONTEXTUAL_CONFIG: ContextualConfig = {
  enabled: true,
  biasWeight: 3,
  fallbackToRandom: true
};
