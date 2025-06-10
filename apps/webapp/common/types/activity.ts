export interface ActivityType {
  id: string;
  createdAt: string;
  updatedAt: string;

  text: string;
  sourceId?: string;
  sourceURL?: string;

  conversationId?: string;

  taskId?: string;
  workspaceId: string;
  integrationAccountId?: string;
}
