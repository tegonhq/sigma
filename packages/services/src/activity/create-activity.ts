import { Activity, CreateActivityDto } from '@sigma/types';
import axios from 'axios';

export async function createActivity(
  createActivityDto: CreateActivityDto,
): Promise<Activity> {
  const response = await axios.post(`/api/v1/activity`, createActivityDto);

  return response.data;
}
