import type { CreateListDto } from '@sigma/types';

import axios from 'axios';

export async function createList(createListDto: CreateListDto) {
  const response = await axios.post(`/api/v1/lists`, createListDto);

  return response.data;
}
