import { ReccurenceInput } from '@sol/types';
import axios from 'axios';

export async function addTaskDuedate(recurrenceInput: ReccurenceInput) {
  const response = await axios.post(
    `/api/v1/tasks/ai/duedate`,
    recurrenceInput,
  );

  return response.data;
}
