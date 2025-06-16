import type { UserType } from '@sol/types';

export interface ConversationType {
  id: string;
  createdAt: string;
  updatedAt: string;

  title: string;
  userId: string;
  workspaceId: string;

  pageId?: string;
  taskId?: string;

  unread: boolean;
}

export interface ConversationHistoryType {
  id: string;
  createdAt: string;
  updatedAt: string;

  activityId?: string;
  message: string;
  userType: UserType;
  context: string;
  thoughts: string;
  userId?: string;
  conversationId: string;
}
