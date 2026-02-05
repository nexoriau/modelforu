/**
 * Debounce Hook
 *
 * Delays updating a value until after a specified delay period has passed
 * without the value changing. Useful for optimizing expensive operations
 * like API calls triggered by user input.
 *
 * Common Use Cases:
 * - Search input fields (wait for user to stop typing)
 * - Form validation (validate after user pauses)
 * - Auto-save functionality (save after editing stops)
 * - Filtering/sorting operations
 *
 * @example
 * const [searchTerm, setSearchTerm] = useState('');
 * const [debouncedSearch] = useDebounce(searchTerm, 500);
 *
 * // API call only triggers 500ms after user stops typing
 * useEffect(() => {
 *   fetchResults(debouncedSearch);
 * }, [debouncedSearch]);
 */
import { useEffect, useState } from "react";

/**
 * Returns a debounced version of the provided value
 *
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds before updating the debounced value
 * @returns Array containing the debounced value
 */
export function useDebounce<T>(value: T, delay: number): [T] {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set up a timer to update the debounced value after the delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timer if value changes before delay completes
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return [debouncedValue];
}
