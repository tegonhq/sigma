import { types } from 'mobx-state-tree';

export const Task = types.model({
  id: types.string,
  createdAt: types.string,
  updatedAt: types.string,

  completedAt: types.union(types.null, types.string),
  number: types.union(types.null, types.number),
  status: types.string,
  metadata: types.union(types.null, types.string),
  startTime: types.union(types.null, types.string, types.undefined),
  endTime: types.union(types.null, types.string, types.undefined),
  recurrence: types.array(types.string),
  scheduleText: types.union(types.string, types.null, types.undefined),
  dueDate: types.union(types.string, types.null, types.undefined),

  pageId: types.union(types.null, types.string),
  workspaceId: types.string,
  listId: types.union(types.null, types.string, types.undefined),
});
