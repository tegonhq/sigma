import { observer } from 'mobx-react-lite';

import { getIcon } from 'common/icon-picker';

import { useUpdateListMutation } from 'services/lists';

import { useContextStore } from 'store/global-context-provider';

import { FavouriteButton } from './favourite-button';

export const ListItem = observer(({ id }: { id: string }) => {
  const { listsStore, pagesStore } = useContextStore();
  const list = listsStore.getListWithId(id);
  const page = pagesStore.getPageWithId(list?.pageId);
  const { mutate: updateList } = useUpdateListMutation({});

  if (!list || !page) {
    return null;
  }

  return (
    <div className="capitalize pl-2 py-2 flex items-center gap-2">
      <div className="p-1 bg-grayAlpha-100 rounded">
        {getIcon(list?.icon, 18)}
      </div>

      {page?.title}

      <FavouriteButton
        onChange={(favourite) => {
          updateList({
            listId: list.id,
            favourite,
          });
        }}
        favourite={list.favourite}
      />
    </div>
  );
});
