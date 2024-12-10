import { SyncActionTypeEnum, ModelName, SyncAction } from '@sigma/types';
import { PrismaService } from 'nestjs-prisma';

export function convertToActionType(action: string): SyncActionTypeEnum {
  switch (action.toLowerCase()) {
    case 'insert':
      return SyncActionTypeEnum.I;
    case 'update':
      return SyncActionTypeEnum.U;
    case 'delete':
      return SyncActionTypeEnum.D;
  }

  return null;
}

export function convertLsnToInt(lsn: string) {
  const [logFileNumber, byteOffset] = lsn.split('/');
  const hexString = logFileNumber + byteOffset;
  return parseInt(hexString, 16);
}

export async function getWorkspaceId(
  prisma: PrismaService,
  modelName: ModelName,
  modelId: string,
): Promise<string> {
  switch (modelName) {
    case ModelName.Workspace:
      return modelId;

    case ModelName.Page:
      const page = await prisma.page.findUnique({
        where: { id: modelId },
      });
      return page.workspaceId;

    case ModelName.Task:
      const task = await prisma.task.findUnique({
        where: { id: modelId },
      });
      return task.workspaceId;

    case ModelName.Activity:
      const activity = await prisma.activity.findUnique({
        where: { id: modelId },
      });
      return activity.workspaceId;

    case ModelName.Status:
      const status = await prisma.status.findUnique({
        where: { id: modelId },
      });
      return status.workspaceId;

    case ModelName.Template:
      const template = await prisma.template.findUnique({
        where: { id: modelId },
      });
      return template.workspaceId;

    case ModelName.IntegrationAccount:
      const integrationAccount = await prisma.integrationAccount.findUnique({
        where: { id: modelId },
      });
      return integrationAccount.workspaceId;

    default:
      return undefined;
  }
}

export async function getModelData(
  prisma: PrismaService,
  modelName: ModelName,
  modelId: string,
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const modelMap: Record<ModelName, any> = {
    Workspace: prisma.workspace,
    Template: prisma.template,
    Status: prisma.status,
    Page: prisma.page,
    Task: prisma.task,
    Activity: prisma.activity,
    IntegrationAccount: {
      findUnique: (args: { where: { id: string } }) =>
        prisma.integrationAccount.findUnique({
          ...args,
          select: {
            id: true,
            accountId: true,
            integratedById: true,
            createdAt: true,
            updatedAt: true,
            deleted: true,
            settings: true,
            workspaceId: true,
            integrationDefinitionId: true,
          },
        }),
    },
  };

  const model = modelMap[modelName];

  if (model) {
    return await model.findUnique({ where: { id: modelId } });
  }

  return undefined;
}

export async function getSyncActionsData(
  prisma: PrismaService,
  syncActionsData: SyncAction[],
) {
  const modelDataResults = await Promise.all(
    syncActionsData.map((actionData) =>
      getModelData(prisma, actionData.modelName, actionData.modelId),
    ),
  );

  return syncActionsData.reduce((result, actionData, index) => {
    const data = modelDataResults[index];
    if (data) {
      result.push({ data, ...actionData });
    }
    return result;
  }, []);
}

export async function getLastSequenceId(
  prisma: PrismaService,
  workspaceId: string,
): Promise<bigint> {
  const lastSyncAction = await prisma.syncAction.findFirst({
    where: {
      workspaceId,
    },
    orderBy: {
      sequenceId: 'desc',
    },
    distinct: ['modelName', 'workspaceId', 'modelId'],
  });

  return lastSyncAction.sequenceId;
}
