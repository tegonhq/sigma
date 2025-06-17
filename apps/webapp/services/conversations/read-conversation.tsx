import axios from 'axios';
import { useMutation } from 'react-query';

interface MutationParams {
  onMutate?: () => void;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const readConversation = async (conversationId: string) => {
  return axios.post(`/api/v1/conversation/${conversationId}/read`);
};

export function useReadConversationtMutation({
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

  const onMutationSuccess = () => {
    onSuccess && onSuccess();
  };

  return useMutation(readConversation, {
    onError: onMutationError,
    onMutate: onMutationTriggered,
    onSuccess: onMutationSuccess,
  });
}
