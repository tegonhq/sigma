import type { ReccurenceInput } from '@sigma/types';

import axios from 'axios';

export async function getAiTaskRecurrence(reccurenceInput: ReccurenceInput) {
  const response = await axios.post(
    `/api/v1/tasks/ai/recurrence`,
    reccurenceInput,
  );

  return response.data;
}
