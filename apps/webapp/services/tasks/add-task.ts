import { createTask } from '@sigma/services';
import { useMutation } from 'react-query';

import type { TaskType } from 'common/types';

interface MutationParams {
  onMutate?: () => void;
  onSuccess?: (data: TaskType | undefined) => void;
  onError?: (error: string) => void;
}

export function useCreateTaskMutation({
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

  const onMutationSuccess = (data: TaskType) => {
    onSuccess && onSuccess(data);
  };

  return useMutation(createTask, {
    onError: onMutationError,
    onMutate: onMutationTriggered,
    onSuccess: onMutationSuccess,
  });
}
