import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  Button,
  DeleteLine,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  MoreLine,
} from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { Key } from 'ts-key-enum';

import { SCOPES } from 'common/shortcut-scopes';
import { Navigation } from 'layouts/app-layout';

import {
  useDeleteNotificationMutation,
  useDeleteNotificationsMutation,
} from 'services/notifications';

import {
  DeleteAllNotificationTaskAlert,
  DeleteNotificationTaskAlert,
} from './delete-notification-alert';
import { Shortcut } from 'common/shortcut';

interface HeaderProps {
  actions?: React.ReactNode;
  notificationId?: string;
}

export const Header = observer(({ notificationId }: HeaderProps) => {
  const [deleteAlert, setDeleteAlert] = React.useState(false);
  const [deleteReadAlert, setDeleteReadAlert] = React.useState(false);
  const { mutate: deleteNotification } = useDeleteNotificationMutation({});
  const { mutate: deleteNotifications } = useDeleteNotificationsMutation({});

  useHotkeys(
    Key.Backspace,
    () => {
      setDeleteAlert(true);
    },
    {
      scopes: [SCOPES.INBOX],
      enabled: !!notificationId,
      preventDefault: true,
    },
  );

  return (
    <header className="flex h-[38px] shrink-0 items-center justify-between gap-2 border-border border-b">
      <div className="flex items-center gap-2 px-2">
        <Navigation />
        <Breadcrumb>
          <BreadcrumbList className="gap-1">
            <BreadcrumbItem>
              <BreadcrumbPage>Inbox</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="xs"
              onClick={(e) => {
                e.preventDefault();
              }}
            >
              <MoreLine size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => setDeleteReadAlert(true)}>
              <div className="flex gap-2 items-center mr-2">
                <DeleteLine size={16} />
                <span>Delete all read</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="pr-2">
        {notificationId && (
          <Button
            variant="secondary"
            onClick={() => setDeleteAlert(true)}
            className="gap-1 items-center"
          >
            <Shortcut shortcut="⌫" className="top-[1px] relative" />
            Delete notification
          </Button>
        )}
      </div>

      <DeleteNotificationTaskAlert
        deleteTask={() => deleteNotification(notificationId)}
        open={deleteAlert}
        setOpen={setDeleteAlert}
      />

      <DeleteAllNotificationTaskAlert
        deleteTask={() => deleteNotifications()}
        open={deleteReadAlert}
        setOpen={setDeleteReadAlert}
      />
    </header>
  );
});
