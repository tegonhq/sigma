import { ConversationParamsDto } from '@sol/types';
import axios from 'axios';

export async function getConversationSyncs({
  conversationId,
}: ConversationParamsDto) {
  const response = await axios.get(
    `/api/v1/conversation/${conversationId}/syncs`,
  );

  return response.data;
}
