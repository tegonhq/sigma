import { types } from 'mobx-state-tree';

export const TaskExternalLink = types.model({
  id: types.string,
  createdAt: types.string,
  updatedAt: types.string,

  taskId: types.string,
  sourceId: types.union(types.string, types.null),
  url: types.union(types.string, types.null),
  integrationAccountId: types.string,
});

export const TaskExternalLinks = types.array(TaskExternalLink);
