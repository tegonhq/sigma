import { types } from 'mobx-state-tree';

export const Activity = types.model({
  id: types.string,
  createdAt: types.string,
  updatedAt: types.string,

  text: types.string,
  sourceId: types.union(types.undefined, types.null, types.string),
  sourceURL: types.union(types.undefined, types.null, types.string),
  taskId: types.union(types.undefined, types.null, types.string),
  integrationAccountId: types.union(types.undefined, types.null, types.string),

  workspaceId: types.string,
});
