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
  descriptionBinary: Buffer | null;

  sortOrder: string;
  parentId: string | null;
  parent?: Page | null;
  children?: Page[];

  tags: string[];

  type: PageType;

  statusId?: string;
  status?: Status;

  workspaceId: string;
  workspace?: Workspace;
  task?: any[];
  conversation?: any[];
}
