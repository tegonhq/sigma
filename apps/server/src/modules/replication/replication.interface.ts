import { ModelNameEnum } from '@sigma/types';

export interface logChangeType {
  kind: string;
  schema: string;
  table: string;
  columnnames: string[];
  columnvalues: string[];
  columntypes: string[];
  oldkeys: Record<string, string[]>;
}

export interface logType {
  change: logChangeType[];
}

export const tablesToSendMessagesFor = new Map([
  [ModelNameEnum.Workspace, true],
  [ModelNameEnum.IntegrationAccount, true],
  [ModelNameEnum.Page, true],
  [ModelNameEnum.Task, true],
  [ModelNameEnum.Conversation, true],
  [ModelNameEnum.ConversationHistory, true],
  [ModelNameEnum.List, true],
  [ModelNameEnum.TaskOccurrence, true],
]);

export const tableHooks = new Map([[ModelNameEnum.Page, true]]);
