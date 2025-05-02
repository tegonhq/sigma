import axios from 'axios';

export async function createList() {
  const response = await axios.post(`/api/v1/lists`);

  return response.data;
}
