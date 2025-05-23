import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  Button,
  CreateIssueLine,
} from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';
import React from 'react';

import {
  useDeleteNotificationMutation,
  useDeleteNotificationsMutation,
} from 'services/notifications';

import {
  DeleteAllNotificationTaskAlert,
  DeleteNotificationTaskAlert,
} from './delete-notification-alert';

interface HeaderProps {
  actions?: React.ReactNode;
  conversationId?: string;
  newConversation: () => void;
}

export const Header = observer(({ newConversation }: HeaderProps) => {
  const [deleteAlert, setDeleteAlert] = React.useState(false);
  const [deleteReadAlert, setDeleteReadAlert] = React.useState(false);
  const { mutate: deleteNotification } = useDeleteNotificationMutation({});
  const { mutate: deleteNotifications } = useDeleteNotificationsMutation({});

  // useHotkeys(
  //   Key.Backspace,
  //   () => {
  //     setDeleteAlert(true);
  //   },
  //   {
  //     scopes: [SCOPES.INBOX],
  //     enabled: !!conversationId,
  //     preventDefault: true,
  //   },
  // );

  return (
    <header className="flex h-[38px] shrink-0 items-center justify-between gap-2 border-border border-b">
      <div className="flex items-center gap-2 px-4">
        <Breadcrumb>
          <BreadcrumbList className="gap-1">
            <BreadcrumbItem>
              <BreadcrumbPage>Assistant</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* <DropdownMenu>
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
        </DropdownMenu> */}
      </div>

      <div className="pr-2 flex gap-2">
        <Button variant="secondary" size="sm" onClick={newConversation}>
          <CreateIssueLine />
        </Button>
      </div>

      <DeleteNotificationTaskAlert
        deleteTask={() => deleteNotification('asd')}
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
