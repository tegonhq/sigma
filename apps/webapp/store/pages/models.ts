import { types } from 'mobx-state-tree';

export const Page = types.model({
  id: types.string,
  createdAt: types.string,
  updatedAt: types.string,
  archived: types.union(types.null, types.string),

  title: types.union(types.null, types.string),
  description: types.union(types.null, types.string),
  sortOrder: types.string,

  parentId: types.union(types.null, types.string),
  workspaceId: types.string,
  tags: types.array(types.string),
  type: types.enumeration(['Default', 'Daily', 'List', 'Context']),
});
