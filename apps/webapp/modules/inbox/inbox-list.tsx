import { cn } from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';
import React from 'react';
import {
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache,
  type Index,
  type ListRowProps,
} from 'react-virtualized';

import { ScrollManagedList } from 'common/virtualized-list';

import { InboxItem } from './inbox-item';
import { useConversationRows } from './use-conversation-rows';

interface InboxListProps {
  currentConversation: string;
  setCurrentConversation: (id: string) => void;
}

export const InboxList = observer(
  ({ currentConversation, setCurrentConversation }: InboxListProps) => {
    const conversationRows = useConversationRows('all');

    const cache = new CellMeasurerCache({
      defaultHeight: 45, // Default row height
      fixedWidth: true, // Rows have fixed width but dynamic height
    });

    React.useEffect(() => {
      cache.clearAll();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conversationRows]);

    // useHotkeys(
    //   [Key.ArrowUp, Key.ArrowDown],
    //   (event) => {
    //     switch (event.key) {
    //       case Key.ArrowUp: {
    //         if (notifications.length === 0) {
    //           return;
    //         }

    //         const currentIndex = notifications.findIndex(
    //           (notification) => notification.id === currentConversation,
    //         );

    //         const newIndex =
    //           currentIndex <= 0 ? notifications.length - 1 : currentIndex - 1;
    //         setCurrentConversation(notifications[newIndex].id);
    //         return;
    //       }

    //       case Key.ArrowDown: {
    //         if (notifications.length === 0) {
    //           return;
    //         }

    //         const currentIndex = notifications.findIndex(
    //           (notification) => notification.id === currentConversation,
    //         );

    //         const newIndex =
    //           currentIndex === -1 || currentIndex === notifications.length - 1
    //             ? 0
    //             : currentIndex + 1;
    //         setCurrentConversation(notifications[newIndex].id);
    //       }
    //     }
    //   },
    //   {
    //     scopes: [SCOPES.INBOX],
    //   },
    // );

    const rowRender = ({ index, style, key, parent }: ListRowProps) => {
      const row = conversationRows[index];

      if (!row) {
        return null;
      }

      if (row.type === 'header') {
        return (
          <CellMeasurer
            key={key}
            cache={cache}
            columnIndex={0}
            parent={parent}
            rowIndex={index}
          >
            <div style={style} key={key}>
              <h3
                className={cn(
                  'text-sm text-muted-foreground px-4 mt-2',
                  index > 0 && 'mt-6',
                )}
              >
                {row.data}
              </h3>
            </div>
          </CellMeasurer>
        );
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
              conversationId={row.id}
              key={index}
              onSelect={(id: string) => setCurrentConversation(id)}
              selected={currentConversation === row.id}
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
        <AutoSizer className="h-full">
          {({ width, height }) => (
            <ScrollManagedList
              className="overflow-y-auto"
              listId="inbox-list"
              height={height}
              overscanRowCount={10}
              noRowsRenderer={() => (
                <div className="p-4 h-full flex flex-col items-center justify-start gap-3 mt-4"></div>
              )}
              rowCount={conversationRows.length + 2}
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
