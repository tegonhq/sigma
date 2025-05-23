export interface AutomationType {
  id: string;
  createdAt: string;
  updatedAt: string;

  mcps: string[];
  integrationAccountIds: string[];

  text: string;
  usedCount: number;
  workspaceId: string;
}
