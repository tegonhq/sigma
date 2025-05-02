export interface NotificationType {
  id: string;
  createdAt: string;
  updatedAt: string;

  type: string;
  read: boolean;

  modelName: string;
  modelId: string;

  workspaceId: string;
}
