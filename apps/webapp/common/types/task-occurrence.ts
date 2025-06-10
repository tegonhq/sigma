export interface TaskOccurrenceType {
  id: string;
  createdAt: string;
  updatedAt: string;
  startTime?: string;
  endTime?: string;
  status?: string;
  workspaceId: string;
  taskId: string;
}
