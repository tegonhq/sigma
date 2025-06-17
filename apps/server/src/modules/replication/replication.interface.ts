import { ModelNameEnum } from '@redplanethq/sol-sdk';

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
  [ModelNameEnum.Activity, true],
  [ModelNameEnum.AgentWorklog, true],
  [ModelNameEnum.Automation, true],
  [ModelNameEnum.Command, true],
  [ModelNameEnum.Conversation, true],
  [ModelNameEnum.ConversationHistory, true],
  [ModelNameEnum.IntegrationAccount, true],
  [ModelNameEnum.List, true],
  [ModelNameEnum.Page, true],
  [ModelNameEnum.Task, true],
  [ModelNameEnum.TaskOccurrence, true],
  [ModelNameEnum.Workspace, true],
  [ModelNameEnum.Activity, true],
]);

export const tableHooks = new Map([
  [ModelNameEnum.Page, true],
  [ModelNameEnum.Task, true],
  [ModelNameEnum.List, true],
  [ModelNameEnum.Activity, true],
  [ModelNameEnum.TaskOccurrence, true],
  [ModelNameEnum.Command, true],
  [ModelNameEnum.Automation, true],
]);
