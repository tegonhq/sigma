import { JsonValue } from '../common';
import { User } from '../user/user.entity';
import { Workspace } from '../workspace/workspace.entity';

export class Template {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deleted: Date | null;
  name: string;

  templateData: JsonValue;
  createdBy?: User;
  createdById: string;
  workspace?: Workspace;
  workspaceId: string;
}
