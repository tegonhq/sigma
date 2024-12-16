import { Injectable } from '@nestjs/common';
import {
  CreateTaskDto,
  JsonObject,
  PageTypeEnum,
  Task,
  TaskType,
} from '@sigma/types';
import { PrismaService } from 'nestjs-prisma';

import { TasksQueue } from './tasks.queue';

@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    private tasksQueue: TasksQueue,
  ) {}

  async createTask(
    createTaskDto: CreateTaskDto,
    workspaceId: string,
  ): Promise<Task> {
    const {
      title,
      metadata: rawMetadata,
      status: taskStatus,
      url,
      integrationAccountId,
      ...otherTaskData
    } = createTaskDto;

    // Check if task with same URL exists in workspace
    const existingTask = url
      ? await this.prisma.task.findFirst({
          where: {
            url,
            workspaceId,
            deleted: null,
          },
        })
      : null;

    const metadata = rawMetadata
      ? {
          type: rawMetadata.type || TaskType.NORMAL,
          ...(rawMetadata.type === TaskType.SCHEDULED && {
            schedule: rawMetadata?.schedule,
          }),
        }
      : { type: TaskType.NORMAL };

    if (existingTask) {
      // Update existing task
      const task = await this.prisma.task.update({
        where: { id: existingTask.id },
        data: {
          status: taskStatus ? taskStatus : existingTask.status,
          metadata,
          ...otherTaskData,
          page: {
            update: {
              title,
            },
          },
          deleted: null,
        },
      });

      // Update schedule if needed
      if (rawMetadata?.type === TaskType.SCHEDULED) {
        await this.tasksQueue.addCronJob(task);
      }

      return task;
    }

    // Create new task
    const task = await this.prisma.task.create({
      data: {
        status: taskStatus ? taskStatus : 'Todo',
        ...otherTaskData,
        url,
        metadata,
        workspace: { connect: { id: workspaceId } },
        ...(integrationAccountId
          ? { integrationAccount: { connect: { id: integrationAccountId } } }
          : {}),
        page: {
          create: {
            title,
            sortOrder: '',
            tags: [],
            type: PageTypeEnum.Default,
            workspaceId,
          },
        },
      },
    });

    // If it's a scheduled task, add it to the queue
    if (rawMetadata && rawMetadata.type === TaskType.SCHEDULED) {
      await this.tasksQueue.addCronJob(task);
    }

    return task;
  }

  async update(
    taskId: string,
    updateTaskDto: Partial<CreateTaskDto>,
  ): Promise<Task> {
    const {
      title,
      metadata: rawMetadata,
      status: taskStatus,
      ...otherTaskData
    } = updateTaskDto;

    const updateData: JsonObject = {
      ...otherTaskData,
    };

    if (taskStatus) {
      updateData.status = taskStatus;
    }

    if (rawMetadata) {
      updateData.metadata = {
        type: rawMetadata.type || TaskType.NORMAL,
        ...(rawMetadata.type === TaskType.SCHEDULED && {
          schedule: rawMetadata?.schedule,
        }),
      };
    }

    if (title) {
      updateData.page = {
        update: {
          title,
        },
      };
    }

    const task = await this.prisma.task.update({
      where: { id: taskId },
      data: updateData,
      include: {
        page: true,
      },
    });

    // If schedule was updated, update the queue
    if (rawMetadata?.type === TaskType.SCHEDULED && rawMetadata?.schedule) {
      await this.tasksQueue.updateTaskSchedule(taskId, rawMetadata.schedule);
    }

    return task;
  }

  async deleteTask(taskId: string) {
    // Get task first to check if it's scheduled
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new Error('Task not found');
    }

    // If it's a scheduled task, remove from queue first
    if (
      task.metadata &&
      (task.metadata as JsonObject).type === TaskType.SCHEDULED
    ) {
      await this.tasksQueue.removeTaskSchedule(taskId);
    }

    // Soft delete the task
    return await this.prisma.task.update({
      where: { id: taskId },
      data: {
        deleted: new Date().toISOString(),
      },
    });
  }

  async deleteTaskByUrl(url: string, workspaceId: string) {
    const task = await this.prisma.task.findFirst({
      where: { url, workspaceId },
    });

    if (task) {
      return await this.prisma.task.update({
        where: { id: task.id },
        data: {
          deleted: new Date().toISOString(),
        },
      });
    }
    return true;
  }
}
