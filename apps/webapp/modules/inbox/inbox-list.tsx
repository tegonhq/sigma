import { Inbox } from '@tegonhq/ui';
import { sort } from 'fast-sort';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import {
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache,
  type Index,
  type ListRowProps,
} from 'react-virtualized';
import { Key } from 'ts-key-enum';

import { SCOPES } from 'common/shortcut-scopes';
import type { NotificationType } from 'common/types';
import { ScrollManagedList } from 'common/virtualized-list';

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

    const cache = new CellMeasurerCache({
      defaultHeight: 45, // Default row height
      fixedWidth: true, // Rows have fixed width but dynamic height
    });

    React.useEffect(() => {
      cache.clearAll();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [notifications]);

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

    const rowRender = ({ index, style, key, parent }: ListRowProps) => {
      const row = notifications[index];

      if (!row) {
        return null;
      }

      return (
        <CellMeasurer
          key={key}
          cache={cache}
          columnIndex={0}
          parent={parent}
          rowIndex={index}
        >
          <div style={style} key={key}>
            <InboxItem
              notification={row}
              key={index}
              onSelect={(id: string) => setCurrentNotification(id)}
              selected={currentNotification === row.id}
              nextIsSelected={
                notifications[index + 1]
                  ? notifications[index + 1].id === currentNotification
                  : false
              }
            />
          </div>
        </CellMeasurer>
      );
    };

    const rowHeight = ({ index }: Index) => {
      return cache.getHeight(index, 0);
    };

    return (
      <>
        <AutoSizer className="h-full mt-2">
          {({ width, height }) => (
            <ScrollManagedList
              className=""
              listId="inbox-list"
              height={height}
              overscanRowCount={10}
              noRowsRenderer={() => (
                <div className="p-4 h-full flex flex-col items-center justify-start gap-3 mt-4">
                  <Inbox size={30} />
                  No notifications
                </div>
              )}
              rowCount={notifications.length + 2}
              rowHeight={rowHeight}
              deferredMeasurementCache={cache}
              rowRenderer={rowRender}
              width={width}
              shallowCompare
            />
          )}
        </AutoSizer>
      </>
    );
  },
);
