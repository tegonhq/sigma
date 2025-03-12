import {
  GetTaskOccurrenceDTO,
  TaskOccurrenceDto,
  TaskOccurrence,
} from '@sigma/types';
import axios from 'axios';

export async function getTaskOccurenceById(
  taskOccurenceDto: TaskOccurrenceDto,
): Promise<TaskOccurrence> {
  const response = await axios.get(
    `/api/v1/task-occurrence/${taskOccurenceDto.taskOccurrenceId}`,
  );

  return response.data;
}

export async function getTaskOccurences(
  query: GetTaskOccurrenceDTO,
): Promise<TaskOccurrence[]> {
  const response = await axios.get('/api/v1/task-occurrence/filter', {
    params: query,
  });

  return response.data;
}
