import { types } from 'mobx-state-tree';

export const List = types.model({
  id: types.string,
  createdAt: types.string,
  updatedAt: types.string,

  pageId: types.string,
  icon: types.union(types.undefined, types.null, types.string),

  // v2
  favourite: types.union(types.undefined, types.boolean),
});
