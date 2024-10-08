import type { CodeDtoWithWorkspace } from '@sigma/types';

import axios from 'axios';

export async function authorizeCode(codeBody: CodeDtoWithWorkspace) {
  const response = await axios.post(`/api/v1/users/authorization`, codeBody);

  return response.data;
}
