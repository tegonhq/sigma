import { CreateTaskOccurrenceDTO } from '@sigma/types';
import axios from 'axios';

export async function createTaskOccurrence(
  createTaskOccurrenceDto: CreateTaskOccurrenceDTO,
) {
  const response = await axios.post(
    `/api/v1/task-occurrence`,
    createTaskOccurrenceDto,
  );

  return response.data;
}
