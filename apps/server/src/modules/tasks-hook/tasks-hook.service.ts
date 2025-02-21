import { Injectable } from '@nestjs/common';
import { Task, TaskHookContext } from '@sigma/types';
import { tasks } from '@trigger.dev/sdk/v3';
import { format } from 'date-fns/format';
import { PrismaService } from 'nestjs-prisma';
import { beautifyTask } from 'triggers/beautify-task';
import { generateSummaryTask } from 'triggers/generate-summary';

import { IntegrationsService } from 'modules/integrations/integrations.service';
import { PagesService } from 'modules/pages/pages.service';
import { TaskOccurenceService } from 'modules/task-occurence/task-occurence.service';
import { UsersService } from 'modules/users/users.service';

import {
  getSummaryData,
  handleCalendarTask,
  TransactionClient,
} from '../tasks/tasks.utils';
import { addTaskToDatePage } from './hooks/due-date';

@Injectable()
export class TaskHooksService {
  constructor(
    private usersService: UsersService,
    private pagesService: PagesService,
    private prisma: PrismaService,
    private taskOccurenceService: TaskOccurenceService,
    private integrationService: IntegrationsService,
  ) {}

  // async onModuleInit() {
  //   const task = await this.prisma.task.findUnique({
  //     where: { id: '9c76c273-81de-439d-9abb-679f455a0dfe' },
  //   });
  //   await this.executeHooks(task, {
  //     workspaceId: 'b1cb7b75-d109-4baa-b879-66f3c9f853aa',
  //     userId: 'e1895007-a8a1-4935-9c11-8f61accc9382',
  //     action: 'create',
  //   });
  // }
  async executeHooks(
    task: Task,
    context: TaskHookContext,
    tx?: TransactionClient,
  ) {
    if (!tx) {
      await Promise.all([
        this.handleDueDate(task, context),
        this.handleCalendarTask(task, context),
        // this.handleBeautifyTask(task, context),
        // this.handleGenerateSummary(task, context),
      ]);
    }
  }

  private async handleDueDate(task: Task, context: TaskHookContext) {
    switch (context.action) {
      case 'create':
        if (task.dueDate) {
          await addTaskToDatePage(this.pagesService, task);
        }
        return { message: 'Handled duedate create' };
      case 'update':
        // Handle case where due date changes
        if (task.dueDate !== context.previousTask?.dueDate) {
          // Remove from old date page if there was a previous due date
          if (context.previousTask?.dueDate) {
            const formattedDate = format(task.dueDate, 'dd-MM-yyyy');
            await this.pagesService.removeTaskFromPageByTitle(
              formattedDate,
              context.previousTask.id,
              context.workspaceId,
            );
          }
          // Add to new date page if there is a new due date
          if (task.dueDate) {
            await addTaskToDatePage(this.pagesService, task);
          }
        }
        return { message: 'Handled duedate update' };

      case 'delete':
        if (task.dueDate) {
          const formattedDate = format(task.dueDate, 'dd-MM-yyyy');
          await this.pagesService.removeTaskFromPageByTitle(
            formattedDate,
            context.previousTask.id,
            context.workspaceId,
          );
        }
        return { message: 'Handled duedate delete' };
    }
  }

  async handleScheduleTask(
    task: Task,
    context: TaskHookContext,
    tx: TransactionClient,
  ) {
    switch (context.action) {
      case 'create':
        if (task.recurrence) {
          await this.taskOccurenceService.createTaskOccurance(task.id, tx);
        }
        return { message: 'Handled schedule create' };

      case 'update':
        if (
          JSON.stringify(context.previousTask.recurrence) !==
            JSON.stringify(task.recurrence) ||
          task.startTime !== context.previousTask?.startTime ||
          task.endTime !== context.previousTask?.endTime
        ) {
          await this.taskOccurenceService.updateTaskOccuranceByTask(
            task.id,
            tx,
          );
        }
        return { message: 'Handled schedule update' };

      case 'delete':
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
          task.startTime !== context.previousTask?.startTime ||
          task.endTime !== context.previousTask?.endTime
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
