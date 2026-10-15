export type SafeJsonResult<T> = { success: true; data: T } | { success: false; error: SyntaxError };

export function safeParseJSON<T = unknown>(text: string): SafeJsonResult<T> {
  try {
    return { success: true, data: JSON.parse(text) as T };
  } catch (error) {
    return {
      success: false,
      error: error instanceof SyntaxError ? error : new SyntaxError('Invalid JSON.'),
    };
  }
}

export function safeStringifyJSON(value: unknown, space?: string | number): string | null {
  try {
    const result = JSON.stringify(value, null, space);
    return typeof result === 'string' ? result : null;
  } catch {
    return null;
  }
}

export const safeJsonParse = safeParseJSON;
export const safeJsonStringify = safeStringifyJSON;
