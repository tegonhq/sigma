import type { CodeDto } from '@sol/types';

import axios from 'axios';

export async function authorizeCode(codeBody: CodeDto) {
  const response = await axios.post(`/api/v1/users/authorization`, codeBody);

  return response.data;
}
