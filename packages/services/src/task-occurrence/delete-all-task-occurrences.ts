import { TaskDto } from '@sol/types';
import axios from 'axios';

export async function deleteAllTaskOccurrences({ taskId }: TaskDto) {
  const response = await axios.delete(`/api/v1/task-occurrence/task/${taskId}`);

  return response.data;
}
