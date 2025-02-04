import { TaskBySourceDto, TaskDto } from '@sigma/types';
import axios from 'axios';

export async function deleteTask({ taskId }: TaskDto) {
  const response = await axios.delete(`/api/v1/tasks/${taskId}`);

  return response.data;
}

export async function deleteTaskBySourceId({ sourceId }: TaskBySourceDto) {
  const response = await axios.delete(`/api/v1/tasks/source/${sourceId}`);

  return response.data;
}
