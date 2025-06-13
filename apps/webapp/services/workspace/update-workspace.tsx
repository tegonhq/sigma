import axios from 'axios';
import { useMutation, useQueryClient } from 'react-query';

import type { WorkspaceType } from 'common/types';

import { GetUserQuery } from 'services/users/get-user';

export interface UpdateWorkspaceParams {
  name: string;
  workspaceId: string;
  timezone?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  preferences?: any;
}

// This function clears userData from localStorage before updating the workspace
export async function updateWorkspace({
  workspaceId,
  name,
  timezone,
  preferences,
}: UpdateWorkspaceParams): Promise<WorkspaceType> {
  // Clear cached user data before making the update
  localStorage.removeItem('userData');
  const response = await axios.post(`/api/v1/workspaces/${workspaceId}`, {
    name,
    timezone,
    preferences,
  });
  return response.data;
}

export interface MutationParams {
  onMutate?: () => void;
  onSuccess?: (data: WorkspaceType) => void;
  onError?: (error: string) => void;
}

export function useUpdateWorkspaceMutation({
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

  const onMutationSuccess = (data: WorkspaceType) => {
    // Invalidate the user query so it refetches with updated data
    queryClient.invalidateQueries([GetUserQuery]);
    onSuccess && onSuccess(data);
  };

  return useMutation(updateWorkspace, {
    onError: onMutationError,
    onMutate: onMutationTriggered,
    onSuccess: onMutationSuccess,
  });
}
