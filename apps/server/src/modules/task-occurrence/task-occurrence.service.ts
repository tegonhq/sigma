import { Injectable } from '@nestjs/common';
import {
  CreateTaskOccurenceDTO,
  DateFilterEnum,
  GetTaskOccurenceDTO,
  Page,
  PageTypeEnum,
  UpdateTaskOccurenceDTO,
} from '@sigma/types';
import { format } from 'date-fns/format';
import { PrismaService } from 'nestjs-prisma';
import { RRule } from 'rrule';

import { PagesService } from 'modules/pages/pages.service';

@Injectable()
export class TaskOccurenceService {
  constructor(
    private prisma: PrismaService,
    private pagesService: PagesService,
  ) {}

  async getTaskOccurences(workspaceId: string, filters: GetTaskOccurenceDTO) {
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

  async getTaskOccurence(taskOccurenceId: string) {
    return await this.prisma.taskOccurrence.findUnique({
      where: { id: taskOccurenceId },
    });
  }

  async createTaskOccurence(
    createTaskOccurenceData: CreateTaskOccurenceDTO,
    workspaceId: string,
    modifyPage?: boolean,
  ) {
    const { taskIds, startTime, endTime } = createTaskOccurenceData;
    let pageId = createTaskOccurenceData.pageId;

    let page: Page;
    if (!pageId || modifyPage) {
      const formattedDate = format(new Date(startTime), 'dd-MM-yyyy');
      page = await this.pagesService.getOrCreatePageByTitle(workspaceId, {
        title: formattedDate,
        type: PageTypeEnum.Daily,
        taskIds,
      });
    }

    if (!page || !pageId) {
      return null;
    }

    if (!pageId) {
      pageId = page.id;
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
    modifyPage?: boolean,
  ) {
    const deletedTaskOccurences = await this.deleteTaskOccurence(
      updateTaskOccurenceDto.taskOccurenceIds,
      modifyPage,
    );

    // Extract taskIds from deleted occurrences and add them to updateTaskOccurenceDto
    const deletedTaskIds = deletedTaskOccurences
      .filter((occurrence) => occurrence.task?.id)
      .map((occurrence) => occurrence.task.id);

    // Combine with existing taskIds, ensuring no duplicates
    updateTaskOccurenceDto.taskIds = [
      ...new Set([...updateTaskOccurenceDto.taskIds, ...deletedTaskIds]),
    ];

    return await this.createTaskOccurence(
      updateTaskOccurenceDto,
      workspaceId,
      modifyPage,
    );
  }

  async deleteTaskOccurence(taskOccurenceIds: string[], modifyPage?: boolean) {
    const taskOccurences = await this.prisma.taskOccurrence.findMany({
      where: { id: { in: taskOccurenceIds } },
      include: { page: true, task: true },
    });

    // Mark all occurrences as deleted
    await this.prisma.taskOccurrence.updateMany({
      where: { id: { in: taskOccurenceIds } },
      data: { deleted: new Date().toISOString() },
    });

    // Remove tasks from their respective pages
    const pageTaskMap = new Map<string, string[]>();

    // Group tasks by page title for efficient updates
    taskOccurences.forEach((occurrence) => {
      if (occurrence.pageId && occurrence.task?.id) {
        const pageTitle = occurrence.page.title;
        if (!pageTaskMap.has(pageTitle)) {
          pageTaskMap.set(pageTitle, []);
        }
        pageTaskMap.get(pageTitle).push(occurrence.task.id);
      }
    });

    if (modifyPage) {
      // Remove tasks from each page
      await Promise.all(
        Array.from(pageTaskMap.entries()).map(async ([pageTitle, taskIds]) => {
          await this.pagesService.removeTaskFromPageByTitle(pageTitle, taskIds);
        }),
      );
    }

    return taskOccurences;
  }

  async createTaskOccurenceByTask(taskId: string) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task.recurrence || task.recurrence.length === 0 || !task.startTime) {
      return null;
    }
    const rrule = RRule.fromString(task.recurrence[0]);

    // Set up the date range for next 2 days
    const now = new Date();
    const startDate = new Date(now);
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + 30);

    // Get base occurrences for the date range
    const baseOccurrences = rrule.between(startDate, endDate);

    const taskStartTime = new Date(task.startTime);
    // Map the base dates to include the correct time from task.startTime
    const occurrences = baseOccurrences.map((date) => {
      const occurrence = new Date(date);
      occurrence.setHours(
        taskStartTime.getHours(),
        taskStartTime.getMinutes(),
        taskStartTime.getSeconds(),
        taskStartTime.getMilliseconds(),
      );
      return occurrence;
    });

    // Filter out any occurrences that have already passed
    const futureOccurrences = occurrences.filter((date) => date > now);
    if (futureOccurrences.length === 0) {
      return [];
    }

    // Step 1: Create a map of formatted dates to their occurrences
    const dateOccurrenceMap = new Map<string, Date[]>();
    futureOccurrences.forEach((date) => {
      const formattedDate = format(date, 'dd-MM-yyyy');
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
            taskIds: [taskId],
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
      const formattedDate = format(date, 'dd-MM-yyyy');
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
    // Now we can use the enhanced map for more efficient operations

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
        },
        update: {
          deleted: null,
        },
      });
    });

    // Execute all upsert operations in parallel
    return await Promise.all(upsertOperations);
  }

  async updateTaskOccurenceByTask(taskId: string) {
    await this.deleteTaskOccurenceByTask(taskId);

    return await this.createTaskOccurenceByTask(taskId);
  }

  async deleteTaskOccurenceByTask(taskId: string) {
    // First get all future occurrences to know which pages to update
    const futureOccurrences = await this.prisma.taskOccurrence.findMany({
      where: {
        taskId,
        startTime: {
          gte: new Date(),
        },
      },
      select: {
        startTime: true,
        workspaceId: true,
      },
    });

    // Mark occurrences as deleted
    await this.prisma.taskOccurrence.updateMany({
      where: {
        taskId,
        startTime: {
          gte: new Date(),
        },
      },
      data: { deleted: new Date().toISOString() },
    });

    // Remove task from each daily page
    await Promise.all(
      futureOccurrences.map(async (occurrence) => {
        const formattedDate = format(occurrence.startTime, 'dd-MM-yyyy');
        await this.pagesService.removeTaskFromPageByTitle(formattedDate, [
          taskId,
        ]);
      }),
    );
  }
}
