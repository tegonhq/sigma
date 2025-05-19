import axios from 'axios';

export async function createList(favourite?: boolean) {
  const response = await axios.post(`/api/v1/lists`, { favourite });

  return response.data;
}
