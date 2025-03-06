import { observer } from 'mobx-react-lite';
import * as React from 'react';

import { useApplication } from 'hooks/application';

import { StatusFilterDropdown } from '../metadata';
import { FilterItemView } from './filter-item-view';
import { isEmpty } from './filter-utils';

export const AppliedFiltersView = observer(() => {
  const { filters } = useApplication();

  return (
    <>
      {!isEmpty(filters) && (
        <div
          className="flex gap-1 flex-wrap"
          onClick={(e) => e.stopPropagation()}
        >
          <FilterItemView
            name="Status"
            filterKey="status"
            filter={filters.status}
            Component={StatusFilterDropdown}
          />
        </div>
      )}
    </>
  );
});
