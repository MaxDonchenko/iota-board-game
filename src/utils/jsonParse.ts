/**
 * Utility for safe JSON parsing with TypeScript type casting
 * Provides a one-liner for parsing JSON with proper typing
 */

/**
 * Parse JSON string with TypeScript type assertion
 * @param json - JSON string to parse
 * @param fallback - Optional fallback value if parsing fails
 * @returns Parsed object with the specified type, or fallback
 */
export function parseJson<T>(json: string, fallback?: T): T {
  try {
    return JSON.parse(json) as T;
  } catch (e) {
    if (fallback !== undefined) {
      return fallback;
    }
    throw new Error(`Failed to parse JSON: ${e instanceof Error ? e.message : 'Unknown error'}`);
  }
}
