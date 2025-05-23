import { format, addDays, isTomorrow, isToday, isYesterday } from 'date-fns'; // For date formatting
import { Dot } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { Virtuoso } from 'react-virtuoso';

import { RightSideLayout } from 'layouts/right-side-layout';

import { DailySync } from './daily-sync';
import { DayEditor } from './day-editor';
import { Header } from './header';

const INITIAL_RANGE = 10; // Days to load initially
const LOAD_MORE_COUNT = 10; // Number of days to load when reaching edges

export const Days = observer(() => {
  const today = React.useMemo(() => new Date(), []);
  const [days, setDays] = React.useState(() => {
    // Initialize with today ±10
    return Array.from({ length: INITIAL_RANGE * 2 + 1 }, (_, i) =>
      addDays(today, i - INITIAL_RANGE),
    );
  });

  // Reference to the Virtuoso component
  const virtuosoRef = React.useRef(null);

  // Reference to the ScrollArea's scrollable element
  const scrollRef = React.useRef(null);

  // Add days at the beginning
  const prependDays = React.useCallback(() => {
    setDays((prev) => {
      const first = prev[0];
      const newDays = Array.from({ length: LOAD_MORE_COUNT }, (_, i) =>
        addDays(first, -(LOAD_MORE_COUNT - i)),
      );
      return [...newDays, ...prev];
    });
  }, []);

  // Add days at the end
  const appendDays = React.useCallback(() => {
    setDays((prev) => {
      const last = prev[prev.length - 1];
      const newDays = Array.from({ length: LOAD_MORE_COUNT }, (_, i) =>
        addDays(last, i + 1),
      );
      return [...prev, ...newDays];
    });
  }, []);

  // Helper function to get label for special days
  const getDayLabel = React.useCallback((date: Date) => {
    if (!date) {
      return '';
    }

    if (isToday(date)) {
      return 'Today';
    } else if (isTomorrow(date)) {
      return 'Tomorrow';
    } else if (isYesterday(date)) {
      return 'Yesterday';
    }

    return '';
  }, []);

  // Item content renderer
  const ItemRenderer = React.useCallback(
    (index: number) => {
      const date = days[index];
      const label = getDayLabel(date);
      return (
        <div className="flex w-full justify-center items-center mb-10">
          <div className="flex flex-col ml-2 max-w-[97ch] w-full justify-center">
            <h3 className="text-2xl mb-2 flex gap-1 font-medium items-center">
              {format(date, 'EE, MMM do, yyyy')}
              {label && (
                <span className="text-primary text-xl inline-flex items-center font-normal">
                  <Dot />

                  {label}
                </span>
              )}
              <DailySync date={format(date, 'dd-MM-yyyy')} />
            </h3>
            <div className="min-h-[400px]">
              <DayEditor date={date} onChange={() => {}} />
            </div>
          </div>
        </div>
      );
    },
    [days, getDayLabel],
  );

  // Initial scroll complete
  const [initialScrollDone, setInitialScrollDone] = React.useState(false);

  return (
    <RightSideLayout header={<Header />}>
      <div className="flex flex-col h-full justify-center w-full">
        <div className="grow h-full mt-2 px-3 overflow-auto" ref={scrollRef}>
          <Virtuoso
            ref={virtuosoRef}
            totalCount={days.length}
            itemContent={ItemRenderer}
            style={{ height: '100%' }}
            className="h-full"
            endReached={appendDays}
            overscan={LOAD_MORE_COUNT}
            customScrollParent={scrollRef.current}
            initialTopMostItemIndex={INITIAL_RANGE}
            rangeChanged={({ startIndex }) => console.log(startIndex)}
            atTopStateChange={(atTop) => {
              if (initialScrollDone && atTop) {
                prependDays();
              } else {
                setInitialScrollDone(true);
              }
            }}
          />
        </div>
      </div>
    </RightSideLayout>
  );
});
