export interface ActivityType {
  id: string;
  createdAt: string;
  updatedAt: string;
  type: string | null;
  eventData: string | null;
  name: string;
  workspaceId: string;
  integrationAccountId: string | null;
}
