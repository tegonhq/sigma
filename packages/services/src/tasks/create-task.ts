import { CreateTaskDto } from '@sigma/types';
import axios from 'axios';

export async function createTask(createTaskDto: CreateTaskDto) {
  const response = await axios.post(`/api/v1/tasks`, createTaskDto);

  return response.data;
}
