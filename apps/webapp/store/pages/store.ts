import { format } from 'date-fns';
import { sort } from 'fast-sort';
import { generateKeyBetween } from 'fractional-indexing'; // Import the fractional-index package
import Fuse from 'fuse.js';
import { type IAnyStateTreeNode, types, flow } from 'mobx-state-tree';

import type { PageType } from 'common/types';

import { solDatabase } from 'store/database';

import { Page } from './models';

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
      const pages = yield solDatabase.pages.toArray();

      // Sort pages lexically by title before building the tree
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sortedPages: any = [...pages].sort((a, b) =>
        a.sortOrder.localeCompare(b.sortOrder),
      );

      self.pages = sortedPages;
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
    getDailyPageWithDate(date: Date) {
      return self.pages.find(
        (page: PageType) =>
          page.title === format(date, 'dd-MM-yyyy') && page.type === 'Daily',
      );
    },
    getDailyPageWithDateArray(dates: string[]) {
      return self.pages.filter(
        (page: PageType) => dates.includes(page.title) && page.type === 'Daily',
      );
    },
    getContextPage() {
      return self.pages.find((page: PageType) => page.type === 'Context');
    },
    get getSortOrderForNewPage() {
      const lastPage = self.pages[self.pages.length - 1];

      if (!lastPage) {
        return generateKeyBetween(null, null);
      }
      // Calculate the new sort order using fractional-index
      return generateKeyBetween(lastPage?.sortOrder, null);
    },
    searchPages(query: string, strict?: boolean) {
      if (query === '') {
        return sort(self.pages.toJSON().filter((page) => page.type === 'List'))
          .desc((page) => page.updatedAt)
          .slice(0, 10);
      }

      const fuse = new Fuse(
        self.pages.toJSON().filter((page) => page.type !== 'Context'),
        {
          keys: [
            {
              name: 'title',
              weight: 1,
            },
          ], // Fields to search

          includeScore: true, // Optional: include match scores
          threshold: strict ? 0.3 : 0.9, // Lower threshold for stricter matches
          distance: 100, // Reduce distance to prioritize closer matches
          findAllMatches: true, // Include all potential matches
          useExtendedSearch: true, // Enable advanced search features
        },
      );

      if (!query.trim()) {
        return [];
      }
      const searchResults = fuse.search(query, { limit: 10 });

      return searchResults.map((result) => result.item);
    },
  }));

export interface PagesStoreType {
  pages: PageType[];
  workspaceId: string;
  getSortOrderForNewPage: string;

  update: (page: PageType, id: string) => Promise<void>;
  deleteById: (id: string) => Promise<void>;
  load: () => Promise<void>;

  // Functions
  getSortOrder: (firstPageId: string, secondPageId: string) => string;
  getDailyPageWithDate: (date: Date) => PageType | undefined;
  getDailyPageWithDateArray: (dates: string[]) => PageType[];
  getPageWithId: (id: string) => PageType | undefined;
  getPages: () => Array<{
    key: string;
    id: string;
    title: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    children?: any[];
    sortOrder?: string;
  }>;
  searchPages: (query: string, strict?: boolean) => PageType[];
  getContextPage: () => PageType;
}
