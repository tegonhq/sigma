import { PageTypeEnum } from '@sigma/types';
import { generateHTML } from '@tiptap/core';
import { format } from 'date-fns';
import { generateKeyBetween } from 'fractional-indexing'; // Import the fractional-index package
import Fuse from 'fuse.js';
import { type IAnyStateTreeNode, types, flow } from 'mobx-state-tree';

import { extractTextFromHTML } from 'common/common-utils';
import { defaultExtensions } from 'common/editor';
import type { PageType } from 'common/types';

import { sigmaDatabase } from 'store/database';

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
      const pages = (yield sigmaDatabase.pages.toArray()).map(
        (page: PageType) => {
          try {
            if (!page.description) {
              return page;
            }

            return {
              ...page,
              description: extractTextFromHTML(
                generateHTML(JSON.parse(page.description), defaultExtensions),
              ),
            };
          } catch (e) {
            console.log(e);
            return page;
          }
        },
      );

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
    getPages() {
      const buildTree = (pages: PageType[]) => {
        const pageMap = new Map<string, PageType & { children: PageType[] }>();

        // Initialize the map with all pages
        pages.forEach((page) => {
          pageMap.set(page.id, { ...page, children: [] });
        });

        const tree: Array<PageType & { children: PageType[] }> = [];

        // Sort pages lexically by title before building the tree
        const sortedPages = [...pages].sort((a, b) =>
          a.sortOrder.localeCompare(b.sortOrder),
        );

        // Build the tree structure
        sortedPages.forEach((page) => {
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
    getDailyPageWithDateArray(dates: string[]) {
      return self.pages.filter(
        (page: PageType) => dates.includes(page.title) && page.type === 'Daily',
      );
    },
    get getSortOrderForNewPage() {
      const lastPage = self.pages[self.pages.length - 1];

      if (!lastPage) {
        return generateKeyBetween(null, null);
      }
      // Calculate the new sort order using fractional-index
      return generateKeyBetween(lastPage?.sortOrder, null);
    },
    searchPages(query: string) {
      const fuse = new Fuse(self.pages.toJSON(), {
        keys: [
          {
            name: 'title',
            weight: 1,
          },
          {
            name: 'description',
            weight: 10,
          },
        ], // Fields to search

        includeScore: true, // Optional: include match scores
        threshold: 0.6, // Lower threshold for stricter matches
        distance: 100, // Reduce distance to prioritize closer matches
        findAllMatches: true, // Include all potential matches
        useExtendedSearch: true, // Enable advanced search features
      });

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
  searchPages: (query: string) => PageType[];
}
