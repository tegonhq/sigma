import { UpdateListDto } from '@sigma/types';
import axios from 'axios';

interface UpdateListDtoWithId extends UpdateListDto {
  listId: string;
}

export async function updateList({
  listId,
  ...updateListDto
}: UpdateListDtoWithId) {
  const response = await axios.post(`/api/v1/lists/${listId}`, updateListDto);

  return response.data;
}
