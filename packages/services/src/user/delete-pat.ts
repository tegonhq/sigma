import type { PatIdDto } from '@sol/types';

import axios from 'axios';

export async function deletePat(patIdDto: PatIdDto) {
  const response = await axios.delete(`/api/v1/users/pats/${patIdDto.patId}`);

  return response.data;
}
