import { Close, Button, Separator } from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';

import { useApplication } from 'hooks/application';

import type { FiltersModelType, FilterTypeEnum } from 'store/application';

import { FilterOptionsDropdown } from './filter-options-dropdown';

interface FilterItemViewProps {
  name: string;
  filterKey: keyof FiltersModelType;
  filter: {
    value: string[] | boolean;
    filterType: FilterTypeEnum;
  };
  isArray?: boolean;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Component: React.ComponentType<any>;
}

export const FilterItemView = observer(
  ({
    name,
    filterKey,
    isArray = false,
    Component,
    filter,
  }: FilterItemViewProps) => {
    const { filters, deleteFilter, updateFilters } = useApplication();

    const onChange = (value: string | string[]) => {
      if (value.length === 0) {
        return deleteFilter(filterKey);
      }

      const filterValue = filters[filterKey];
      updateFilters({
        [filterKey]: { ...filterValue, value },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
    };

    const onChangeFilterType = (filterType: FilterTypeEnum) => {
      const filterValue = filters[filterKey];
      updateFilters({
        [filterKey]: { ...filterValue, filterType },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
    };

    const removeFilter = () => {
      deleteFilter(filterKey);
    };

    if (!filter) {
      return null;
    }

    const { value, filterType } = filter;

    return (
      <div className="flex bg-grayAlpha-100 rounded-md items-center text-sm">
        <div className="px-2 p-1 rounded-md rounded-r-none transparent">
          {name}
        </div>
        <Separator className="bg-background-2 w-[1px]" orientation="vertical" />
        <FilterOptionsDropdown
          onChange={onChangeFilterType}
          isArray={isArray}
          filterType={filterType}
        />
        <Separator className="bg-background-2 w-[1px]" orientation="vertical" />
        <div className="flex items-center px-2 rounded-md rounded-l-none rounded-r-none">
          <Component value={value} onChange={onChange} />
        </div>
        <Separator className="bg-background-2 w-[1px]" orientation="vertical" />

        <Button
          className="flex items-center px-1.5 py-1 rounded-md rounded-l-none"
          onClick={removeFilter}
          variant="ghost"
        >
          <Close size={16} className="hover:text-foreground" />
        </Button>
      </div>
    );
  },
);
