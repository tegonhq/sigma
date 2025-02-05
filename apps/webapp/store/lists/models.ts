import { types } from 'mobx-state-tree';

export const List = types.model({
  id: types.string,
  createdAt: types.string,
  updatedAt: types.string,

  name: types.string,
});
