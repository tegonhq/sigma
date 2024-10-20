export interface PageType {
  id: string;
  createdAt: string;
  updatedAt: string;
  archived: string;
  title: string | null;
  description: string | null;
  sortOrder: string;
  workspaceId: string;
  parentId: string | null;
}
