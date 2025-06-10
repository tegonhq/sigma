import { types } from 'mobx-state-tree';

export const TaskOccurrence = types.model({
  id: types.string,
  createdAt: types.string,
  updatedAt: types.string,

  startTime: types.union(types.null, types.string),
  endTime: types.union(types.null, types.string),
  status: types.union(types.null, types.string),

  taskId: types.string,
  workspaceId: types.string,
});

export const TaskOccurrenceArray = types.array(TaskOccurrence);
