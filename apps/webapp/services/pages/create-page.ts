import { createPage } from '@sol/services';
import { useMutation } from 'react-query';

import type { PageType } from 'common/types';

interface MutationParams {
  onMutate?: () => void;
  onSuccess?: (data: PageType) => void;
  onError?: (error: string) => void;
}

export function useCreatePageMutation({
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

  const onMutationSuccess = (data: PageType) => {
    onSuccess && onSuccess(data);
  };

  return useMutation(createPage, {
    onError: onMutationError,
    onMutate: onMutationTriggered,
    onSuccess: onMutationSuccess,
  });
}
