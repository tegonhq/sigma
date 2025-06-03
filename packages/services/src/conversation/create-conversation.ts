import { CreateConversationDto } from '@sol/types';
import axios from 'axios';

export async function createConversation(
  createComversationDto: CreateConversationDto,
) {
  const response = await axios.post(
    `/api/v1/conversation`,
    createComversationDto,
  );

  return response.data;
}
