/**
 * Utility to format ISO date strings into human-readable 12-hour format
 * Example: "2025-10-18T23:59:00Z" → "October 18, 2025 at 11:59 PM"
 */

export function formatDateForEmail(
  date?: string | Date,
  timeZone: string = 'Africa/Lagos',
): string {
  if (!date) return '';

//   if (typeof date !== 'string' && date instanceof Date) {
//     date = date.toISOString();
//   }

  const d = typeof date === 'string' ? new Date(date) : date;

  // Format: October 18, 2025 at 11:59 PM
  const datePart = d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone,
  });

  const timePart = d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone,
  });

  return `${datePart} at ${timePart}`;
}
