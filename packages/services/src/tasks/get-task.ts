import { Task, TaskBySourceDto, TaskDto } from '@sol/types';
import axios from 'axios';

export async function getTaskById(taskDto: TaskDto): Promise<Task> {
  const response = await axios.get(`/api/v1/tasks/${taskDto.taskId}`);

  return response.data;
}

export async function getTaskBySourceURL(
  sourceDto: TaskBySourceDto,
): Promise<Task> {
  const response = await axios.get(
    `/api/v1/tasks/source/${sourceDto.sourceURL}`,
  );

  return response.data;
}
