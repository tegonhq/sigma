import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  Button,
  DeleteLine,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  MoreLine,
  useToast,
} from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';
import React from 'react';

import type { ListType } from 'common/types';
import { Navigation } from 'layouts/app-layout';

import { useDeleteListMutation } from 'services/lists';

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
    <header className="flex h-[38px] shrink-0 items-center justify-between gap-2 border-border border-b">
      <div className="flex items-center gap-2 px-2">
        <Navigation />
        <Breadcrumb>
          <BreadcrumbList className="gap-1">
            <BreadcrumbItem>
              <BreadcrumbLink className="text-foreground">Lists</BreadcrumbLink>
            </BreadcrumbItem>
            {page && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbPage className="max-w-[500px] truncate">
                    {page.title}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
        {page && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
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
                  <span>Delete list</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      {deleteListDialog && (
        <DeleteListAlert
          open={deleteListDialog}
          setOpen={setDeleteListDialog}
          deleteList={deleteList}
        />
      )}
    </header>
  );
});
