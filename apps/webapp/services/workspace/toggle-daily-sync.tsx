import axios from 'axios';
import { useMutation, useQueryClient } from 'react-query';
import { GetUserQuery } from 'services/users';

export function toggleDailySync(value: boolean) {
  return axios.post(`/api/v1/workspaces/daily-sync`, { value });
}

interface MutationParams {
  onMutate?: () => void;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function useToggleDailySyncMutation({
  onMutate,
  onSuccess,
  onError,
}: MutationParams) {
  const queryClient = useQueryClient();

  const onMutationTriggered = () => {
    onMutate && onMutate();
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onMutationError = (errorResponse: any) => {
    const errorText = errorResponse?.errors?.message || 'Error occured';

    onError && onError(errorText);
  };

  const onMutationSuccess = () => {
    queryClient.invalidateQueries({ queryKey: [GetUserQuery] });

    onSuccess && onSuccess();
  };

  return useMutation(toggleDailySync, {
    onError: onMutationError,
    onMutate: onMutationTriggered,
    onSuccess: onMutationSuccess,
  });
}
