import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Task, TaskMetadata, TaskType } from '@sigma/types';
import { Queue } from 'bullmq';
import { parseExpression } from 'cron-parser';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class TasksQueue implements OnModuleInit {
  constructor(
    @InjectQueue('tasks') private tasksQueue: Queue,
    private prisma: PrismaService,
  ) {}

  async onModuleInit() {
    await this.initScheduledTasks();
  }

  private async initScheduledTasks() {
    // Clean up existing jobs
    await this.tasksQueue.obliterate({ force: true });

    // Get all scheduled tasks
    const scheduledTasks = await this.prisma.task.findMany({
      where: {
        metadata: {
          path: ['type'],
          equals: TaskType.SCHEDULED,
        },
        deleted: null,
      },
    });

    // Set up each scheduled task
    for (const task of scheduledTasks) {
      await this.addCronJob(task);
    }
  }

  async addCronJob(task: Task) {
    const metadata = task.metadata as unknown as TaskMetadata;
    if (!metadata?.schedule) {
      return;
    }

    try {
      // Validate cron expression
      parseExpression(metadata.schedule);

      // Add repeatable job
      await this.tasksQueue.upsertJobScheduler(
        `task-${task.id}`,
        { pattern: metadata.schedule },
        {
          name: 'scheduled-task',
          data: { taskId: task.id }, // TypeScript ensures correct data structure
        },
      );
    } catch (error) {
      console.error(
        `Invalid CRON expression for task ${task.id}: ${metadata.schedule}`,
      );
    }
  }

  async updateTaskSchedule(taskId: string, newSchedule: string) {
    // Simply upsert with new schedule - no need to remove old one first
    await this.tasksQueue.upsertJobScheduler(
      `task-${taskId}`,
      { pattern: newSchedule },
      {
        name: 'scheduled-task',
        data: { taskId },
      },
    );
  }

  async removeCronJob(taskId: string) {
    const repeatableJobs = await this.tasksQueue.getJobSchedulers();
    const job = repeatableJobs.find((job) => job.id === `task-${taskId}`);
    if (job) {
      await this.tasksQueue.removeJobScheduler(
        'ccfe92477312aa78d91ea3b9d7656af8',
      );
      return { status: 'Removed schedule' };
    }
    return { status: 'No job found' };
  }

  async removeTaskSchedule(taskId: string) {
    // Clean removal of scheduler
    return await this.tasksQueue.removeJobScheduler(`task-${taskId}`);
  }

  async listScheduledTasks() {
    try {
      const repeatableJobs = await this.tasksQueue.getJobSchedulers();

      // Format the jobs for better readability
      return repeatableJobs.map((job) => {
        console.log(JSON.stringify(job));
        return {
          id: job.id,
          name: job.name,
          pattern: job.pattern,
          nextRun: job.next,
          key: job.key,
          // endDate: job.endDate, // If you set an end date
          // tz: job.tz // If you set a timezone
        };
      });
    } catch (error) {
      console.error('Failed to list scheduled tasks:', error);
      throw error;
    }
  }

  // Optional: Get a specific scheduled task
  async getScheduledTask(taskId: string) {
    const repeatableJobs = await this.tasksQueue.getJobSchedulers();
    return repeatableJobs.find((job) => job.id === `task-${taskId}`);
  }

  // Optional: Get next execution time for a task
  async getNextExecutionTime(taskId: string) {
    const job = await this.getScheduledTask(taskId);
    return job?.next;
  }
}
