export class Status {
  id: string;
  createdAt: Date;
  updatedAt: Date;

  name: string;
  description: string;
  position: number;
  color: string;

  workspaceId?: string;
}
