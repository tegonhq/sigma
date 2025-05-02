import { types } from 'mobx-state-tree';

export const Notification = types.model({
  id: types.string,
  createdAt: types.string,
  updatedAt: types.string,
  type: types.string,
  read: types.boolean,

  modelName: types.string,
  modelId: types.string,

  workspaceId: types.string,
});
