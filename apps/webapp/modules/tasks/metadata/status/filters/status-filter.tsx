import { observer } from 'mobx-react-lite';

import { StatusDropdownContent } from 'modules/tasks/metadata';

import { useApplication } from 'hooks/application';

import { FilterTypeEnum } from 'store/application';

interface StatusFilterProps {
  value?: string;
  onChange?: (status: string[], filterType: FilterTypeEnum) => void;
  onClose: () => void;
}

export const StatusFilter = observer(
  ({ onChange, onClose }: StatusFilterProps) => {
    const { filters } = useApplication();

    const statusFilters = filters.status ? filters.status.value : [];

    const change = (value: string[]) => {
      onChange(value, FilterTypeEnum.IS);
    };

    return (
      <StatusDropdownContent
        onChange={change}
        onClose={onClose}
        multiple
        value={statusFilters}
      />
    );
  },
);
