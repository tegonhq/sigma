import { ReccurenceInput } from '@sigma/types';
import axios from 'axios';

export async function getTaskSchedule(recurrenceInput: ReccurenceInput) {
  const response = await axios.post(
    `/api/v1/tasks/ai/recurrence`,
    recurrenceInput,
  );

  return response.data;
}
