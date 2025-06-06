import { ReccurenceInput } from '@sol/types';
import axios from 'axios';

export async function getTaskSchedule(recurrenceInput: ReccurenceInput) {
  const response = await axios.post(
    `/api/v1/tasks/ai/schedule`,
    recurrenceInput,
  );

  return response.data;
}
