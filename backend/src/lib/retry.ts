/**
 * Retry utility with exponential backoff
 * Attempts a function multiple times with increasing delays between attempts
 */

interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number; // milliseconds
  maxDelay?: number; // milliseconds
  backoffMultiplier?: number;
  onRetry?: (attempt: number, error: Error) => void;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
  onRetry: () => {},
};

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Calculate delay for next retry attempt using exponential backoff
 */
function calculateDelay(attempt: number, options: Required<RetryOptions>): number {
  const delay = options.initialDelay * Math.pow(options.backoffMultiplier, attempt - 1);
  return Math.min(delay, options.maxDelay);
}

/**
 * Check if error is retryable
 */
function isRetryableError(error: any): boolean {
  // Network errors
  if (error.code === 'ECONNRESET' || 
      error.code === 'ETIMEDOUT' || 
      error.code === 'ENOTFOUND' ||
      error.code === 'ECONNREFUSED') {
    return true;
  }

  // HTTP status codes that are retryable
  const retryableStatusCodes = [408, 429, 500, 502, 503, 504];
  if (error.statusCode && retryableStatusCodes.includes(error.statusCode)) {
    return true;
  }

  // Check error message for common retryable patterns
  const errorMessage = error.message?.toLowerCase() || '';
  if (errorMessage.includes('network') ||
      errorMessage.includes('timeout') ||
      errorMessage.includes('rate limit') ||
      errorMessage.includes('temporary') ||
      errorMessage.includes('try again')) {
    return true;
  }

  return false;
}

/**
 * Retry a function with exponential backoff
 * 
 * @param fn - The async function to retry
 * @param options - Retry configuration options
 * @returns Promise resolving to the function result
 * @throws The last error if all attempts fail
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Don't retry if not retryable error
      if (!isRetryableError(error)) {
        console.log(`[Retry] Non-retryable error on attempt ${attempt}:`, error.message);
        throw error;
      }

      // Don't retry if this was the last attempt
      if (attempt === opts.maxAttempts) {
        console.log(`[Retry] Max attempts (${opts.maxAttempts}) reached. Giving up.`);
        break;
      }

      // Calculate delay and notify
      const delay = calculateDelay(attempt, opts);
      console.log(`[Retry] Attempt ${attempt}/${opts.maxAttempts} failed. Retrying in ${delay}ms...`);
      opts.onRetry(attempt, error);

      // Wait before next attempt
      await sleep(delay);
    }
  }

  // All attempts failed
  throw lastError!;
}

/**
 * Wrap a function to automatically retry on failure
 * 
 * @param fn - The async function to wrap
 * @param options - Retry configuration options
 * @returns A wrapped function that retries on failure
 */
export function withRetry<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: RetryOptions = {}
): T {
  return ((...args: any[]) => {
    return retryWithBackoff(() => fn(...args), options);
  }) as T;
}
