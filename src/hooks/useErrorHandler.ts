
import { useCallback } from 'react';
import { toast } from 'sonner';

export interface ErrorHandlerOptions {
  showToast?: boolean;
  logError?: boolean;
  fallbackMessage?: string;
}

export function useErrorHandler() {
  const handleError = useCallback((
    error: any, 
    options: ErrorHandlerOptions = {}
  ) => {
    const {
      showToast = true,
      logError = true,
      fallbackMessage = 'An unexpected error occurred'
    } = options;

    if (logError) {
      console.error('Error caught by error handler:', error);
    }

    let errorMessage = fallbackMessage;

    if (error?.message) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error?.error?.message) {
      errorMessage = error.error.message;
    }

    // Handle specific Supabase errors
    if (error?.code) {
      switch (error.code) {
        case 'PGRST116':
          errorMessage = 'No data found';
          break;
        case '23505':
          errorMessage = 'This item already exists';
          break;
        case '23503':
          errorMessage = 'Related data not found';
          break;
        case 'auth/user-not-found':
          errorMessage = 'User not found';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many attempts. Please try again later';
          break;
        default:
          if (error.message) {
            errorMessage = error.message;
          }
      }
    }

    if (showToast) {
      toast.error(errorMessage);
    }

    return errorMessage;
  }, []);

  const handleAsyncError = useCallback(async <T>(
    asyncOperation: () => Promise<T>,
    options: ErrorHandlerOptions & { onError?: (error: any) => void } = {}
  ): Promise<T | null> => {
    try {
      return await asyncOperation();
    } catch (error) {
      const errorMessage = handleError(error, options);
      
      if (options.onError) {
        options.onError(error);
      }

      return null;
    }
  }, [handleError]);

  return {
    handleError,
    handleAsyncError
  };
}
