import { CreateActivityDto } from '@sigma/types';
import axios from 'axios';

export async function createActivity(createActivityDto: CreateActivityDto) {
  const response = await axios.post(`/api/v1/activity`, createActivityDto);

  return response.data;
}

export async function createBulkActivity(
  createActivityDto: CreateActivityDto[],
) {
  const response = await axios.post(`/api/v1/activity/bulk`, createActivityDto);

  return response.data;
}
