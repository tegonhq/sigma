import { ConversationHistory } from '../conversation-history';

export enum ActionStatusEnum {
  ACCEPT = 'ACCEPT',
  DECLINE = 'DECLINE',
  QUESTION = 'QUESTION',
  TOOL_REQUEST = 'TOOL_REQUEST',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

export const ActionStatus = {
  ACCEPT: 'ACCEPT',
  DECLINE: 'DECLINE',
  QUESTION: 'QUESTION',
  TOOL_REQUEST: 'TOOL_REQUEST',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
};

export type ActionStatus = (typeof ActionStatus)[keyof typeof ActionStatus];

export class ConversationExecutionStep {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deleted: Date | null;

  conversationHistory?: ConversationHistory | null;
  conversationHistoryId: string;

  thought: string;
  message: string;

  actionInput: string;
  actionOutput: string;
  actionId: string;
  actionStatus: ActionStatus;

  metadata: Record<string, any>;
}
