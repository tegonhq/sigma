import { UpdateTaskOccurenceDTO } from '@sol/types';
import axios from 'axios';

interface UpdateTaskOccurrenceWithId extends Partial<UpdateTaskOccurenceDTO> {
  taskOccurrenceId: string;
}

export async function updateSingleTaskOccurrence({
  taskOccurrenceId,
  ...updateTaskOccurrence
}: UpdateTaskOccurrenceWithId) {
  const response = await axios.post(
    `/api/v1/task-occurrence/${taskOccurrenceId}`,
    updateTaskOccurrence,
  );

  return response.data;
}
