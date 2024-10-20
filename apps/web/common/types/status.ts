export interface StatusType {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  position: number;
  description?: string;
  color: string;
  workspaceId: string;
}
