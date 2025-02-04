import { PrismaClient } from '@prisma/client';
import { task } from '@trigger.dev/sdk/v3';
import { RRule } from 'rrule';

const prisma = new PrismaClient();

export const processTaskOccurrences = task({
  id: 'process-task-occurrences',
  run: async (payload: {
    taskId: string;
    startDate: string;
    endDate: string;
  }) => {
    const sigmaTask = await prisma.task.findUnique({
      where: { id: payload.taskId },
    });

    if (!sigmaTask?.recurrence?.length) {
      return null;
    }

    const rrule = RRule.fromString(sigmaTask.recurrence[0]);

    // Set up the date range for next 2 days

    // Get base occurrences for the date range
    const baseOccurrences = rrule.between(
      new Date(payload.startDate),
      new Date(payload.endDate),
    );

    // Map the base dates to include the correct time from task.startTime
    const occurrences = baseOccurrences.map((date) => {
      const occurrence = new Date(date);
      occurrence.setHours(
        sigmaTask.startTime.getHours(),
        sigmaTask.startTime.getMinutes(),
        sigmaTask.startTime.getSeconds(),
        sigmaTask.startTime.getMilliseconds(),
      );
      return occurrence;
    });

    // Filter out any occurrences that have already passed
    const futureOccurrences = occurrences.filter((date) => date > new Date());

    const createdOccurrences = await Promise.all(
      futureOccurrences.map((date) =>
        prisma.taskOccurrence.upsert({
          where: {
            taskId_startTime_endTime: {
              taskId: sigmaTask.id,
              startTime: date,
              endTime: sigmaTask.endTime
                ? new Date(
                    date.getTime() +
                      (sigmaTask.endTime.getTime() -
                        sigmaTask.startTime!.getTime()),
                  )
                : date,
            },
          },
          create: {
            taskId: sigmaTask.id,
            workspaceId: sigmaTask.workspaceId,
            startTime: date,
            endTime: sigmaTask.endTime
              ? new Date(
                  date.getTime() +
                    (sigmaTask.endTime.getTime() -
                      sigmaTask.startTime!.getTime()),
                )
              : date,
            status: 'Todo',
          },
          update: {},
        }),
      ),
    );

    return {
      taskId: sigmaTask.id,
      occurrencesCreated: createdOccurrences.length,
    };
  },
});
