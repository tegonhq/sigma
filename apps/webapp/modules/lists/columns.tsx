import { type ColumnDef } from '@tanstack/react-table';
import * as React from 'react';

import { getIcon } from 'common/icon-picker';

import type { ListTypeWithCount } from 'hooks/list';

import { useContextStore } from 'store/global-context-provider';

import { ListProgress } from './list-progress';

export const useListColumns = (): Array<ColumnDef<ListTypeWithCount>> => {
  const { pagesStore } = useContextStore();

  return [
    {
      accessorKey: 'title',
      header: () => {
        return <span className="px-2">Title</span>;
      },
      cell: ({ row }) => {
        const page = pagesStore.getPageWithId(row.original.pageId);

        return (
          <div className="capitalize pl-2 py-2 flex items-center gap-2">
            {getIcon(row.original?.icon, 18)}
            {page?.title}
          </div>
        );
      },
    },
    {
      accessorKey: 'progress',
      header: () => {
        return <span className="px-2">Progress</span>;
      },
      cell: ({ row }) => (
        <div className="px-2">
          <ListProgress id={row.original.id} onlyGraph />
        </div>
      ),
    },
  ];
};
