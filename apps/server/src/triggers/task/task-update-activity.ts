import { task } from '@trigger.dev/sdk/v3';

export const taskUpdateActivity = task({
  id: 'task-update-activity',
  queue: {
    name: 'task-update-activity',
    concurrencyLimit: 10,
  },
  run: async () => {},
});
