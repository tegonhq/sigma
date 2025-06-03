import { createList } from '@sol/services';
import { useMutation } from 'react-query';

import type { ListType } from 'common/types';

interface MutationParams {
  onMutate?: () => void;
  onSuccess?: (data: ListType) => void;
  onError?: (error: string) => void;
}

export function useCreateListMutation({
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

  const onMutationSuccess = (data: ListType) => {
    onSuccess && onSuccess(data);
  };

  return useMutation(createList, {
    onError: onMutationError,
    onMutate: onMutationTriggered,
    onSuccess: onMutationSuccess,
  });
}
