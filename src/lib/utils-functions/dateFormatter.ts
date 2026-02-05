/**
 * Date Formatting Utility
 *
 * Formats dates using moment.js with custom format strings.
 * Wrapper around moment().format() for consistent date formatting across the app.
 *
 * @param date - Date to format (Date object, string, or timestamp)
 * @param formate - Moment.js format string (e.g., 'YYYY-MM-DD', 'MMM DD, YYYY')
 * @returns Formatted date string
 *
 * @example
 * dateFormatter(new Date(), 'YYYY-MM-DD') // "2026-01-28"
 * dateFormatter('2026-01-28', 'MMM DD, YYYY') // "Jan 28, 2026"
 */
import moment from "moment";

export const dateFormatter = (date: any, formate: string) => {
  return moment(date).format(formate);
};
