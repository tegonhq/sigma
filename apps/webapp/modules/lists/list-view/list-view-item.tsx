import { cn } from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';
import React from 'react';

import { getIcon } from 'common/icon-picker';

import type { ListTypeWithCount } from 'hooks/list';

import { useContextStore } from 'store/global-context-provider';

interface ListItemProps {
  list: ListTypeWithCount;
  selected: boolean;
  onSelect: (id: string) => void;
}

export const ListItem = observer(
  ({ list, selected, onSelect }: ListItemProps) => {
    const { pagesStore } = useContextStore();
    const page = pagesStore.getPageWithId(list.pageId);

    return (
      <div
        className={cn(
          'mx-2 p-3 px-2 py-0 mb-0.5 flex gap-1 items-center hover:bg-grayAlpha-100 rounded',
          selected && 'bg-grayAlpha-200',
        )}
        onClick={() => {
          onSelect(list.id);
        }}
      >
        <div className={cn('flex flex-col gap-1 py-1.5 w-full')}>
          <div className="flex gap-2 w-full items-center">
            <div className="text-foreground text-right">
              {getIcon(list?.icon, 18)}
            </div>
            <div className={cn('w-[calc(100%_-_25px)]')}>
              <div className="truncate"> {page?.title} </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
);
