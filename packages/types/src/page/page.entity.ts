import { Status } from '../status';
import { Workspace } from '../workspace';

export enum PageTypeEnum {
  Default = 'Default',
  Daily = 'Daily',
}

export const PageType = {
  Default: 'Default',
  Daily: 'Daily',
};

export type PageType = (typeof PageType)[keyof typeof PageType];

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

  tags: string[];
  type: PageType;
}
