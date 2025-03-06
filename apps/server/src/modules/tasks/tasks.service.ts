import { BadRequestException, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  CreateBulkTasksDto,
  CreateTaskDto,
  JsonObject,
  OutlinkType,
  PageTypeEnum,
  Task,
  UpdateTaskDto,
} from '@sigma/types';
import { PrismaService } from 'nestjs-prisma';

import { IntegrationsService } from 'modules/integrations/integrations.service';
import { PagesService } from 'modules/pages/pages.service';
import { TaskOccurenceService } from 'modules/task-occurence/task-occurence.service';

import {
  getCurrentTaskIds,
  handleCalendarTask,
  TransactionClient,
} from './tasks.utils';
import { TaskHooksService } from '../tasks-hook/tasks-hook.service';

@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    private taskHooksService: TaskHooksService,
    private taskOccurenceService: TaskOccurenceService,
    private integrationService: IntegrationsService,
    private pageService: PagesService,
  ) {}

  async getTaskBySourceId(
    sourceId: string,
    workspaceId: string,
  ): Promise<Task | null> {
    const task = await this.prisma.task.findFirst({
      where: {
        source: {
          path: ['type'],
          equals: 'external',
        },
        AND: {
          source: {
            path: ['id'],
            equals: sourceId,
          },
        },
        deleted: null,
        workspaceId,
      },
    });

    return task || null;
  }

  async getTaskById(taskId: string): Promise<Task | null> {
    const task = await this.prisma.task.findUnique({
      where: {
        id: taskId,
        deleted: null,
      },
      include: {
        page: true,
      },
    });
    return task;
  }

  async createBulkTasks(
    tasksDto: CreateBulkTasksDto,
    workspaceId: string,
    userId: string,
  ): Promise<Task[]> {
    const tasksData = tasksDto.tasks;
    if (!tasksData.length) {
      throw new BadRequestException('No tasks provided');
    }

    if (tasksData.length > 100) {
      throw new BadRequestException('Too many tasks in bulk request');
    }
    return await this.prisma
      .$transaction(
        async (tx: TransactionClient) => {
          const createdTasks: Task[] = [];

          for (const taskData of tasksData) {
            const task =
              taskData.source && taskData.integrationAccountId
                ? await this.upsertTaskBySource(
                    taskData,
                    workspaceId,
                    userId,
                    tx,
                  )
                : await this.createTask(taskData, workspaceId, userId, tx);

            createdTasks.push(task);
          }

          return createdTasks;
        },
        {
          timeout: 10000,
        },
      )
      .then(async (sigmaTasks: Task[]) => {
        await Promise.all(
          sigmaTasks.map((task) =>
            this.taskHooksService.executeHooks(task, {
              workspaceId,
              userId,
              action: 'create',
            }),
          ),
        );

        return sigmaTasks;
      });
  }

  async upsertTaskBySource(
    createTaskDto: CreateTaskDto,
    workspaceId: string,
    userId: string,
    tx?: TransactionClient,
  ): Promise<Task> {
    const { source, integrationAccountId } = createTaskDto;

    if (!source || !integrationAccountId) {
      throw new BadRequestException(
        'source and integrationAccountId are required for upsert',
      );
    }

    const externalTask = await this.getTaskBySourceId(source.id, workspaceId);

    // If we found a task, update it
    if (externalTask) {
      return await this.updateTask(
        externalTask.id,
        createTaskDto,
        workspaceId,
        userId,
        tx,
      );
    }

    // If no existing task found, create a new one
    return await this.createTask(createTaskDto, workspaceId, userId, tx);
  }

  async createTask(
    createTaskDto: CreateTaskDto,
    workspaceId: string,
    userId: string,
    tx?: TransactionClient,
  ): Promise<Task> {
    const prismaClient = tx || this.prisma;
    const {
      title,
      metadata,
      status: taskStatus,
      source,
      integrationAccountId,
      listId,
      pageDescription,
      parentId,
      ...otherTaskData
    } = createTaskDto;

    // For a page if there exisiting an already deleted task with the same title
    // use that instead of creating a new one
    const exisitingTask = await prismaClient.task.findMany({
      where: {
        deleted: { not: null },
        page: {
          title,
        },
      },
    });

    if (exisitingTask.length > 0 && exisitingTask[0]) {
      const task = await prismaClient.task.update({
        where: {
          id: exisitingTask[0].id,
        },
        data: {
          deleted: null,
          source: source ? { ...source } : undefined,
        },
        include: {
          page: true,
        },
      });

      await this.taskHooksService.executeHooks(
        task,
        {
          workspaceId,
          userId,
          action: 'create',
        },
        tx,
      );
      return task;
    }

    // Create the task first
    const task = await prismaClient.task.create({
      data: {
        status: taskStatus || 'Todo',
        metadata,
        ...otherTaskData,
        workspace: { connect: { id: workspaceId } },
        ...(listId && {
          list: { connect: { id: listId } },
        }),
        ...(parentId && { parent: { connect: { id: parentId } } }),
        page: {
          create: {
            title,
            sortOrder: '',
            tags: [],
            type: PageTypeEnum.Default,
            workspace: { connect: { id: workspaceId } },
          },
        },
        source: source ? { ...source } : undefined,
      },
      include: {
        page: true,
      },
    });

    // Then create external link and connect it to the task
    if (source && integrationAccountId) {
      await prismaClient.taskExternalLink.create({
        data: {
          sourceId: source.id,
          url: createTaskDto.url || '',
          integrationAccount: { connect: { id: integrationAccountId } },
          metadata: metadata || {},
          task: { connect: { id: task.id } },
        },
      });
    }

    if (pageDescription) {
      await this.pageService.updatePage(
        { htmlDescription: pageDescription },
        task.pageId,
        tx,
      );
    }

    await this.taskHooksService.executeHooks(
      task,
      {
        workspaceId,
        userId,
        action: 'create',
      },
      tx,
    );

    return task;
  }

  async updateTask(
    taskId: string,
    updateTaskDto: UpdateTaskDto,
    workspaceId: string,
    userId: string,
    tx?: TransactionClient,
  ): Promise<Task> {
    const prismaClient = tx || this.prisma;
    const {
      title,
      status: taskStatus,
      source,
      ...otherTaskData
    } = updateTaskDto;

    // Build update data object
    const updateData: JsonObject = {
      ...otherTaskData,
      ...(source && { source: { id: source.id, type: source.type } }),
      ...(taskStatus && {
        status: taskStatus,
        ...(taskStatus === 'Done' || taskStatus === 'Canceled'
          ? { completedAt: new Date() }
          : {}),
      }),
      ...(title && {
        page: {
          update: { title },
        },
      }),
      ...('recurrence' in updateTaskDto && {
        recurrence: updateTaskDto.recurrence || [],
      }),
    };

    // Get existing task and update in a single transaction
    const [existingTask, updatedTask] = [
      await prismaClient.task.findUnique({
        where: { id: taskId },
        include: { page: true },
      }),
      await prismaClient.task.update({
        where: { id: taskId },
        data: updateData,
        include: {
          page: true,
        },
      }),
    ];

    await this.taskHooksService.executeHooks(
      updatedTask,
      {
        workspaceId,
        userId,
        action: 'update',
        previousTask: existingTask,
      },
      tx,
    );

    return updatedTask;
  }

  async deleteTask(taskId: string, workspaceId: string, userId: string) {
    // Get task and update in a single transaction
    return await this.prisma.$transaction(async (tx: TransactionClient) => {
      const task = await tx.task.findUnique({
        where: { id: taskId },
        include: { page: true },
      });

      if (!task) {
        throw new Error('Task not found');
      }

      if (task.deleted) {
        return task;
      }

      // Run these operations in parallel since they're independent
      await Promise.all([
        // Delete task occurrences if it's recurring
        task.recurrence &&
          this.taskOccurenceService.deleteTaskOccurenceByTask(task.id),

        // Update calendar if task has dates
        (task.startTime || task.endTime) &&
          handleCalendarTask(
            this.prisma,
            this.integrationService,
            workspaceId,
            userId,
            'delete',
            task,
          ),
      ]);

      await this.taskHooksService.executeHooks(
        task,
        {
          workspaceId,
          userId,
          action: 'delete',
        },
        tx,
      );

      // Soft delete the task
      return await tx.task.update({
        where: { id: taskId },
        data: {
          deleted: new Date().toISOString(),
        },
      });
    });
  }

  async deleteTaskBySourceId(
    sourceId: string,
    workspaceId: string,
    userId: string,
  ) {
    return await this.prisma.$transaction(async (tx: TransactionClient) => {
      const task = await this.getTaskBySourceId(sourceId, workspaceId);
      if (!task || task.deleted) {
        return task;
      }

      // Run these operations in parallel since they're independent
      await Promise.all([
        // Delete task occurrences if it's recurring
        task.recurrence &&
          this.taskOccurenceService.deleteTaskOccurenceByTask(task.id),

        // Update calendar if task has dates
        (task.startTime || task.endTime) &&
          handleCalendarTask(
            this.prisma,
            this.integrationService,
            workspaceId,
            userId,
            'delete',
            task,
          ),
      ]);

      return await tx.task.update({
        where: { id: task.id },
        data: {
          deleted: new Date().toISOString(),
        },
      });
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async clearDeletedTasksFromPage(tiptapJson: any, pageId: string) {
    // Get current task IDs from the page content
    const currentTaskIds = getCurrentTaskIds(tiptapJson);

    // Undelete tasks that are currently in the page
    await this.prisma.task.updateMany({
      where: {
        id: { in: currentTaskIds },
        deleted: { not: null },
      },
      data: {
        deleted: null,
      },
    });

    // Find tasks that were previously in this page but are no longer in currentTaskIds
    const tasksToCheck = await this.prisma.task.findMany({
      where: {
        source: {
          path: ['type'],
          equals: 'page',
        },
        AND: {
          deleted: null,
          NOT: {
            id: { in: currentTaskIds },
          },
        },
      },
    });

    // Delete tasks that have no references in any page
    const deletePromises = tasksToCheck.map(async (task) => {
      const referencingPage = await this.prisma.page.findFirst({
        where: {
          id: { not: pageId },
          outlinks: {
            array_contains: [
              {
                type: OutlinkType.Task,
                id: task.id,
              },
            ],
          },
        },
        select: { id: true },
      });

      if (!referencingPage) {
        return this.prisma.task.update({
          where: { id: task.id },
          data: { deleted: new Date() },
        });
      }

      return undefined;
    });

    return Promise.all(deletePromises);
  }

  @OnEvent('task.delete.tasksFromPage')
  async handleClearDeletedTasksFromPage(payload: {
    pageId: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tiptapJson: any;
  }) {
    await this.clearDeletedTasksFromPage(payload.tiptapJson, payload.pageId);
  }
}
