import { cn } from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';
import { useRouter } from 'next/router';
import React from 'react';
import ReactTimeAgo from 'react-time-ago';

import { type NotificationType } from 'common/types';

import { useContextStore } from 'store/global-context-provider';

interface InboxItemProps {
  notification: NotificationType;
  nextNotification: NotificationType | undefined;
}

function getNotificationText(): string {
  return 'New notification';
}

export const InboxItem = observer(
  ({ notification, nextNotification }: InboxItemProps) => {
    const { push } = useRouter();

    return (
      <div
        className={cn(
          'ml-4 p-3 py-0 mr-4 flex gap-1 items-center hover:bg-grayAlpha-200 rounded',
        )}
        onClick={() => {
          if (!notification.read) {
          }
        }}
      >
        <div
          className={cn(
            'flex flex-col gap-1 py-2 w-full',
            !false && 'border-b',
          )}
        >
          <div className="flex justify-between text-sm">
            <div
              className={cn(
                'w-[calc(100%_-_110px)]',
                notification.read ? 'text-muted-foreground' : 'text-foreground',
              )}
            >
              <div className="truncate">New Notification</div>
            </div>
            <div className="text-muted-foreground w-[70px] text-right"></div>
          </div>

          <div className="flex justify-between text-xs">
            <div className="flex gap-2 text-muted-foreground">
              {getNotificationText()}
            </div>

            <div className="text-muted-foreground">
              <ReactTimeAgo
                date={new Date(notification.updatedAt)}
                timeStyle="twitter"
              />
            </div>
          </div>
        </div>
      </div>
    );
  },
);
