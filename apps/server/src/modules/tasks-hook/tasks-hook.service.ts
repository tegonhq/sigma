import { Injectable } from '@nestjs/common';
import {
  OutlinkType,
  PageTypeEnum,
  Task,
  TaskHookAction,
  TaskHookContext,
} from '@tegonhq/sigma-sdk';
import { tasks } from '@trigger.dev/sdk/v3';
import { PrismaService } from 'nestjs-prisma';
import { beautifyTask } from 'triggers/task/beautify-task';
import { generateSummaryTask } from 'triggers/task/generate-summary';

import { IntegrationsService } from 'modules/integrations/integrations.service';
import { PagesService } from 'modules/pages/pages.service';
import { TaskOccurenceService } from 'modules/task-occurrence/task-occurrence.service';
import { UsersService } from 'modules/users/users.service';

import { getSummaryData, handleCalendarTask } from '../tasks/tasks.utils';

@Injectable()
export class TaskHooksService {
  constructor(
    private usersService: UsersService,
    private pagesService: PagesService,
    private prisma: PrismaService,
    private taskOccurenceService: TaskOccurenceService,
    private integrationService: IntegrationsService,
  ) {}

  async executeHookWithId(
    taskId: string,
    action: TaskHookAction,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    changeData?: Record<string, any>,
  ) {
    const task = await this.prisma.task.findUnique({
      where: {
        id: taskId,
      },
      include: {
        workspace: true,
        subIssue: true,
      },
    });

    if (!task) {
      return;
    }

    const context: TaskHookContext = {
      userId: task.workspace.userId,
      workspaceId: task.workspaceId,
      action,
      changeData,
    };

    await this.handleBeautifyTask(task, context);
    await Promise.all([
      this.handleDeleteTask(task, context),
      this.handleScheduleTask(task, context),
      this.handleListTask(task, context),
      // this.handleCalendarTask(task, context),
      // this.handleGenerateSummary(task, context),
    ]);
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

      if (task.subIssue.length > 0) {
        await this.prisma.task.updateMany({
          where: { id: { in: task.subIssue.map((subTask) => subTask.id) } },
          data: { parentId: null },
        });
      }
    }
  }

  async handleScheduleTask(task: Task, context: TaskHookContext) {
    switch (context.action) {
      case 'create':
        if (task.recurrence) {
          await this.taskOccurenceService.createTaskOccurenceByTask(
            task.id,
            task.workspaceId,
          );
        }
        return { message: 'Handled schedule create' };

      case 'update':
        if (
          context.changeData &&
          (context.changeData.recurrence ||
            context.changeData.startTime ||
            context.changeData.endTime)
        ) {
          await this.taskOccurenceService.updateTaskOccurenceByTask(
            task.id,
            task.workspaceId,
          );
        }
        return { message: 'Handled schedule update' };

      case 'delete':
        if (task.recurrence || task.startTime || task.endTime) {
          await this.taskOccurenceService.deleteTaskOccurenceByTask(
            task.id,
            task.workspaceId,
          );
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
          context.changeData &&
          (context.changeData.recurrence ||
            context.changeData.startTime ||
            context.changeData.endTime)
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

  async handleListTask(task: Task, context: TaskHookContext) {
    const addTaskToListPage = async (task: Task) => {
      const list = await this.prisma.list.findUnique({
        where: {
          id: task.listId,
        },
        include: {
          page: true,
        },
      });

      await this.pagesService.getOrCreatePageByTitle(list.page.title, {
        title: list.page.title,
        type: list.page.type as PageTypeEnum,
        taskIds: [task.id],
      });
    };

    const removeTaskInListPage = async (task: Task) => {
      const list = await this.prisma.list.findUnique({
        where: {
          id: task.listId,
        },
        include: {
          page: true,
        },
      });

      await this.pagesService.removeTaskFromPageByTitle(list.page.title, [
        task.id,
      ]);
    };

    switch (context.action) {
      case 'create':
        if (task.listId) {
          await addTaskToListPage(task);
        }
        return { message: 'Handled schedule create' };

      case 'update':
        // Check if schedule related fields were updated
        if (
          context.changeData.listId &&
          context.changeData.listId !== task.listId
        ) {
          await removeTaskInListPage(task);
        }
        if (task.listId && context.changeData.listId !== task.listId) {
          await addTaskToListPage(task);
        }
        return { message: 'Handled schedule update' };

      case 'delete':
        if (task.listId) {
          await removeTaskInListPage(task);
        }
        return { message: 'Handled schedule delete' };
    }
  }
}
