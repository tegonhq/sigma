// import { PrismaClient } from '@prisma/client';
import { schedules } from '@trigger.dev/sdk/v3';

export const taskRunSchedule = schedules.task({
  id: 'task-run-schedule',
  run: async (data) => {
    console.log(data);
  },
});
