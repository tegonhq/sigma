import { BadRequestException, Injectable } from '@nestjs/common';
import {
  CreateBulkTasksDto,
  CreateTaskDto,
  JsonObject,
  PageTypeEnum,
  Task,
  UpdateTaskDto,
} from '@sigma/types';
import { PrismaService } from 'nestjs-prisma';

import { IntegrationsService } from 'modules/integrations/integrations.service';
import { PagesService } from 'modules/pages/pages.service';
import { TaskOccurenceService } from 'modules/task-occurrence/task-occurrence.service';

import { handleCalendarTask, TransactionClient } from './tasks.utils';

@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
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
  ): Promise<Task[]> {
    const tasksData = tasksDto.tasks;
    if (!tasksData.length) {
      throw new BadRequestException('No tasks provided');
    }

    if (tasksData.length > 100) {
      throw new BadRequestException('Too many tasks in bulk request');
    }
    return await this.prisma.$transaction(
      async (tx: TransactionClient) => {
        const createdTasks: Task[] = [];

        for (const taskData of tasksData) {
          const task =
            taskData.source && taskData.integrationAccountId
              ? await this.upsertTaskBySource(taskData, workspaceId, tx)
              : await this.createTask(taskData, workspaceId, tx);

          createdTasks.push(task);
        }

        return createdTasks;
      },
      {
        timeout: 10000,
      },
    );
  }

  async upsertTaskBySource(
    createTaskDto: CreateTaskDto,
    workspaceId: string,
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
      return await this.updateTask(externalTask.id, createTaskDto, tx);
    }

    // If no existing task found, create a new one
    return await this.createTask(createTaskDto, workspaceId, tx);
  }

  async createTask(
    createTaskDto: CreateTaskDto,
    workspaceId: string,
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

    return task;
  }

  async updateTask(
    taskId: string,
    updateTaskDto: UpdateTaskDto,
    tx?: TransactionClient,
  ): Promise<Task> {
    const prismaClient = tx || this.prisma;
    const {
      title,
      status: taskStatus,
      source,
      listId,
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
      ...(listId && {
        list: { connect: { id: listId } },
      }),
      ...('recurrence' in updateTaskDto && {
        recurrence: updateTaskDto.recurrence || [],
      }),
    };

    // Get existing task and update in a single transaction
    const updatedTask = await prismaClient.task.update({
      where: { id: taskId },
      data: updateData,
      include: {
        page: true,
      },
    });

    return updatedTask;
  }

  async deleteTask(taskId: string) {
    // Get task and update in a single transaction
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { page: true },
    });

    if (!task) {
      throw new Error('Task not found');
    }

    if (task.deleted) {
      return task;
    }

    // Soft delete the task
    return await this.prisma.task.update({
      where: { id: taskId },
      data: {
        deleted: new Date().toISOString(),
      },
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
          this.taskOccurenceService.deleteTaskOccurenceByTask(
            task.id,
            workspaceId,
          ),

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
}
