import { sort } from 'fast-sort';

import { groupBy } from 'common/lib';
import type { ListType, TaskType } from 'common/types';

import { useContextStore } from 'store/global-context-provider';

export interface ListTypeWithCount extends ListType {
  count: number;
  name?: string;
}

export const useLists = (): ListTypeWithCount[] => {
  const { tasksStore, listsStore, pagesStore } = useContextStore();
  const groupedByList = groupBy(tasksStore.getTasks({}), 'listId');

  const lists = listsStore.lists.map((list: ListType) => ({
    ...list,
    count:
      groupedByList
        .get(list.id)
        ?.filter((task: TaskType) => task.status === 'Todo').length ?? 0,
    name: pagesStore.getPageWithId(list.pageId)?.title,
  }));

  return sort(lists).desc((list) => list.count);
};
