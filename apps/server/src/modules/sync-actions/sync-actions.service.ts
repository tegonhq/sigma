import { Injectable } from '@nestjs/common';
import { ModelName } from '@prisma/client';
import { ModelNameEnum, SyncAction } from '@redplanethq/sol-sdk';
import { tasks } from '@trigger.dev/sdk/v3';
import { PrismaService } from 'nestjs-prisma';
import { listActivityHandler } from 'triggers/list/list-activity-handler';

import ActivityService from 'modules/activity/activity.service';
import { PagesService } from 'modules/pages/pages.service';
import { tableHooks } from 'modules/replication/replication.interface';
import { TaskHooksService } from 'modules/tasks-hook/tasks-hook.service';

import {
  convertLsnToInt,
  convertToActionType,
  convertToActionTypeForUser,
  getLastSequenceId,
  getModelData,
  getSyncActionsData,
  getWorkspaceId,
} from './sync-actions.utils';

@Injectable()
export default class SyncActionsService {
  constructor(
    private prisma: PrismaService,
    private pagesService: PagesService,
    private taskHooksService: TaskHooksService,
    private activity: ActivityService,
  ) {}
  async upsertSyncAction(
    lsn: string,
    action: string,
    modelName: ModelNameEnum,
    modelId: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    changedData: any,
  ) {
    const workspaceId = await getWorkspaceId(this.prisma, modelName, modelId);
    const sequenceId = convertLsnToInt(lsn);
    const actionType = convertToActionType(action);

    // Check if sync action already exists
    const existingSyncAction = await this.prisma.syncAction.findFirst({
      where: {
        sequenceId,
      },
    });

    const syncActionData = await this.prisma.syncAction.upsert({
      where: {
        modelId_action: {
          modelId,
          action: actionType,
        },
      },
      update: {
        sequenceId,
        action: actionType,
      },
      create: {
        action: actionType,
        modelName,
        modelId,
        workspaceId,
        sequenceId,
      },
    });

    const modelData = await getModelData(this.prisma, modelName, modelId);

    // Only execute this block when creating for the first time
    if (!existingSyncAction) {
      await this.runHooks(modelId, modelName, action, changedData);
    }

    return {
      data: modelData,
      ...syncActionData,
    };
  }

  async runHooks(
    modelId: string,
    modelName: ModelNameEnum,
    action: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    changedData: any,
  ) {
    // this will create problem in scaling
    if (tableHooks.has(modelName)) {
      if (ModelNameEnum.Page === modelName) {
        this.pagesService.handleHooks({
          pageId: modelId,
          changedData,
          action: convertToActionTypeForUser(action),
        });
      }

      if (ModelNameEnum.Activity === modelName && action === 'insert') {
        this.activity.runActivity(modelId);
      }

      if (ModelNameEnum.List === modelName) {
        await tasks.trigger<typeof listActivityHandler>(
          'list-activity-handler',
          {
            listId: modelId,
            action: convertToActionTypeForUser(action),
          },
        );
      }

      if (ModelNameEnum.Task === modelName) {
        this.taskHooksService.executeHookWithId(
          modelId,
          convertToActionTypeForUser(action),
          changedData,
        );
      }
    }
  }

  async getBootstrap(modelNames: string, workspaceId: string) {
    let syncActions = await this.prisma.syncAction.findMany({
      where: {
        workspaceId,
        modelName: { in: modelNames.split(',') as ModelName[] },
      },
      orderBy: {
        sequenceId: 'asc',
      },
      distinct: ['modelId', 'modelName', 'workspaceId', 'action'],
    });

    const deleteModelIds = new Set(
      syncActions
        .filter((action: SyncAction) => action.action === 'D')
        .map((action: SyncAction) => action.modelId),
    );

    syncActions = syncActions.filter(
      (action: SyncAction) => !deleteModelIds.has(action.modelId),
    );

    return {
      syncActions: await getSyncActionsData(
        this.prisma,
        syncActions as SyncAction[],
      ),
      lastSequenceId: await getLastSequenceId(this.prisma, workspaceId),
    };
  }

  async getDelta(
    modelNames: string,
    lastSequenceId: bigint,
    workspaceId: string,
  ) {
    const syncActions = await this.prisma.syncAction.findMany({
      where: {
        workspaceId,
        sequenceId: { gt: lastSequenceId },
        modelName: { in: modelNames.split(',') as ModelName[] },
      },
      orderBy: {
        sequenceId: 'asc',
      },
      distinct: ['modelId', 'modelName', 'workspaceId', 'action'],
    });

    return {
      syncActions: await getSyncActionsData(
        this.prisma,
        syncActions as SyncAction[],
      ),
      lastSequenceId: await getLastSequenceId(this.prisma, workspaceId),
    };
  }
}
