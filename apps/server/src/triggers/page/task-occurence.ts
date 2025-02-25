import { PrismaClient } from '@prisma/client';
import { task } from '@trigger.dev/sdk/v3';
import { RRule } from 'rrule';

const prisma = new PrismaClient();

export const processTaskOccurrences = task({
  id: 'process-task-occurrences',
  run: async (payload: {
    taskIds: string[]; // Changed from single taskId to array
    startDate: string;
    endDate: string;
  }) => {
    const results = await Promise.all(
      payload.taskIds.map(async (taskId) => {
        const sigmaTask = await prisma.task.findUnique({
          where: { id: taskId },
        });

        if (!sigmaTask?.recurrence?.length) {
          return null;
        }

        const rrule = RRule.fromString(sigmaTask.recurrence[0]);

        const baseOccurrences = rrule.between(
          new Date(payload.startDate),
          new Date(payload.endDate),
        );

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

        const futureOccurrences = occurrences.filter(
          (date) => date > new Date(),
        );

        if (futureOccurrences.length === 0) {
          return null;
        }

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
      }),
    );

    // Filter out null results and return array of task IDs with their occurrence counts
    return results.filter(Boolean).map((result) => ({
      taskId: result!.taskId,
      occurrencesCreated: result!.occurrencesCreated,
    }));
  },
});
