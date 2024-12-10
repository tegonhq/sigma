import axios from 'axios';

import { CreateTaskDto } from '../../../types/src/task/create-task.dto';

export async function createTask(createTaskDto: CreateTaskDto) {
  const response = await axios.post(`/api/v1/tasks`, createTaskDto);

  return response.data;
}
