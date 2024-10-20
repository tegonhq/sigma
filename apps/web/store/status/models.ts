import { types } from 'mobx-state-tree';

export const Status = types.model({
  id: types.string,
  createdAt: types.string,
  updatedAt: types.string,
  name: types.string,
  description: types.union(types.string, types.null),
  position: types.number,
  color: types.string,
  workspaceId: types.string,
});

export const modelName = 'Status';
