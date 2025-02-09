import type { IntegrationAccount } from '@sigma/types';

import { createIntegrationAccountWithoutOAuth } from '@sigma/services';
import { useMutation } from 'react-query';

interface MutationParams {
  onMutate?: () => void;
  onSuccess?: (data: IntegrationAccount) => void;
  onError?: (error: string) => void;
}

export function useCreateIntegrationAccountMutation({
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

  const onMutationSuccess = (data: IntegrationAccount) => {
    onSuccess && onSuccess(data);
  };

  return useMutation(createIntegrationAccountWithoutOAuth, {
    onError: onMutationError,
    onMutate: onMutationTriggered,
    onSuccess: onMutationSuccess,
  });
}
