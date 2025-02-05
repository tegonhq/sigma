import { type IAnyStateTreeNode, types, flow } from 'mobx-state-tree';

import type { ListType } from 'common/types';

import { sigmaDatabase } from 'store/database';

import { List } from './models';

export const ListsStore: IAnyStateTreeNode = types
  .model({
    lists: types.array(List),
    workspaceId: types.union(types.string, types.undefined),
  })
  .actions((self) => {
    const update = (list: ListType, id: string) => {
      const indexToUpdate = self.lists.findIndex((obj) => obj.id === id);

      if (indexToUpdate !== -1) {
        // Update the object at the found index with the new data
        self.lists[indexToUpdate] = {
          ...self.lists[indexToUpdate],
          ...list,
          // TODO fix the any and have a type with Issuetype
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any;
      } else {
        self.lists.push(list);
      }
    };
    const deleteById = (id: string) => {
      const indexToDelete = self.lists.findIndex((obj) => obj.id === id);

      if (indexToDelete !== -1) {
        self.lists.splice(indexToDelete, 1);
      }
    };

    const load = flow(function* () {
      const lists = yield sigmaDatabase.lists.toArray();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sortedLists: any = [...lists].sort((a, b) =>
        b.updatedAt.localeCompare(a.updatedAt),
      );

      self.lists = sortedLists;
    });

    return { update, deleteById, load };
  })
  .views((self) => ({
    get getLists() {
      return self.lists;
    },
    getListWithId(listsId: string) {
      return self.lists.find((list: ListType) => list.id === listsId);
    },
    getListWithIds(listsIds: string[]) {
      return self.lists.filter((list: ListType) => listsIds.includes(list.id));
    },
  }));

export interface ListsStoreType {
  lists: ListType[];
  workspaceId: string;

  update: (list: ListType, id: string) => Promise<void>;
  deleteById: (id: string) => Promise<void>;
  load: () => Promise<void>;

  getLists: ListType[];
  getListWithId: (listId: string) => ListType;
  getListWithIds: (listIds: string[]) => ListType[];
}
