import { Project } from '@tegonhq/ui';
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

import { useApplication } from 'hooks/application';
import { useLists } from 'hooks/list';

import { TabViewType } from 'store/application';

import { ListItem } from './list-view-item';

export const ListsList = observer(({ selected }: { selected: string }) => {
  const lists = useLists();

  const cache = new CellMeasurerCache({
    defaultHeight: 45, // Default row height
    fixedWidth: true, // Rows have fixed width but dynamic height
  });

  const { changeActiveTab } = useApplication();

  React.useEffect(() => {
    cache.clearAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lists]);

  const goToList = (listId: string) => {
    changeActiveTab(TabViewType.LIST, { entityId: listId });
  };

  const rowRender = ({ index, style, key, parent }: ListRowProps) => {
    const row = lists[index];

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
          <ListItem
            list={row}
            onSelect={(id: string) => goToList(id)}
            selected={selected === row.id}
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
              <Project size={30} />
              No lists
            </div>
          )}
          rowCount={lists.length + 2}
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
