import { Workspace } from '../workspace';

export enum ModelNameEnum {
  Activity = 'Activity',
  AgentWorklog = 'AgentWorklog',
  Automation = 'Automation',
  Conversation = 'Conversation',
  ConversationHistory = 'ConversationHistory',
  IntegrationAccount = 'IntegrationAccount',
  IntegrationDefinitionV2 = 'IntegrationDefinitionV2',
  List = 'List',
  Page = 'Page',
  Task = 'Task',
  TaskOccurrence = 'TaskOccurrence',
  User = 'User',
  Workspace = 'Workspace',
}

export const ModelName = {
  Activity: 'Activity',
  AgentWorklog: 'AgentWorklog',
  Automation: 'Automation',
  Conversation: 'Conversation',
  ConversationHistory: 'ConversationHistory',
  IntegrationAccount: 'IntegrationAccount',
  IntegrationDefinitionV2: 'IntegrationDefinitionV2',
  List: 'List',
  Page: 'Page',
  Task: 'Task',
  TaskOccurrence: 'TaskOccurrence',
  Template: 'Template',
  User: 'User',
  Workspace: 'Workspace',
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
