import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { IntegrationAccount, JsonObject } from '@sigma/types';
import { Queue } from 'bullmq';
import { parseExpression } from 'cron-parser';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class IntegrationsQueue implements OnModuleInit {
  constructor(
    @InjectQueue('integrations') private integrationsQueue: Queue,
    private prisma: PrismaService,
  ) {}

  async onModuleInit() {
    await this.initScheduledTasks();
  }

  private async initScheduledTasks() {
    // Clean up existing jobs
    await this.integrationsQueue.obliterate({ force: true });

    // Get all scheduled tasks
    const scheduledIntegrationAccounts =
      await this.prisma.integrationAccount.findMany({
        where: {
          settings: {
            path: ['scheduled'],
            equals: true,
          },
          deleted: null,
        },
      });

    // Set up each scheduled task
    for (const integrationAccount of scheduledIntegrationAccounts) {
      await this.addCronJob(integrationAccount);
    }
  }

  async addCronJob(integrationAccount: IntegrationAccount) {
    const settings = integrationAccount.settings as JsonObject;
    if (!settings?.scheduled) {
      return;
    }

    try {
      // Validate cron expression
      parseExpression(settings.schedule_frequency as string);

      // Get the original creation time's hour and minutes
      const createdAt = integrationAccount.createdAt;
      const startDate = new Date();
      startDate.setHours(createdAt.getHours());
      startDate.setMinutes(createdAt.getMinutes());
      startDate.setSeconds(0);

      // If this time has already passed today, move it to tomorrow
      if (startDate.getTime() < Date.now()) {
        startDate.setDate(startDate.getDate() + 1);
      }
      // Add repeatable job
      await this.integrationsQueue.upsertJobScheduler(
        `integration-${integrationAccount.id}`,
        {
          pattern: settings.schedule_frequency as string,
          startDate,
        },
        {
          name: 'scheduled-integration',
          data: { integrationAccountId: integrationAccount.id }, // TypeScript ensures correct data structure
        },
      );
    } catch (error) {
      console.error(
        `Invalid CRON expression for integration acount ${integrationAccount.id}: ${settings.schedule}`,
      );
    }
  }

  async syncInitialTasks(integrationAccountId: string) {
    await this.integrationsQueue.add('sync-initial-tasks', {
      integrationAccountId,
    });
  }

  async updateTaskSchedule(taskId: string, newSchedule: string) {
    // Simply upsert with new schedule - no need to remove old one first
    await this.integrationsQueue.upsertJobScheduler(
      `task-${taskId}`,
      { pattern: newSchedule },
      {
        name: 'scheduled-task',
        data: { taskId },
      },
    );
  }

  async removeCronJob(taskId: string) {
    const repeatableJobs = await this.integrationsQueue.getJobSchedulers();
    const job = repeatableJobs.find((job) => job.id === `task-${taskId}`);
    if (job) {
      await this.integrationsQueue.removeJobScheduler(
        'ccfe92477312aa78d91ea3b9d7656af8',
      );
      return { status: 'Removed schedule' };
    }
    return { status: 'No job found' };
  }

  async removeTaskSchedule(taskId: string) {
    // Clean removal of scheduler
    return await this.integrationsQueue.removeJobScheduler(`task-${taskId}`);
  }

  async listScheduledTasks() {
    try {
      const repeatableJobs = await this.integrationsQueue.getJobSchedulers();

      // Format the jobs for better readability
      return repeatableJobs.map((job) => {
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
    const repeatableJobs = await this.integrationsQueue.getJobSchedulers();
    return repeatableJobs.find((job) => job.id === `task-${taskId}`);
  }

  // Optional: Get next execution time for a task
  async getNextExecutionTime(taskId: string) {
    const job = await this.getScheduledTask(taskId);
    return job?.next;
  }
}
