import { Injectable } from '@nestjs/common';
import { CreateTaskDto, JsonObject, PageTypeEnum, Task } from '@sigma/types';
import { PrismaService } from 'nestjs-prisma';

import { TaskOccurenceService } from 'modules/task-occurence/task-occurence.service';

@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    private taskOccurenceService: TaskOccurenceService,
  ) {}

  async getTaskBySourceId(sourceId: string): Promise<Task | null> {
    return await this.prisma.task.findFirst({
      where: {
        sourceId,
        deleted: null,
      },
    });
  }

  async getTaskById(taskId: string): Promise<Task | null> {
    return await this.prisma.task.findFirst({
      where: {
        id: taskId,
        deleted: null,
      },
    });
  }

  async createTask(
    createTaskDto: CreateTaskDto,
    workspaceId: string,
  ): Promise<Task> {
    const {
      title,
      metadata,
      status: taskStatus,
      sourceId,
      integrationAccountId,
      ...otherTaskData
    } = createTaskDto;

    // Check if task with same URL exists in workspace
    const existingTask = sourceId
      ? await this.prisma.task.findFirst({
          where: {
            sourceId,
            workspaceId,
          },
        })
      : null;

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

      if (existingTask.recurrence) {
        await this.taskOccurenceService.updateTaskOccuranceByTask(task.id);
      }

      return task;
    }
    // Create new task
    const task = await this.prisma.task.create({
      data: {
        status: taskStatus ? taskStatus : 'Todo',
        ...otherTaskData,
        sourceId,
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

    // If it's a scheduled task, add it to occurences
    if (task.recurrence) {
      await this.taskOccurenceService.createTaskOccurance(task.id);
    }

    return task;
  }

  async update(
    taskId: string,
    updateTaskDto: Partial<CreateTaskDto>,
  ): Promise<Task> {
    const { title, status: taskStatus, ...otherTaskData } = updateTaskDto;

    const updateData: JsonObject = {
      ...otherTaskData,
    };

    if ('recurrence' in updateTaskDto) {
      updateData.recurrence = updateTaskDto.recurrence || [];
    }

    if (taskStatus) {
      if (taskStatus === 'Done' || taskStatus === 'Canceled') {
        updateData.completedAt = new Date();
      }
      updateData.status = taskStatus;
    }

    if (title) {
      updateData.page = {
        update: {
          title,
        },
      };
    }

    const existingTask = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    const task = await this.prisma.task.update({
      where: { id: taskId },
      data: updateData,
      include: {
        page: true,
      },
    });

    // If schedule was updated or changed, update occurences
    if (
      JSON.stringify(existingTask.recurrence) !==
        JSON.stringify(task.recurrence) ||
      existingTask.startTime !== task.startTime ||
      existingTask.endTime !== task.endTime
    ) {
      await this.taskOccurenceService.updateTaskOccuranceByTask(task.id);
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
    if (task.recurrence) {
      await this.taskOccurenceService.deleteTaskOccuranceByTask(task.id);
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
      // If it's a scheduled task, remove from queue first
      if (task.recurrence) {
        await this.taskOccurenceService.deleteTaskOccuranceByTask(task.id);
      }

      return await this.prisma.task.update({
        where: { id: task.id },
        data: {
          deleted: new Date().toISOString(),
        },
      });
    }
    return true;
  }

  async deleteTaskBySourceId(sourceId: string) {
    const task = await this.prisma.task.findFirst({
      where: { sourceId },
    });

    if (task) {
      // If it's a scheduled task, remove occurrences first
      if (task.recurrence) {
        await this.taskOccurenceService.deleteTaskOccuranceByTask(task.id);
      }

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
