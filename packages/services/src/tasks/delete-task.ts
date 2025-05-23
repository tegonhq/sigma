import { TaskBySourceDto, TaskDto } from '@sigma/types';
import axios from 'axios';

export async function deleteTask({ taskId }: TaskDto) {
  const response = await axios.delete(`/api/v1/tasks/${taskId}`);

  return response.data;
}

export async function deleteTaskBySourceURL({ sourceURL }: TaskBySourceDto) {
  const response = await axios.delete(`/api/v1/tasks/source/${sourceURL}`);

  return response.data;
}
