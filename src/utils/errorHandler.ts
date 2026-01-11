/**
 * Centralized error handling framework
 */

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public userMessage: string,
    public recoverable: boolean = true,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    delay?: number;
    backoff?: boolean;
  } = {}
): Promise<T> {
  const { maxRetries = 3, delay = 1000, backoff = true } = options;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;

      const waitTime = backoff ? delay * Math.pow(2, i) : delay;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }

  throw new Error('Max retries exceeded');
}

export function getUserFriendlyError(error: unknown): string {
  if (error instanceof AppError) {
    return error.userMessage;
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (message.includes('network') || message.includes('fetch')) {
      return 'Network error. Please check your internet connection.';
    }

    if (message.includes('permission') || message.includes('denied')) {
      return 'Permission denied. Please check your settings.';
    }

    if (message.includes('timeout')) {
      return 'Request timed out. Please try again.';
    }

    if (message.includes('rate limit')) {
      return error.message; // Already user-friendly
    }

    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
}

export function logError(error: unknown, context?: string) {
  console.error(`[Error${context ? ` - ${context}` : ''}]:`, error);

  // Send to Sentry if configured
  if (typeof window !== 'undefined' && (window as any).Sentry) {
    (window as any).Sentry.captureException(error, {
      tags: { context },
    });
  }
}

export function handleError(error: unknown, context?: string): string {
  logError(error, context);
  return getUserFriendlyError(error);
}
