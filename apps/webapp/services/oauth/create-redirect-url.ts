import { createRedirectURL, type RedirectURLResponse } from '@sol/services';
import { useMutation } from 'react-query';

export interface MutationParams {
  onMutate?: () => void;
  onSuccess?: (data: RedirectURLResponse) => void;
  onError?: (error: string) => void;
}

export function useCreateRedirectURLMutation({
  onMutate,
  onSuccess,
  onError,
}: MutationParams) {
  const onMutationTriggered = () => {
    onMutate && onMutate();
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onMutationError = (errorResponse: any) => {
    const errorText = errorResponse?.errors?.message || 'Error occured';

    onError && onError(errorText);
  };

  const onMutationSuccess = (data: RedirectURLResponse) => {
    onSuccess && onSuccess(data);
  };

  return useMutation(createRedirectURL, {
    onError: onMutationError,
    onMutate: onMutationTriggered,
    onSuccess: onMutationSuccess,
  });
}
