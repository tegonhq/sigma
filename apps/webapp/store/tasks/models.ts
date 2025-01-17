import { types } from 'mobx-state-tree';

export const Task = types.model({
  id: types.string,
  createdAt: types.string,
  updatedAt: types.string,

  sourceId: types.union(types.null, types.string),
  completedAt: types.union(types.null, types.string),
  number: types.union(types.null, types.number),
  url: types.union(types.null, types.string),
  status: types.string,
  metadata: types.union(types.null, types.string),
  dueDate: types.union(types.null, types.string, types.undefined),

  integrationAccountId: types.union(types.null, types.string),
  pageId: types.union(types.null, types.string),
  workspaceId: types.string,
});
