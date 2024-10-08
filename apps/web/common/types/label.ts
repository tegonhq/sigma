export interface LabelType {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  color: string;
  description: string | null;
  workspaceId: string;
  groupId: string | null;
}
