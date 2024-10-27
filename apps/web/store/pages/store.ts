import { type IAnyStateTreeNode, types, flow } from 'mobx-state-tree';

import type { PageType } from 'common/types';

import { sigmaDatabase } from 'store/database';

import { Page } from './models';

import fractionalIndex from 'fractional-index'; // Import the fractional-index package
import { format } from 'date-fns';
import { PageTypeEnum } from '@sigma/types';

export const PagesStore: IAnyStateTreeNode = types
  .model({
    pages: types.array(Page),
    workspaceId: types.union(types.string, types.undefined),
    table: 'pages',
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

    const getSortOrder = (
      firstPageId: string | null,
      nextPageId: string | null,
    ) => {
      const firstPage = firstPageId
        ? self.pages.find((page) => page.id === firstPageId)
        : null;
      const nextPage = nextPageId
        ? self.pages.find((page) => page.id === nextPageId)
        : null;

      if (!nextPage && !firstPage) {
        return 'a';
      }
      // Calculate the new sort order using fractional-index
      return fractionalIndex(firstPage?.sortOrder, nextPage?.sortOrder);
    };

    const getSortOrderForNewPage = () => {
      const lastPage = self.pages[self.pages.length - 1];

      if (!lastPage) {
        return 'a';
      }
      // Calculate the new sort order using fractional-index
      return fractionalIndex(lastPage?.sortOrder, null);
    };

    return { update, deleteById, load, getSortOrder, getSortOrderForNewPage };
  })
  .views((self) => ({
    getPages() {
      const buildTree = (pages: PageType[]) => {
        const pageMap = new Map<string, PageType & { children: PageType[] }>();

        // Initialize the map with all pages
        pages.forEach((page) => {
          pageMap.set(page.id, { ...page, children: [] });
        });

        const tree: Array<PageType & { children: PageType[] }> = [];

        // Build the tree structure
        pages.forEach((page) => {
          if (page.type !== PageTypeEnum.Daily) {
            if (page.parentId) {
              const parent = pageMap.get(page.parentId);
              if (parent) {
                parent.children.push(pageMap.get(page.id)!);
              }
            } else {
              tree.push(pageMap.get(page.id)!);
            }
          }
        });

        return tree;
      };

      return buildTree(self.pages);
    },
    getPagesWithIds(ids: string[]) {
      return self.pages.filter((page: PageType) => ids.includes(page.id));
    },
    getPageWithId(id: string) {
      return self.pages.find((page: PageType) => page.id === id);
    },
    getDailyPageWithDate(date: Date) {
      return self.pages.find(
        (page: PageType) =>
          page.title === format(date, 'dd-MM-yyyy') && page.type === 'Daily',
      );
    },
    get getSortOrderForNewPage() {
      const lastPage = self.pages[self.pages.length - 1];

      if (!lastPage) {
        return 'a';
      }
      // Calculate the new sort order using fractional-index
      return fractionalIndex(lastPage?.sortOrder, null);
    },
  }));

export type PagesStoreType = {
  pages: PageType[];
  workspaceId: string;
  getSortOrderForNewPage: string;

  update: (page: PageType, id: string) => Promise<void>;
  deleteById: (id: string) => Promise<void>;
  load: () => Promise<void>;

  // Functions
  getSortOrder: (firstPageId: string, secondPageId: string) => string;
  getDailyPageWithDate: (date: Date) => PageType | undefined;
  getPageWithId: (id: string) => PageType | undefined;
  getPages: () => Array<{
    key: string;
    title: string;
    children?: any[];
  }>;
};
