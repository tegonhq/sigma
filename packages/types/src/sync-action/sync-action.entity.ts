import { Workspace } from '../workspace';

export enum ModelNameEnum {
  IntegrationAccount = 'IntegrationAccount',
  IntegrationDefinitionV2 = 'IntegrationDefinitionV2',
  User = 'User',
  Workspace = 'Workspace',
  Page = 'Page',
  Task = 'Task',
  Status = 'Status',
  Conversation = 'Conversation',
  ConversationHistory = 'ConversationHistory',
  List = 'List',
}

export const ModelName = {
  Template: 'Template',
  IntegrationAccount: 'IntegrationAccount',
  IntegrationDefinitionV2: 'IntegrationDefinitionV2',
  User: 'User',
  Workspace: 'Workspace',
  Status: 'Status',
  Page: 'Page',
  Task: 'Task',
  Conversation: 'Conversation',
  ConversationHistory: 'ConversationHistory',
  List: 'List',
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
