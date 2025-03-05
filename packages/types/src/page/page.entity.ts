import { JsonValue } from '../common';
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

export enum OutlinkEnum {
  Task = 'Task',
}

export const OutlinkType = {
  Task: 'Task',
};

export type OutlinkType = (typeof OutlinkType)[keyof typeof OutlinkType];
export interface Outlink {
  type: OutlinkType;
  id: string;
  position: {
    path: number[];
  };
  taskExtension: boolean;
}

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

  outlinks?: JsonValue;
  tags: string[];

  type: PageType;

  statusId?: string;
  status?: Status;

  workspaceId: string;
  workspace?: Workspace;
  task?: any[];
  conversation?: any[];
}
