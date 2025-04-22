import { useMutation, useQueryClient } from 'react-query';

import type { User } from 'common/types';
import { GetUserQuery } from './get-user';

export interface UpdateUserParams {
  fullname?: string;
  username?: string;
  userId: string;
  mcp?: string;
}

async function updateUser({
  userId,
  fullname,
  username,
  mcp,
}: UpdateUserParams) {
  const response = await fetch(`/api/v1/users/${userId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fullname, username, mcp }),
  });

  return response.json();
}

interface MutationParams {
  onMutate?: () => void;
  onSuccess?: (data: User) => void;
  onError?: (error: string) => void;
}

export function useUpdateUserMutation({
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

  const onMutationSuccess = (data: User) => {
    queryClient.invalidateQueries({ queryKey: [GetUserQuery] });

    onSuccess && onSuccess(data);
  };

  return useMutation(updateUser, {
    onError: onMutationError,
    onMutate: onMutationTriggered,
    onSuccess: onMutationSuccess,
  });
}
