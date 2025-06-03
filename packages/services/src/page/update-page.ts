import type { UpdatePageDto } from '@sol/types';

import axios from 'axios';

interface UpdataPageParms extends UpdatePageDto {
  pageId: string;
}

export async function updatePage({ pageId, ...updateDto }: UpdataPageParms) {
  const response = await axios.post(`/api/v1/pages/${pageId}`, updateDto);

  return response.data;
}
