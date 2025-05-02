export class Activity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deleted: Date | null;

  title: string;
  sourceId?: string;
  sourceURL?: string;
  taskId?: string;

  workspaceId: string;
  integrationAccountId?: string;
}
