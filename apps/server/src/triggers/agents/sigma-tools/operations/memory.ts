import axios from 'axios';

import { RetrieveMemoryParams } from '../types/memory';

export const retrieveMemory = async (params: RetrieveMemoryParams) => {
  const response = await axios.post(`/search`, {
    query: params.query,
  });
  return response.data;
};
