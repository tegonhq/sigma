import type { beautifyTask } from 'triggers/beautify-task';

import { BadRequestException, Injectable } from '@nestjs/common';
import {
  CreateTaskDto,
  JsonObject,
  PageTypeEnum,
  Task,
  UpdateTaskDto,
} from '@sigma/types';
import { tasks } from '@trigger.dev/sdk/v3';
import { PrismaService } from 'nestjs-prisma';

import { IntegrationsService } from 'modules/integrations/integrations.service';
import { TaskOccurenceService } from 'modules/task-occurence/task-occurence.service';
import { UsersService } from 'modules/users/users.service';

import {
  handleCalendarTask,
  TransactionClient,
  transformActivityDto,
} from './tasks.utils';

@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    private taskOccurenceService: TaskOccurenceService,
    private integrationService: IntegrationsService,
    private usersService: UsersService,
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
    tasksData: CreateTaskDto[],
    workspaceId: string,
    userId: string,
  ): Promise<Task[]> {
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
            const task = await this.createTask(
              taskData,
              workspaceId,
              userId,
              tx, // Pass the transaction
            );
            createdTasks.push(task);
          }

          return createdTasks;
        },
        {
          timeout: 10000,
        },
      )
      .then(async (sigmaTasks: Task[]) => {
        // Trigger beautify tasks after transaction commits
        const pat = await this.usersService.getOrCreatePat(userId, workspaceId);

        await Promise.all(
          sigmaTasks.map((task) =>
            tasks.trigger<typeof beautifyTask>('beautify-task', {
              taskId: task.id,
              pat,
            }),
          ),
        );

        return sigmaTasks;
      });
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
      sourceId,
      integrationAccountId,
      listId,
      ...otherTaskData
    } = createTaskDto;

    // Check if task with same sourceId exists and update it
    if (sourceId) {
      const existingTask = await prismaClient.task.findFirst({
        where: {
          sourceId,
          workspaceId,
        },
      });

      if (existingTask) {
        const task = await prismaClient.task.update({
          where: { id: existingTask.id },
          data: {
            status: taskStatus || existingTask.status,
            metadata,
            ...otherTaskData,
            page: {
              update: { title },
            },
            deleted: null,
            ...(otherTaskData.activity && {
              activity: {
                create: transformActivityDto(
                  otherTaskData.activity,
                  workspaceId,
                ),
              },
            }),
          },
          include: {
            page: true,
          },
        });

        // Handle recurring task updates
        if (existingTask.recurrence) {
          await this.taskOccurenceService.updateTaskOccuranceByTask(
            task.id,
            tx,
          );
        }

        // Handle calendar integration if task has timing
        if (task.startTime || task.endTime) {
          await handleCalendarTask(
            prismaClient,
            this.integrationService,
            workspaceId,
            userId,
            'update',
            task,
          );
        }

        return task;
      }
    }

    // Create new task
    const task = await prismaClient.task.create({
      data: {
        status: taskStatus || 'Todo',
        ...otherTaskData,
        sourceId,
        metadata,
        workspace: { connect: { id: workspaceId } },
        ...(integrationAccountId && {
          integrationAccount: { connect: { id: integrationAccountId } },
        }),
        ...(listId && {
          list: { connect: { id: listId } },
        }),
        page: {
          create: {
            title,
            sortOrder: '',
            tags: [],
            type: PageTypeEnum.Default,
            workspaceId,
          },
        },
        ...(otherTaskData.activity && {
          activity: {
            create: transformActivityDto(otherTaskData.activity, workspaceId),
          },
        }),
      },
      include: {
        page: true,
      },
    });

    // Handle recurring task creation
    if (task.recurrence) {
      await this.taskOccurenceService.createTaskOccurance(task.id, tx);
    }

    // Handle calendar integration if task has timing
    if (task.startTime || task.endTime) {
      await handleCalendarTask(
        prismaClient,
        this.integrationService,
        workspaceId,
        userId,
        'create',
        task,
      );
    }

    // Only trigger beautify task if not in a transaction
    if (!tx) {
      const pat = await this.usersService.getOrCreatePat(userId, workspaceId);
      await tasks.trigger<typeof beautifyTask>('beautify-task', {
        taskId: task.id,
        pat,
      });
    }

    return task;
  }

  async update(
    taskId: string,
    updateTaskDto: UpdateTaskDto,
    workspaceId: string,
    userId: string,
  ): Promise<Task> {
    const { title, status: taskStatus, ...otherTaskData } = updateTaskDto;

    // Build update data object
    const updateData: JsonObject = {
      ...otherTaskData,
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
      ...(otherTaskData.activity && {
        activity: {
          create: transformActivityDto(otherTaskData.activity, workspaceId),
        },
      }),
    };

    // Get existing task and update in a single transaction
    const [existingTask, updatedTask] = await this.prisma.$transaction([
      this.prisma.task.findUnique({
        where: { id: taskId },
      }),
      this.prisma.task.update({
        where: { id: taskId },
        data: updateData,
        include: {
          page: true,
        },
      }),
    ]);

    // Check if schedule related fields were updated
    const scheduleChanged =
      JSON.stringify(existingTask.recurrence) !==
        JSON.stringify(updatedTask.recurrence) ||
      existingTask.startTime?.toISOString() !==
        updatedTask.startTime?.toISOString() ||
      existingTask.endTime?.toISOString() !==
        updatedTask.endTime?.toISOString();

    if (scheduleChanged) {
      await Promise.all([
        this.taskOccurenceService.updateTaskOccuranceByTask(updatedTask.id),
        handleCalendarTask(
          this.prisma,
          this.integrationService,
          workspaceId,
          userId,
          'update',
          updatedTask,
        ),
      ]);
    }

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
          this.taskOccurenceService.deleteTaskOccuranceByTask(task.id),

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
      const task = await tx.task.findFirst({
        where: { sourceId },
        include: { page: true },
      });

      if (!task || task.deleted) {
        return task;
      }

      // Run these operations in parallel since they're independent
      await Promise.all([
        // Delete task occurrences if it's recurring
        task.recurrence &&
          this.taskOccurenceService.deleteTaskOccuranceByTask(task.id),

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
