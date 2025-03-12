import { Injectable } from '@nestjs/common';
import { Outlink, OutlinkType, Task, TaskHookContext } from '@sigma/types';
import { tasks } from '@trigger.dev/sdk/v3';
import { PrismaService } from 'nestjs-prisma';
import { beautifyTask } from 'triggers/task/beautify-task';
import { generateSummaryTask } from 'triggers/task/generate-summary';

import { IntegrationsService } from 'modules/integrations/integrations.service';
import { PagesService } from 'modules/pages/pages.service';
import { TaskOccurenceService } from 'modules/task-occurrence/task-occurrence.service';
import { UsersService } from 'modules/users/users.service';

import {
  getSummaryData,
  handleCalendarTask,
  TransactionClient,
} from '../tasks/tasks.utils';

@Injectable()
export class TaskHooksService {
  constructor(
    private usersService: UsersService,
    private pagesService: PagesService,
    private prisma: PrismaService,
    private taskOccurenceService: TaskOccurenceService,
    private integrationService: IntegrationsService,
  ) {}

  async executeHooks(
    task: Task,
    context: TaskHookContext,
    tx?: TransactionClient,
  ) {
    // Only trigger when task is CUD from the API without transaction
    if (!tx) {
      await this.handleBeautifyTask(task, context);
      await Promise.all([
        this.handleTitleChange(task, context),
        this.handleDeleteTask(task, context),
        this.handleScheduleTask(task, context),
        // this.handleCalendarTask(task, context),
        // this.handleGenerateSummary(task, context),
      ]);
    }
  }

  async handleDeleteTask(task: Task, context: TaskHookContext) {
    if (context.action === 'delete') {
      const taskOccurences = await this.prisma.taskOccurrence.findMany({
        where: { taskId: task.id },
      });
      if (taskOccurences.length) {
        await this.prisma.taskOccurrence.updateMany({
          where: { taskId: task.id },
          data: { deleted: new Date().toISOString() },
        });

        const referencingPages = await this.prisma.page.findMany({
          where: {
            outlinks: {
              array_contains: [
                {
                  type: OutlinkType.Task,
                  id: task.id,
                },
              ],
            },
          },
        });

        if (referencingPages.length > 0) {
          await Promise.all(
            referencingPages.map(async (page) => {
              await this.pagesService.removeTaskFromPageByTitle(page.title, [
                task.id,
              ]);
            }),
          );
        }
      }
    }
  }

  async handleTitleChange(task: Task, context: TaskHookContext) {
    if (
      context.previousTask &&
      task.page.title !== context.previousTask.page.title
    ) {
      const pagesWithTask = await this.prisma.page.findMany({
        where: {
          outlinks: {
            array_contains: [
              {
                type: OutlinkType.Task,
                id: task.id,
              },
            ],
          },
        },
        select: { id: true, description: true, outlinks: true },
      });

      await Promise.all(
        pagesWithTask.map(async (page) => {
          if (!page.description) {
            return;
          }

          try {
            const description = JSON.parse(page.description as string);
            const taskOutlinks = (page.outlinks as unknown as Outlink[]).filter(
              (o) => o.id === task.id && o.type === OutlinkType.Task,
            );

            let updated = false;
            for (const outlink of taskOutlinks) {
              let node = description;
              for (const index of outlink.position.path) {
                node = node.content[index];
              }

              node.content = [{ type: 'text', text: task.page.title }];
              updated = true;
            }

            if (updated) {
              await this.pagesService.updatePage(
                { description: JSON.stringify(description) },
                page.id,
              );
            }
          } catch (error) {
            console.error(`Failed to update task in page ${page.id}:`, error);
          }
        }),
      );
    }
  }

  async handleScheduleTask(task: Task, context: TaskHookContext) {
    switch (context.action) {
      case 'create':
        if (task.recurrence) {
          await this.taskOccurenceService.createTaskOccurenceByTask(task.id);
        }
        return { message: 'Handled schedule create' };

      case 'update':
        if (
          JSON.stringify(context.previousTask.recurrence) !==
            JSON.stringify(task.recurrence) ||
          String(task.startTime) !== String(context.previousTask?.startTime) ||
          String(task.endTime) !== String(context.previousTask?.endTime)
        ) {
          await this.taskOccurenceService.updateTaskOccurenceByTask(task.id);
        }
        return { message: 'Handled schedule update' };

      case 'delete':
        if (task.recurrence || task.startTime || task.endTime) {
          await this.taskOccurenceService.deleteTaskOccurenceByTask(task.id);
        }
        return { message: 'Handled schedule delete' };
    }
  }

  async handleCalendarTask(task: Task, context: TaskHookContext) {
    switch (context.action) {
      case 'create':
        if (task.startTime || task.endTime) {
          await handleCalendarTask(
            this.prisma,
            this.integrationService,
            task.workspaceId,
            context.userId,
            'create',
            task,
          );
        }
        return { message: 'Handled schedule create' };

      case 'update':
        // Check if schedule related fields were updated
        if (
          JSON.stringify(context.previousTask.recurrence) !==
            JSON.stringify(task.recurrence) ||
          String(task.startTime) !== String(context.previousTask?.startTime) ||
          String(task.endTime) !== String(context.previousTask?.endTime)
        ) {
          await handleCalendarTask(
            this.prisma,
            this.integrationService,
            task.workspaceId,
            context.userId,
            'update',
            task,
          );
        }
        return { message: 'Handled schedule update' };

      case 'delete':
        if (task.startTime || task.endTime) {
          await handleCalendarTask(
            this.prisma,
            this.integrationService,
            task.workspaceId,
            context.userId,
            'delete',
            task,
          );
        }
        return { message: 'Handled schedule delete' };
    }
  }

  async handleBeautifyTask(task: Task, context: TaskHookContext) {
    if (context.action === 'create') {
      const pat = await this.usersService.getOrCreatePat(
        context.userId,
        context.workspaceId,
      );
      await tasks.trigger<typeof beautifyTask>('beautify-task', {
        taskId: task.id,
        pat,
      });
    }
  }

  async handleGenerateSummary(task: Task, context: TaskHookContext) {
    if (context.action !== 'delete') {
      const pat = await this.usersService.getOrCreatePat(
        context.userId,
        context.workspaceId,
      );
      await tasks.trigger<typeof generateSummaryTask>('generate-summary', {
        taskId: task.id,
        summaryData: getSummaryData(task, true),
        pat,
        userId: context.userId,
      });
    }
  }
}
