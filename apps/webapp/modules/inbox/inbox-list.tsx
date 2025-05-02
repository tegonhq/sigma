import { ScrollArea } from '@tegonhq/ui';
import { sort } from 'fast-sort';
import { observer } from 'mobx-react-lite';
import { useHotkeys } from 'react-hotkeys-hook';
import { Key } from 'ts-key-enum';

import { SCOPES } from 'common/shortcut-scopes';
import type { NotificationType } from 'common/types';

import { useContextStore } from 'store/global-context-provider';

import { InboxItem } from './inbox-item';

interface InboxListProps {
  currentNotification: string;
  setCurrentNotification: (id: string) => void;
}

export const InboxList = observer(
  ({ currentNotification, setCurrentNotification }: InboxListProps) => {
    const { notificationsStore } = useContextStore();
    const notifications = sort(notificationsStore.getNotifications).desc(
      (notification: NotificationType) => new Date(notification.createdAt),
    ) as NotificationType[];

    useHotkeys(
      [Key.ArrowUp, Key.ArrowDown],
      (event) => {
        switch (event.key) {
          case Key.ArrowUp: {
            if (notifications.length === 0) {
              return;
            }

            const currentIndex = notifications.findIndex(
              (notification) => notification.id === currentNotification,
            );

            const newIndex =
              currentIndex <= 0 ? notifications.length - 1 : currentIndex - 1;
            setCurrentNotification(notifications[newIndex].id);
            return;
          }

          case Key.ArrowDown: {
            if (notifications.length === 0) {
              return;
            }

            const currentIndex = notifications.findIndex(
              (notification) => notification.id === currentNotification,
            );

            const newIndex =
              currentIndex === -1 || currentIndex === notifications.length - 1
                ? 0
                : currentIndex + 1;
            setCurrentNotification(notifications[newIndex].id);
          }
        }
      },
      {
        scopes: [SCOPES.INBOX],
      },
    );

    return (
      <ScrollArea>
        <div className="flex flex-col pt-2">
          {notifications.map(
            (notification: NotificationType, index: number) => (
              <InboxItem
                notification={notification}
                key={index}
                onSelect={(id: string) => setCurrentNotification(id)}
                selected={currentNotification === notification.id}
                nextIsSelected={
                  notifications[index + 1]
                    ? notifications[index + 1].id === currentNotification
                    : false
                }
              />
            ),
          )}
        </div>
      </ScrollArea>
    );
  },
);
