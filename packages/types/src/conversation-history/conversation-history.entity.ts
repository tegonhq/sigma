import { JsonValue } from '../common';
import { Conversation } from '../conversation';

export enum UserTypeEnum {
  Agent = 'Agent',
  User = 'User',
}

export const UserType = {
  Agent: 'Agent',
  User: 'User',
};

export type UserType = (typeof UserType)[keyof typeof UserType];

export class ConversationHistory {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deleted: Date | null;

  message: string;
  userType: UserType;

  files?: JsonValue | null;
  thoughts: JsonValue;
  userId?: string | null;

  conversation?: Conversation;
  conversationId: string;
}
