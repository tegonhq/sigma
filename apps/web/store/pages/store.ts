import {
  type IAnyStateTreeNode,
  type Instance,
  types,
  flow,
} from 'mobx-state-tree';

import type { PageType } from 'common/types';

import { sigmaDatabase } from 'store/database';

import { Page } from './models';

export const PagesStore: IAnyStateTreeNode = types
  .model({
    pages: types.array(Page),
    workspaceId: types.union(types.string, types.undefined),
  })
  .actions((self) => {
    const update = (page: PageType, id: string) => {
      const indexToUpdate = self.pages.findIndex((obj) => obj.id === id);

      if (indexToUpdate !== -1) {
        // Update the object at the found index with the new data
        self.pages[indexToUpdate] = {
          ...self.pages[indexToUpdate],
          ...page,
          // TODO fix the any and have a type with Issuetype
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any;
      } else {
        self.pages.push(page);
      }
    };
    const deleteById = (id: string) => {
      const indexToDelete = self.pages.findIndex((obj) => obj.id === id);

      if (indexToDelete !== -1) {
        self.pages.splice(indexToDelete, 1);
      }
    };

    const load = flow(function* () {
      const pages = yield sigmaDatabase.pages.toArray();

      self.pages = pages;
    });

    return { update, deleteById, load };
  })
  .views((self) => ({
    getPagesWithIds(ids: string[]) {
      return self.pages.filter((page: PageType) => ids.includes(page.id));
    },
    getPageWithId(id: string) {
      return self.pages.find((page: PageType) => page.id === id);
    },
  }));

export type PagesStoreType = Instance<typeof PagesStore> & {
  pages: PageType[];
  workspaceId: string;
};
