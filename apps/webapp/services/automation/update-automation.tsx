import { updateAutomation } from '@sol/services';
import { useMutation } from 'react-query';

import type { AutomationType } from 'common/types';

interface MutationParams {
  onMutate?: () => void;
  onSuccess?: (data: AutomationType) => void;
  onError?: (error: string) => void;
}

export function useUpdateAutomationMutation({
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

  const onMutationSuccess = (data: AutomationType) => {
    onSuccess && onSuccess(data);
  };

  return useMutation(updateAutomation, {
    onError: onMutationError,
    onMutate: onMutationTriggered,
    onSuccess: onMutationSuccess,
  });
}
