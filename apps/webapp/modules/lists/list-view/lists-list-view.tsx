import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';
import React from 'react';

import { useApplication } from 'hooks/application';
import { useLists } from 'hooks/list';

import { TabViewType } from 'store/application';
import { useContextStore } from 'store/global-context-provider';

import { useListColumns } from './columns';

export const ListsList = observer(() => {
  const { listsStore } = useContextStore();
  const lists = useLists();

  const [data, setData] = React.useState(listsStore.lists);
  const { updateTabType } = useApplication();

  React.useEffect(() => {
    setData(lists);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lists.length]);

  const columns = useListColumns();
  const table = useReactTable({
    data,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    columns: columns as any,
    getCoreRowModel: getCoreRowModel(),
  });

  const goToList = (listId: string) => {
    updateTabType(0, TabViewType.LIST, { entityId: listId });
  };

  return (
    <div className="flex items-center w-full">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id} className="text-sm">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
                className="cursor-pointer"
                onClick={() => {
                  goToList(row.original.id);
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="w-[90%] py-0.5">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center"
              ></TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
});
