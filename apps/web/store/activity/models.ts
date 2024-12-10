import { types } from 'mobx-state-tree';

export const Activity = types.model({
  id: types.string,
  createdAt: types.string,
  updatedAt: types.string,

  type: types.string,
  eventData: types.union(types.null, types.string),
  name: types.string,

  integrationAccountId: types.union(types.null, types.string),
  workspaceId: types.string,
});
