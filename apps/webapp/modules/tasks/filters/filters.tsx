import {
  Button,
  Command,
  CommandInput,
  Filter,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@redplanethq/ui';
import { observer } from 'mobx-react-lite';
import * as React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

import { SCOPES } from 'common/shortcut-scopes';

import { useApplication } from 'hooks/application';

import type { FilterTypeEnum } from 'store/application';

import { AppliedFiltersView } from './applied-filters-view';
import { ListFilter, StatusFilter } from '../metadata';
import { DefaultFilterDropdown } from './default-filter-dropdown';
import { ViewOptions } from './view-options';

const ContentMap = {
  status: StatusFilter,
  list: ListFilter,
};

export type KeyType = keyof typeof ContentMap;

export const Filters = observer(() => {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState('');
  const [filter, setFilter] = React.useState<KeyType>(undefined);
  const { deleteFilter, updateFilters } = useApplication();

  const onSelect = (value: string) => {
    setFilter(value as KeyType);
    setValue('');
  };

  const ContentComponent = filter ? ContentMap[filter] : ContentMap.status;

  const onChange = (value: string[] | number[], filterType: FilterTypeEnum) => {
    if (value.length === 0) {
      return deleteFilter(filter);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateFilters({ [filter]: { filterType, value } } as any);
  };

  const onPopoverChange = (value: boolean) => {
    if (!value) {
      setFilter(undefined);
      setValue('');
    }

    setOpen(value);
  };

  // Shortcuts
  useHotkeys(
    ['f'],
    () => {
      setOpen(true);
    },
    {
      scopes: [SCOPES.Tasks],
      preventDefault: true,
    },
  );

  return (
    <div className="flex justify-between px-3 pt-1">
      <Popover open={open} onOpenChange={onPopoverChange}>
        <div className="flex flex-wrap gap-1 items-center">
          <AppliedFiltersView />
          <PopoverTrigger asChild>
            <Button
              variant="secondary"
              isActive={open}
              onClick={() => setOpen(!open)}
            >
              <Filter size={16} className="mr-1" />
              Filter
            </Button>
          </PopoverTrigger>
        </div>
        <PopoverContent className="w-72 p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Filter..."
              autoFocus
              value={value}
              onInput={(e) => setValue(e.currentTarget.value)}
            />
            {filter ? (
              <ContentComponent
                onClose={() => {
                  setFilter(undefined);
                }}
                onChange={onChange}
              />
            ) : (
              <DefaultFilterDropdown onSelect={onSelect} />
            )}
          </Command>
        </PopoverContent>
      </Popover>
      <div className="flex gap-2 h-full">
        <ViewOptions />
      </div>
    </div>
  );
});
