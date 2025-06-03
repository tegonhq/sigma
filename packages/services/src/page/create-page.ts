import type { CreatePageDto } from '@sol/types';

import axios from 'axios';

export async function createPage(createPageDto: CreatePageDto) {
  const response = await axios.post(`/api/v1/pages`, createPageDto);

  return response.data;
}
