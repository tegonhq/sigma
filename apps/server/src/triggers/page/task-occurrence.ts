import { PrismaClient } from '@prisma/client';
import {
  PageTypeEnum,
  Preferences,
  TaskOccurrence,
} from '@redplanethq/sol-sdk';
import { getOrCreatePageByTitle } from '@redplanethq/sol-sdk';
import { task } from '@trigger.dev/sdk/v3';
import { formatInTimeZone } from 'date-fns-tz';
import { RRule } from 'rrule';
import { init } from 'triggers/utils';

const prisma = new PrismaClient();

export const processTaskOccurrences = task({
  init,
  id: 'process-task-occurrences',
  run: async (payload: {
    taskIds: string[]; // Changed from single taskId to array
    startDate: string;
    endDate: string;
    workspaceId: string;
  }) => {
    const {
      taskIds,
      startDate: startDateString,
      endDate: endDateString,
    } = payload;
    const startDate = new Date(startDateString);
    const endDate = new Date(endDateString);

    const results = await Promise.all(
      taskIds.map(async (taskId): Promise<TaskOccurrence[]> => {
        const task = await prisma.task.findUnique({
          where: { id: taskId },
          include: { workspace: true },
        });

        const workspace = task.workspace;
        const timezone = (workspace.preferences as Preferences).timezone;

        if (!task.recurrence.length && !task.startTime) {
          return null;
        }

        const taskStartTime = new Date(task.startTime);

        let futureOccurrences;
        if (task.recurrence.length) {
          // Set up the date range for next 7 days
          const now = new Date();

          endDate.setDate(endDate.getDate() + 7);

          // Process all RRules and collect occurrences
          let allOccurrences: Date[] = [];

          for (const rruleString of task.recurrence) {
            const rrule = RRule.fromString(rruleString);

            // Get base occurrences for the date range from this rule
            const baseOccurrences = rrule.between(startDate, endDate);

            // Check if the RRule contains time information
            const hasTimeInRRule =
              rruleString.includes('BYHOUR') ||
              rruleString.includes('BYMINUTE') ||
              rruleString.includes('BYSECOND') ||
              (rruleString.includes('DTSTART=') && rruleString.includes('T'));

            // Map the base dates to include the correct time
            const occurrences = baseOccurrences.map((date) => {
              // If RRule already has time information, use it as is
              if (hasTimeInRRule) {
                return date;
              }

              // Otherwise, apply the time from task.startTime
              const occurrence = new Date(date);
              occurrence.setHours(
                taskStartTime.getHours(),
                taskStartTime.getMinutes(),
                taskStartTime.getSeconds(),
                taskStartTime.getMilliseconds(),
              );
              return occurrence;
            });

            // Add occurrences from this rule to the collection
            allOccurrences = [...allOccurrences, ...occurrences];
          }

          // Filter out any occurrences that have already passed
          futureOccurrences = allOccurrences.filter((date) => date > now);

          // Sort occurrences by date
          futureOccurrences.sort((a, b) => a.getTime() - b.getTime());
        } else if (task.startTime) {
          futureOccurrences = [task.startTime];
        }

        if (futureOccurrences.length === 0) {
          return [];
        }

        // Step 1: Create a map of formatted dates to their occurrences
        const dateOccurrenceMap = new Map<string, Date[]>();
        futureOccurrences.forEach((date) => {
          const formattedDate = formatInTimeZone(date, timezone, 'dd-MM-yyyy');
          if (!dateOccurrenceMap.has(formattedDate)) {
            dateOccurrenceMap.set(formattedDate, []);
          }
          dateOccurrenceMap.get(formattedDate).push(date);
        });

        // Step 2: Create or get all pages first

        const pageMap = new Map<string, string>(); // Maps formatted date to {pageId, taskId}

        await Promise.all(
          Array.from(dateOccurrenceMap.keys()).map(async (formattedDate) => {
            const page = await getOrCreatePageByTitle({
              title: formattedDate,
              // TODO: check build of sdk
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              type: PageTypeEnum.Daily as any,
              taskIds: [taskId],
            });

            if (page && page.id) {
              pageMap.set(formattedDate, page.id);
            }
          }),
        );

        // Step 3: Create task occurrences with the correct page IDs and task ID
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const taskOccurrenceData: any = [];

        futureOccurrences.forEach((date) => {
          const formattedDate = formatInTimeZone(date, timezone, 'dd-MM-yyyy');
          const pageId = pageMap.get(formattedDate);

          if (pageId) {
            const endTime = task.endTime
              ? new Date(
                  date.getTime() +
                    (task.endTime.getTime() - taskStartTime!.getTime()),
                )
              : date;

            taskOccurrenceData.push({
              taskId,
              pageId,
              workspaceId: task.workspaceId,
              startTime: date,
              endTime,
              status: 'Todo',
            });
          }
        });

        // Step 4: Bulk upsert task occurrences
        // Create a list of unique taskId_pageId combinations for upsert
        const upsertOperations: TaskOccurrence[] = taskOccurrenceData.map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (data: any) => {
            return prisma.taskOccurrence.create({
              data: {
                taskId: data.taskId,
                workspaceId: data.workspaceId,
                startTime: data.startTime,
                endTime: data.endTime,
                status: data.status,
              },
            });
          },
        );

        // Execute all upsert operations in parallel
        return await Promise.all(upsertOperations);
      }),
    );

    // Filter out null results and return array of task IDs with their occurrence counts
    return results;
  },
});
