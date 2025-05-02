import { observer } from 'mobx-react-lite';

import { useApplication } from 'hooks/application';

import { FilterTypeEnum } from 'store/application';

import { ListDropdownContent } from '../list-dropdown-content';

interface ListFilterProps {
  value?: string;
  onChange?: (list: string[], filterType: FilterTypeEnum) => void;
  onClose: () => void;
}

export const ListFilter = observer(({ onChange, onClose }: ListFilterProps) => {
  const { filters } = useApplication();

  const listFilters = filters.list ? filters.list.value : [];

  const change = (value: string[]) => {
    onChange(value, FilterTypeEnum.IS);
  };

  return (
    <ListDropdownContent
      onChange={change}
      onClose={onClose}
      multiple
      value={listFilters}
    />
  );
});
