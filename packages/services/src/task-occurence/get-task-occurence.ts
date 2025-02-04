import {
  GetTaskOccurenceDTO,
  TaskOccurenceDto,
  TaskOccurrence,
} from '@sigma/types';
import axios from 'axios';

export async function getTaskOccurenceById(
  taskOccurenceDto: TaskOccurenceDto,
): Promise<TaskOccurrence> {
  const response = await axios.get(
    `/api/v1/task-occurence/${taskOccurenceDto.taskOccurenceId}`,
  );

  return response.data;
}

export async function getTaskOccurences(
  query: GetTaskOccurenceDTO,
): Promise<TaskOccurrence[]> {
  const response = await axios.get('/api/v1/task-occurence/filter', {
    params: query,
  });

  return response.data;
}
