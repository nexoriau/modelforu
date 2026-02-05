/**
 * Database Query Execution Wrapper
 *
 * Provides standardized error handling for database queries.
 * Similar to executeAction but for read operations (queries vs mutations).
 * Returns null on error instead of throwing to prevent crashes.
 *
 * @example
 * const users = await executeQuery({
 *   queryFn: async () => await db.query.usersTable.findMany(),
 *   serverErrorMessage: 'Failed to fetch users'
 * });
 */
type Options<T> = {
  queryFn: () => Promise<T>; // The query function to execute
  serverErrorMessage: string; // Error message for logging
  isProtected?: boolean; // Whether to check authentication (not yet implemented)
};

/**
 * Executes a database query with error handling
 *
 * @param options - Query configuration
 * @returns Query result or null if error occurs
 */
export async function executeQuery<T>({
  queryFn,
  serverErrorMessage,
  isProtected = false,
}: Options<T>) {
  try {
    // TODO: Add authentication check when isProtected is true
    if (isProtected) {
      console.log("add protected code here");
    }

    return await queryFn();
  } catch (error) {
    // Log error but return null to prevent crashes
    console.error(serverErrorMessage, error);
    return null;
  }
}
