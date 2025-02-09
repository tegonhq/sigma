import { sort } from 'fast-sort';

import { groupBy } from 'common/lib';
import type { ListType } from 'common/types';

import { useContextStore } from 'store/global-context-provider';

export interface ListTypeWithCount extends ListType {
  count: number;
}

export const useLists = (): ListTypeWithCount[] => {
  const { tasksStore, listsStore } = useContextStore();
  const groupedByList = groupBy(tasksStore.getTasks({}), 'listId');

  const lists = listsStore
    .getListWithIds(Array.from(groupedByList.keys()) as string[])
    .map((list: ListType) => ({
      ...list,
      count: groupedByList.get(list.id).length,
    }));

  return sort(lists).desc((list) => list.count);
};
