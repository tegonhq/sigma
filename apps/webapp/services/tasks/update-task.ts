import { updateTask, type UpdateTaskDtoWithId } from '@sol/services';
import { useMutation } from 'react-query';

import type { TaskType } from 'common/types';

import { useContextStore } from 'store/global-context-provider';

interface MutationParams {
  onMutate?: () => void;
  onSuccess?: (data: TaskType) => void;
  onError?: (error: string) => void;
}

export function useUpdateTaskMutation({
  onMutate,
  onSuccess,
  onError,
}: MutationParams) {
  const { tasksStore } = useContextStore();

  const onMutationTriggered = () => {
    onMutate && onMutate();
  };

  const update = ({ taskId, ...otherParams }: UpdateTaskDtoWithId) => {
    const task = tasksStore.getTaskWithId(taskId);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const taskJSON = (task as any).toJSON();

    try {
      tasksStore.update({ ...taskJSON, ...otherParams }, taskId);

      return updateTask({ ...otherParams, taskId });
    } catch (e) {
      tasksStore.update(taskJSON, taskId);
      return undefined;
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onMutationError = (errorResponse: any) => {
    const errorText = errorResponse?.errors?.message || 'Error occured';

    onError && onError(errorText);
  };

  const onMutationSuccess = (data: TaskType) => {
    onSuccess && onSuccess(data);
  };

  return useMutation(update, {
    onError: onMutationError,
    onMutate: onMutationTriggered,
    onSuccess: onMutationSuccess,
  });
}
