/**
 * Fetch wrapper with automatic retry and exponential backoff
 * Used for LLM API calls that may fail transiently
 */

export async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxAttempts = 3
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(url, options);

      // Don't retry client errors (4xx) - only server errors (5xx)
      if (response.ok || response.status < 500) {
        return response;
      }

      lastError = new Error(`Server error: ${response.status}`);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Network error');
    }

    // Wait before retry (exponential backoff: 1s, 2s, 4s)
    if (attempt < maxAttempts) {
      const delay = 1000 * Math.pow(2, attempt - 1);
      console.log(`Retry attempt ${attempt}/${maxAttempts} after ${delay}ms...`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  throw lastError || new Error('Request failed after retries');
}
