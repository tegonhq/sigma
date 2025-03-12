import { TaskOccurrenceDto } from '@sigma/types';
import axios from 'axios';

export async function deleteTaskOccurrence({
  taskOccurrenceId,
}: TaskOccurrenceDto) {
  const response = await axios.delete(
    `/api/v1/task-occurrence/${taskOccurrenceId}`,
  );

  return response.data;
}
