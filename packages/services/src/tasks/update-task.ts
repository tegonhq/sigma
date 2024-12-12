import { UpdateTaskDto } from '@sigma/types';
import axios from 'axios';

interface UpdateTaskDtoWithId extends UpdateTaskDto {
  taskId: string;
}

export async function updateTask({
  taskId,
  ...updateTaskDto
}: UpdateTaskDtoWithId) {
  const response = await axios.post(`/api/v1/tasks/${taskId}`, updateTaskDto);

  return response.data;
}
