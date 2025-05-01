import { ScrollArea } from '@tegonhq/ui';
import { sort } from 'fast-sort';
import { observer } from 'mobx-react-lite';

import type { NotificationType } from 'common/types';

import { useContextStore } from 'store/global-context-provider';

import { InboxItem } from './inbox-item';

export const InboxList = observer(() => {
  const { notificationsStore } = useContextStore();
  const notifications = sort(notificationsStore.getNotifications).desc(
    (notification: NotificationType) => new Date(notification.createdAt),
  ) as NotificationType[];

  console.log(notifications);

  return (
    <ScrollArea>
      <div className="flex flex-col pt-2">
        {notifications.map((notification: NotificationType, index: number) => (
          <InboxItem
            notification={notification}
            key={notification.id}
            nextNotification={notifications[index + 1]}
          />
        ))}
      </div>
    </ScrollArea>
  );
});
