import { getTaskSchedule } from '@sol/services';
import { useMutation } from 'react-query';

import type { TaskType } from 'common/types';

type ScheduleResponse = Partial<TaskType>;

interface MutationParams {
  onMutate?: () => void;
  onSuccess?: (data: ScheduleResponse) => void;
  onError?: (error: string) => void;
}

export function useGetTaskScheduleMutation({
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

  const onMutationSuccess = (data: ScheduleResponse) => {
    onSuccess && onSuccess(data);
  };

  return useMutation(getTaskSchedule, {
    onError: onMutationError,
    onMutate: onMutationTriggered,
    onSuccess: onMutationSuccess,
  });
}
