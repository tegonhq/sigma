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
      ...otherTaskData
    } = createTaskDto;
    const metadata = rawMetadata
      ? {
          type: rawMetadata.type || TaskType.NORMAL,
          ...(rawMetadata.type === TaskType.SCHEDULED && {
            schedule: rawMetadata?.schedule,
          }),
        }
      : {};

    const task = await this.prisma.task.create({
      data: {
        status: taskStatus ? taskStatus : 'Todo',
        ...otherTaskData,
        metadata,
        workspace: {
          connect: {
            id: workspaceId,
          },
        },
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
}
