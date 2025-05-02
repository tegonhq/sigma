export interface TaskExternalLinkType {
  id: string;
  createdAt: string;
  updatedAt: string;
  taskId: string;
  integrationAccountId: string;
  sourceId?: string;
  url?: string;
}
