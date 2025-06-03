import { Injectable } from '@nestjs/common';
import {
  CreateTaskOccurrenceDTO,
  DateFilterEnum,
  GetTaskOccurrenceDTO,
  PageTypeEnum,
  Preferences,
  PublicPage,
  TaskOccurrence,
  UpdateTaskOccurenceDTO,
} from '@redplanethq/sol-sdk';
import { endOfDay, subDays } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { PrismaService } from 'nestjs-prisma';
import { RRule } from 'rrule';

import { PagesService } from 'modules/pages/pages.service';

@Injectable()
export class TaskOccurenceService {
  constructor(
    private prisma: PrismaService,
    private pagesService: PagesService,
  ) {}

  async getTaskOccurences(workspaceId: string, filters: GetTaskOccurrenceDTO) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      workspaceId,
      deleted: null,
    };

    // Add taskId filter if provided
    if (filters.taskId) {
      where.taskId = filters.taskId;
    }

    // Add status filter if provided
    if (filters.status) {
      where.status = filters.status;
    }

    // Add startTime filters
    if (filters.startTime) {
      where.startTime = {};
      switch (filters.startTimeFilter) {
        case DateFilterEnum.EQ:
          where.startTime = new Date(filters.startTime);
          break;
        case DateFilterEnum.GTE:
          where.startTime = { gte: new Date(filters.startTime) };
          break;
        case DateFilterEnum.LTE:
          where.startTime = { lte: new Date(filters.startTime) };
          break;
        default:
          where.startTime = new Date(filters.startTime);
      }
    }

    // Add endTime filters
    if (filters.endTime) {
      where.endTime = {};
      switch (filters.endTimeFilter) {
        case DateFilterEnum.EQ:
          where.endTime = new Date(filters.endTime);
          break;
        case DateFilterEnum.GTE:
          where.endTime = { gte: new Date(filters.endTime) };
          break;
        case DateFilterEnum.LTE:
          where.endTime = { lte: new Date(filters.endTime) };
          break;
        default:
          where.endTime = new Date(filters.endTime);
      }
    }

    return await this.prisma.taskOccurrence.findMany({
      where,
      include: {
        task: true,
      },
      orderBy: {
        startTime: 'asc',
      },
    });
  }

  async getTaskOccurence(taskOccurrenceId: string) {
    return await this.prisma.taskOccurrence.findUnique({
      where: { id: taskOccurrenceId },
    });
  }

  async createTaskOccurence(
    createTaskOccurenceData: CreateTaskOccurrenceDTO,
    workspaceId: string,
  ): Promise<TaskOccurrence[]> {
    const { taskIds, startTime, endTime } = createTaskOccurenceData;
    let pageId = createTaskOccurenceData.pageId;
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
    });
    const timezone = (workspace.preferences as Preferences).timezone;

    let page: PublicPage;
    if (!pageId) {
      const formattedDate = formatInTimeZone(
        new Date(startTime),
        timezone,
        'dd-MM-yyyy',
      );
      page = await this.pagesService.getOrCreatePageByTitle(workspaceId, {
        title: formattedDate,
        type: PageTypeEnum.Daily,
      });
      pageId = page.id;
    }

    if (!page || !pageId) {
      return null;
    }

    // Create each task occurrence in parallel
    return await Promise.all(
      taskIds.map((taskId) =>
        this.prisma.taskOccurrence.upsert({
          where: { taskId_pageId: { taskId, pageId } },
          create: {
            taskId,
            startTime: startTime ? new Date(startTime) : null,
            endTime: endTime ? new Date(endTime) : null,
            pageId: pageId || page.id,
            workspaceId,
          },
          update: {
            deleted: null,
          },
        }),
      ),
    );
  }

  async updateTaskOccurence(
    updateTaskOccurenceDto: UpdateTaskOccurenceDTO,
    workspaceId: string,
  ): Promise<TaskOccurrence[]> {
    const deletedTaskOccurences = await this.deleteTaskOccurence(
      updateTaskOccurenceDto.taskOccurrenceIds,
    );

    // Extract taskIds from deleted occurrences and add them to updateTaskOccurenceDto
    const deletedTaskIds = deletedTaskOccurences
      .filter((occurrence) => occurrence.task?.id)
      .map((occurrence) => occurrence.task.id);

    return await this.createTaskOccurence(
      { ...updateTaskOccurenceDto, taskIds: deletedTaskIds },
      workspaceId,
    );
  }

  async updateSingleTaskOccurrence(
    taskOccurrenceId: string,
    updateTaskOccurenceDto: Partial<UpdateTaskOccurenceDTO>,
    workspaceId: string,
  ): Promise<TaskOccurrence> {
    const taskOccurrence = await this.prisma.taskOccurrence.findUnique({
      where: { id: taskOccurrenceId },
      include: { task: true, page: true },
    });

    if (!taskOccurrence || taskOccurrence.workspaceId !== workspaceId) {
      return null;
    }

    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
    });
    const timezone = (workspace.preferences as Preferences).timezone;

    // Check if start date is changing
    const newStartTime = updateTaskOccurenceDto.startTime
      ? new Date(updateTaskOccurenceDto.startTime)
      : taskOccurrence.startTime;

    const oldStartDate = taskOccurrence.startTime
      ? formatInTimeZone(taskOccurrence.startTime, timezone, 'dd-MM-yyyy')
      : null;
    const newStartDate = newStartTime
      ? formatInTimeZone(newStartTime, timezone, 'dd-MM-yyyy')
      : null;

    // If date is changing, we need to move the task occurrence to a different page
    if (oldStartDate !== newStartDate && newStartDate && taskOccurrence.task) {
      await this.createTaskOccurence(
        { ...updateTaskOccurenceDto, taskIds: [taskOccurrence.task.id] },
        workspaceId,
      );

      return (await this.deleteTaskOccurence([taskOccurrenceId]))[0];
    }

    // If date isn't changing, just update the times and status
    return await this.prisma.taskOccurrence.update({
      where: { id: taskOccurrenceId },
      data: {
        startTime: updateTaskOccurenceDto.startTime
          ? new Date(updateTaskOccurenceDto.startTime)
          : taskOccurrence.startTime,
        endTime: updateTaskOccurenceDto.endTime
          ? new Date(updateTaskOccurenceDto.endTime)
          : taskOccurrence.endTime,
        status: updateTaskOccurenceDto.status || taskOccurrence.status,
      },
    });
  }

  async deleteTaskOccurence(
    taskOccurrenceIds: string[],
  ): Promise<TaskOccurrence[]> {
    // Mark all occurrences as deleted
    await this.prisma.taskOccurrence.updateMany({
      where: { id: { in: taskOccurrenceIds } },
      data: { deleted: new Date().toISOString() },
    });

    const taskOccurences = await this.prisma.taskOccurrence.findMany({
      where: { id: { in: taskOccurrenceIds } },
      include: { page: true, task: true },
    });

    return taskOccurences;
  }

  async createTaskOccurenceByTask(taskId: string, workspaceId: string) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
    });
    const timezone = (workspace.preferences as Preferences).timezone;

    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task.recurrence.length && !task.startTime) {
      return null;
    }

    const taskStartTime = new Date(task.startTime);

    let futureOccurrences;
    if (task.recurrence.length) {
      // Set up the date range for next 7 days
      const now = new Date();
      const startDate = new Date(now);
      const endDate = new Date(now);
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
        const page = await this.pagesService.getOrCreatePageByTitle(
          task.workspaceId,
          {
            title: formattedDate,
            type: PageTypeEnum.Daily,
          },
        );

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const upsertOperations = taskOccurrenceData.map((data: any) => {
      return this.prisma.taskOccurrence.upsert({
        where: {
          taskId_pageId: {
            taskId: data.taskId,
            pageId: data.pageId,
          },
        },
        create: {
          taskId: data.taskId,
          pageId: data.pageId,
          workspaceId: data.workspaceId,
          startTime: data.startTime,
          endTime: data.endTime,
          status: data.status,
          deleted: null,
        },
        update: {
          deleted: null,
          startTime: data.startTime,
          endTime: data.endTime,
        },
      });
    });

    // Execute all upsert operations in parallel
    return await Promise.all(upsertOperations);
  }

  async updateTaskOccurenceByTask(taskId: string, workspaceId: string) {
    const yesterday = endOfDay(subDays(new Date(), 1));
    await this.prisma.taskOccurrence.updateMany({
      where: {
        taskId,
        startTime: {
          gte: yesterday,
        },
      },
      data: { deleted: new Date().toISOString() },
    });

    return await this.createTaskOccurenceByTask(taskId, workspaceId);
  }

  async deleteTaskOccurenceByTask(taskId: string, workspaceId: string) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    // Get start of today in workspace timezone
    const todayInTZ = formatInTimeZone(
      new Date(),
      (workspace.preferences as Preferences).timezone || 'UTC',
      'yyyy-MM-dd',
    );

    // Convert to UTC for database query
    const todayUTC = new Date(todayInTZ);

    // Update task to remove recurrence
    await this.prisma.task.update({
      where: { id: taskId },
      data: {
        recurrence: [],
        scheduleText: null,
        startTime: null,
        endTime: null,
      },
    });

    // Delete all occurrences from today onwards in UTC
    return await this.prisma.taskOccurrence.updateMany({
      where: {
        taskId,
        startTime: {
          gte: todayUTC,
        },
      },
      data: { deleted: new Date().toISOString() },
    });
  }

  async handleHooks(taskOccurenceId: string, action: string) {
    const taskOccurence = await this.prisma.taskOccurrence.findUnique({
      where: { id: taskOccurenceId },
    });

    switch (action) {
      case 'create':
        await this.pagesService.upsertTasksInPageById(taskOccurence.pageId, [
          taskOccurence.taskId,
        ]);
        break;

      case 'update':
        if (!taskOccurence.deleted) {
          await this.pagesService.upsertTasksInPageById(taskOccurence.pageId, [
            taskOccurence.taskId,
          ]);
        }
        break;

      case 'delete':
        await this.pagesService.removeTaskFromPageById(taskOccurence.pageId, [
          taskOccurence.taskId,
        ]);
        break;
    }
  }
}
