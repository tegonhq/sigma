import { Button, ChevronDown, ChevronRight, cn, TodoLine } from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';
import React from 'react';
import {
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache,
  type Index,
  type ListRowProps,
} from 'react-virtualized';

import { statuses } from 'modules/tasks/status-dropdown';
import {
  getStatusColor,
  getStatusIcon,
} from 'modules/tasks/status-dropdown/status-utils';
import { TaskListItem } from 'modules/tasks/task-item';
import { useFilterTasks } from 'modules/tasks/utils';

import { ScrollManagedList } from 'common/virtualized-list';

import { useList } from 'hooks/list';

import { useContextStore } from 'store/global-context-provider';

import { useTaskRows } from './utils';

export const StatusList = observer(() => {
  const { tasksStore } = useContextStore();
  const list = useList();
  const tasks = tasksStore.getTasks({ listId: list?.id });
  const [collapsedHeaders, setCollapsedHeaders] = React.useState<
    Record<string, boolean>
  >({});

  const filteredIssues = useFilterTasks(tasks);

  const rows = useTaskRows(filteredIssues, collapsedHeaders);

  // Create a CellMeasurerCache instance
  const cache = new CellMeasurerCache({
    defaultHeight: 45, // Default row height
    fixedWidth: true, // Rows have fixed width but dynamic height
  });

  React.useEffect(() => {
    cache.clearAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows]);

  const toggleHeaderCollapse = (status: string) => {
    setCollapsedHeaders((prev) => ({
      ...prev,
      [status]: !prev[status],
    }));
    cache.clearAll();
  };

  const getHeaderRow = (
    row: { type: string; key: string; count: number },
    index: number,
  ) => {
    if (!row) {
      return null;
    }

    const status = statuses.find((status) => status.includes(row.key));
    const CategoryIcon = status ? getStatusIcon(status) : TodoLine;

    return (
      <div className="flex gap-1 items-end ml-4 my-1">
        <Button
          className={cn(
            'flex items-center w-fit rounded-2xl text-accent-foreground cursor-default group',
            index !== 0 && 'mt-1',
          )}
          size="lg"
          style={{ backgroundColor: getStatusColor(status).background }}
          variant="ghost"
          onClick={() => toggleHeaderCollapse(status)}
        >
          <CategoryIcon size={20} className="h-5 w-5 group-hover:hidden" />
          <div className="hidden group-hover:block">
            {!collapsedHeaders[status] ? (
              <ChevronDown size={20} />
            ) : (
              <ChevronRight size={20} />
            )}
          </div>
          <h3 className="pl-2">{status}</h3>
        </Button>
        <div className="rounded-2xl bg-grayAlpha-100 p-1.5 px-2 font-mono">
          {row.count}
        </div>
      </div>
    );
  };

  const rowRender = ({ index, style, key, parent }: ListRowProps) => {
    const row = rows[index];

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
          {row.type === 'header' ? (
            getHeaderRow(row, index)
          ) : (
            <TaskListItem taskId={row.taskId} key={key} />
          )}
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
          listId="status-list"
          height={height}
          overscanRowCount={10}
          noRowsRenderer={() => <></>}
          rowCount={rows.length + 2}
          rowHeight={rowHeight}
          deferredMeasurementCache={cache}
          rowRenderer={rowRender}
          width={width}
          shallowCompare
        />
      )}
    </AutoSizer>
  );
});
