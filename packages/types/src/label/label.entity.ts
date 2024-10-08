import { Workspace } from '../workspace';

export class Label {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deleted: Date | null;
  name: string;
  color: string;
  description: string | null;
  workspace?: Workspace;
  workspaceId: string;
  group?: Label | null;
  groupId: string | null;
  labels?: Label[];
}
