import type { CreatePatDto } from '@sol/types';

import axios from 'axios';

export async function createPat(createPatDto: CreatePatDto) {
  const response = await axios.post(`/api/v1/users/pat`, createPatDto);

  return response.data;
}
