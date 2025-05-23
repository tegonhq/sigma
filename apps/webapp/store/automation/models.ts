import { types } from 'mobx-state-tree';

export const Automation = types.model({
  id: types.string,
  createdAt: types.string,
  updatedAt: types.string,

  text: types.string,
  mcps: types.array(types.string),
  integrationAccountIds: types.array(types.string),
  usedCount: types.number,
  taskId: types.union(types.undefined, types.null, types.string),

  workspaceId: types.string,
});
