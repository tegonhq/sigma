import {
  Button,
  DeleteLine,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  MoreLine,
  useToast,
} from '@redplanethq/ui';
import { observer } from 'mobx-react-lite';
import React from 'react';

import type { ListType } from 'common/types';

import { useDeleteListMutation, useUpdateListMutation } from 'services/lists';

import { useContextStore } from 'store/global-context-provider';

import { DeleteListAlert } from './delete-list-alert';

interface ListPageHeaderProps {
  list?: ListType;
}

export const ListPageHeader = observer(({ list }: ListPageHeaderProps) => {
  const { pagesStore } = useContextStore();
  const page = pagesStore.getPageWithId(list?.pageId);
  const [deleteListDialog, setDeleteListDialog] = React.useState(false);
  const { mutate: deleteListAPI } = useDeleteListMutation({});
  const { toast } = useToast();

  const deleteList = () => {
    deleteListAPI(
      {
        listId: list.id,
      },
      {
        onError: (error) => {
          try {
            toast({
              title: 'Error',
              description: error.response.data.message,
            });
          } catch (e) {
            toast({
              title: 'Error',
              description: 'Something went wrong',
            });
          }
        },
      },
    );
  };

  return (
    <div className="flex items-center gap-2">
      {page && (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                onClick={(e) => {
                  e.preventDefault();
                }}
              >
                <MoreLine size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => setDeleteListDialog(true)}>
                <div className="flex gap-2 items-center mr-2">
                  <DeleteLine size={16} />
                  <span>Delete</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}
      {deleteListDialog && (
        <DeleteListAlert
          open={deleteListDialog}
          setOpen={setDeleteListDialog}
          deleteList={deleteList}
        />
      )}
    </div>
  );
});
