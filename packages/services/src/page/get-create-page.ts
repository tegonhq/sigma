import { GetPageByTitleDto } from '@sigma/types';
import axios from 'axios';

export const getOrCreatePageByTitle = async (
  pageByTitleDto: GetPageByTitleDto,
) => {
  const response = await axios.post(`/api/v1/pages`, pageByTitleDto);

  return response.data;
};
