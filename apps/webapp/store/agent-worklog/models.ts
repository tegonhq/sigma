import { types } from 'mobx-state-tree';

export const AgentWorklog = types.model({
  id: types.string,
  createdAt: types.string,
  updatedAt: types.string,

  modelName: types.string,
  modelId: types.string,
  state: types.string,
  type: types.string,
  workspaceId: types.string,
});
