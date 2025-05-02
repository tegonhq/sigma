import { type ColumnDef } from '@tanstack/react-table';
import * as React from 'react';

import type { ListTypeWithCount } from 'hooks/list';

import { ListProgress } from '../list-progress';
import { ListItem } from './list-item';

export const useListColumns = (): Array<ColumnDef<ListTypeWithCount>> => {
  return [
    {
      accessorKey: 'title',
      header: () => {
        return <span className="px-2">TITLE</span>;
      },
      cell: ({ row }) => {
        return <ListItem id={row.original.id} />;
      },
    },
    {
      accessorKey: 'progress',
      header: () => {
        return <span className="px-2">PROGRESS</span>;
      },
      cell: ({ row }) => (
        <div className="px-2">
          <ListProgress id={row.original.id} onlyGraph />
        </div>
      ),
    },
  ];
};
