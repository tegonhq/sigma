import { PrismaClient } from '@prisma/client';
import { PageTypeEnum } from '@redplanethq/sol-sdk';
import axios from 'axios';
import { formatInTimeZone } from 'date-fns-tz';
import { RRule } from 'rrule';

const prisma = new PrismaClient();

export async function processTaskOccurrences(
  workspaceId: string,
  timezone: string,
) {
  const tasks = await prisma.task.findMany({
    where: {
      workspaceId,
      deleted: null,
      recurrence: { isEmpty: false },
    },
  });

  // Set up the date range for the 8 days
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() + 7);
  const endDate = new Date(now);
  endDate.setDate(startDate.getDate() + 1);

  const results = await Promise.all(
    tasks.map(async (task) => {
      if (!task.recurrence.length && !task.startTime) {
        return null;
      }
      const taskStartTime = new Date(task.startTime);

      let futureOccurrences;
      if (task.recurrence.length) {
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

      // we're updating page with tasks from here because in the task occurence hook
      // it's updating page in parallel missing tasks in page.
      await Promise.all(
        Array.from(dateOccurrenceMap.keys()).map(async (formattedDate) => {
          const page = (
            await axios.post(`/api/v1/pages/get-create`, {
              title: formattedDate,
              type: PageTypeEnum.Daily,
              taskIds: [task.id],
            })
          ).data;

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
            taskId: task.id,
            pageId,
            workspaceId: task.workspaceId,
            startTime: date,
            endTime,
            status: 'Todo',
          });
        }
      });

      // Step 4: Bulk upsert task occurrences
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const upsertOperations = taskOccurrenceData.map((data: any) => {
        return prisma.taskOccurrence.create({
          data: {
            taskId: data.taskId,
            workspaceId: data.workspaceId,
            startTime: data.startTime,
            endTime: data.endTime,
            status: data.status,
            deleted: null,
          },
        });
      });

      // Execute all upsert operations in parallel
      return await Promise.all(upsertOperations);
    }),
  );

  return results;
}
