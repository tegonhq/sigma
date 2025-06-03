import { ListIdDto } from '@sol/types';
import axios from 'axios';

export async function deleteList({ listId }: ListIdDto) {
  const response = await axios.delete(`/api/v1/lists/${listId}`);

  return response.data;
}
