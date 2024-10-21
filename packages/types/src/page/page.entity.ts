import { Label } from '../label';
import { Status } from '../status';
import { Workspace } from '../workspace';

export class Page {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deleted: Date | null;
  archived: Date | null;
  title: string | null;
  description: string | null;
  workspace?: Workspace;
  workspaceId: string;

  statusId?: string;
  status?: Status;

  labels?: Label[];
}
