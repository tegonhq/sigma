import { task } from '@trigger.dev/sdk/v3';

export const taskReminder = task({
  id: 'task-reminder',
  run: async (payload: { taskId: string }) => {
    console.log(payload);
  },
});
