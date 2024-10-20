import { Workspace } from '../workspace';

export enum ModelNameEnum {
  IntegrationAccount = 'IntegrationAccount',
  IntegrationDefinitionV2 = 'IntegrationDefinitionV2',
  Label = 'Label',
  User = 'User',
  Workspace = 'Workspace',
  Page = 'Page',
  Status = 'Status',
}

export const ModelName = {
  Template: 'Template',
  IntegrationAccount: 'IntegrationAccount',
  IntegrationDefinitionV2: 'IntegrationDefinitionV2',
  Label: 'Label',
  User: 'User',
  Workspace: 'Workspace',
  Status: 'Status',
  Page: 'Page',
};

export type ModelName = (typeof ModelName)[keyof typeof ModelName];

export enum SyncActionTypeEnum {
  I = 'I',
  U = 'U',
  D = 'D',
}

export const SyncActionType = {
  I: 'I',
  U: 'U',
  D: 'D',
};

export type SyncActionType =
  (typeof SyncActionType)[keyof typeof SyncActionType];

export interface ReplicationPayload {
  action: string;
  modelId: string;
  modelName: string;
  isDeleted: boolean;
  actionApiKey: string;
}

export class SyncAction {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deleted: Date | null;

  modelName: ModelName;
  modelId: string;

  action: SyncActionType;
  sequenceId: bigint;
  workspace?: Workspace;
  workspaceId: string;
}
