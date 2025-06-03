import { createAuthCode } from '@sol/services';
import { useMutation } from 'react-query';

export interface AuthCodeResponse {
  code: string;
}

interface MutationParams {
  onMutate?: () => void;
  onSuccess?: (data: AuthCodeResponse) => void;
  onError?: (error: string) => void;
}

export function useCreateAuthCodeMutation({
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

  const onMutationSuccess = (data: AuthCodeResponse) => {
    onSuccess && onSuccess(data);
  };

  return useMutation(createAuthCode, {
    onError: onMutationError,
    onMutate: onMutationTriggered,
    onSuccess: onMutationSuccess,
  });
}
