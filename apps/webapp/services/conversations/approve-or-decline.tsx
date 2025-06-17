import axios from 'axios';
import { useMutation } from 'react-query';

import type { ConversationType } from 'common/types';

interface MutationParams {
  onMutate?: () => void;
  onSuccess?: (data: ConversationType) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onError?: (error: any) => void;
}

const approveOrDecline = async (body: {
  approved: boolean;
  conversationId: string;
}) => {
  const response = await axios.post(`/api/v1/conversation/approval`, body);

  return response.data;
};

export function useApproveOrDeclineMutation({
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

  const onMutationSuccess = (data: ConversationType) => {
    onSuccess && onSuccess(data);
  };

  return useMutation(approveOrDecline, {
    onError: onMutationError,
    onMutate: onMutationTriggered,
    onSuccess: onMutationSuccess,
  });
}
