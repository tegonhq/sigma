import { groupBy } from 'common/lib';

import { useContextStore } from 'store/global-context-provider';

export const useLists = () => {
  const { tasksStore, listsStore } = useContextStore();
  const groupedByList = groupBy(tasksStore.getTasks, 'listId');
  const lists = Object.keys(groupedByList);

  return listsStore.getListWithIds(lists);
};
