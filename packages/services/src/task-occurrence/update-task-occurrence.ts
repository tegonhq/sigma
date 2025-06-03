import { UpdateTaskOccurenceDTO } from '@sol/types';
import axios from 'axios';

export async function updateTaskOccurrence(
  updateTaskOccurrenceDto: UpdateTaskOccurenceDTO,
) {
  const response = await axios.put(
    `/api/v1/task-occurrence`,
    updateTaskOccurrenceDto,
  );

  return response.data;
}
