import { cn } from '@redplanethq/ui';
import { Clock } from 'lucide-react';
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

import { ActivityItem } from './activity-item';
import { useActivities, type ActivityRow } from './use-activities';

export const ActivityList = observer(
  ({
    selected,
    setSelected,
  }: {
    selected: { type: string; id: string };
    setSelected: (selected: { type: string; id: string }) => void;
  }) => {
    const { rows: logs } = useActivities();

    const cache = new CellMeasurerCache({
      defaultHeight: 45, // Default row height
      fixedWidth: true, // Rows have fixed width but dynamic height
    });

    React.useEffect(() => {
      cache.clearAll();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [logs]);

    const goTo = (row: ActivityRow) => {
      setSelected({ type: row.data.rowType, id: row.data.id });
    };

    const rowRender = ({ index, style, key, parent }: ListRowProps) => {
      const row = logs[index];

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
              <h2
                className={cn(
                  'px-3 mx-2 text-muted-foreground',
                  index > 0 && 'mt-4',
                )}
              >
                {row.title}
              </h2>
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
            <ActivityItem
              activity={row}
              onSelect={() => goTo(row)}
              selected={selected?.id === row.data.id}
            />
          </div>
        </CellMeasurer>
      );
    };

    const rowHeight = ({ index }: Index) => {
      return cache.getHeight(index, 0);
    };

    return (
      <AutoSizer className="h-full mt-2">
        {({ width, height }) => (
          <ScrollManagedList
            className=""
            listId="inbox-list"
            height={height}
            overscanRowCount={10}
            noRowsRenderer={() => (
              <div className="p-4 h-full flex flex-col items-center justify-start gap-3 mt-4">
                <Clock size={30} />
                No logs
              </div>
            )}
            rowCount={logs.length + 2}
            rowHeight={rowHeight}
            deferredMeasurementCache={cache}
            rowRenderer={rowRender}
            width={width}
            shallowCompare
          />
        )}
      </AutoSizer>
    );
  },
);
