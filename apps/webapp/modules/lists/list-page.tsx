import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  ScrollArea,
} from '@redplanethq/ui';
import { observer } from 'mobx-react-lite';

import { PageTitle } from 'modules/tasks/single-task/single-task-title';

import { getIcon } from 'common/icon-picker';
import { IconPicker } from 'common/icon-picker/icon-picker';
import type { ListType } from 'common/types';

import { useUpdateListMutation } from 'services/lists';
import { useUpdatePageMutation } from 'services/pages';

import { useContextStore } from 'store/global-context-provider';

import { ListPageEditor } from './list-page-editor';
import { ListPageHeader } from './list-page-header';

interface ListPageProps {
  list: ListType;
}

export const ListPage = observer(({ list }: ListPageProps) => {
  const { pagesStore } = useContextStore();
  const page = pagesStore.getPageWithId(list?.pageId);
  const { mutate: updatePage } = useUpdatePageMutation({});
  const { mutate: updateList } = useUpdateListMutation({});

  const onChange = (title: string) => {
    updatePage({
      pageId: page?.id,
      title,
    });
  };

  const saveIcon = (data?: {
    color?: string;
    icon?: string;
    emoji?: string;
  }) => {
    if (data) {
      updateList({
        listId: list.id,
        icon: JSON.stringify(data),
      });
    } else {
      updateList({
        listId: list.id,
        icon: '',
      });
    }
  };

  const getIconComponent = () => {
    return (
      <Popover>
        <PopoverTrigger>
          <div className="relative">{getIcon(list?.icon, 24)}</div>
        </PopoverTrigger>
        <PopoverContent className="p-2">
          <IconPicker
            onSelectIcon={(icon, color) => saveIcon({ color, icon })}
            onSelectEmoji={(emoji) => saveIcon({ emoji })}
            onRemove={() => saveIcon()}
          />
        </PopoverContent>
      </Popover>
    );
  };

  return (
    <ScrollArea className="w-full h-full flex justify-center p-4 px-6 h-full">
      <div className="flex h-full justify-center w-full">
        <div className="grow flex flex-col gap-2 h-full max-w-[97ch]">
          <div className="flex gap-2 items-center">
            {getIconComponent()}
            <PageTitle value={page?.title} onChange={onChange} />
            <ListPageHeader list={list} />
          </div>

          <div className="flex flex-col gap-0">
            {page && <ListPageEditor page={page} list={list} />}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
});
