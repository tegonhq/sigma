import { Checkbox, CommandGroup } from '@tegonhq/ui';

import { DropdownItem } from './dropdown-item';
import { getStatusColor, getStatusIcon } from './status-utils';

interface IssueStatusDropdownContentProps {
  onChange?: (id: string | string[]) => void;
  onClose: () => void;
  multiple?: boolean;
  value: string | string[];
}

const statuses = ['Todo', 'In Progress', 'Done', 'Canceled'];

export function StatusDropdownContent({
  onChange,
  onClose,
  multiple = false,
  value,
}: IssueStatusDropdownContentProps) {
  const onValueChange = (checked: boolean, id: string) => {
    if (checked && !value.includes(id)) {
      onChange && onChange([...value, id]);
    }

    if (!checked && value.includes(id)) {
      const newIds = [...value];
      const indexToDelete = newIds.indexOf(id);

      newIds.splice(indexToDelete, 1);
      onChange && onChange(newIds);
    }
  };

  return (
    <CommandGroup>
      {statuses.map((status, index) => {
        const CategoryIcon = getStatusIcon(status);

        return (
          <DropdownItem
            key={status}
            id={status}
            value={status}
            index={index + 1}
            onSelect={(currentValue: string) => {
              if (!multiple) {
                onChange && onChange(currentValue);
                onClose();
              } else {
                onValueChange(!value.includes(currentValue), status);
              }
            }}
          >
            <div className="flex gap-2 items-center">
              {multiple && (
                <Checkbox
                  id={status}
                  checked={value.includes(status)}
                  onCheckedChange={(value: boolean) => {
                    onValueChange(value, status);
                  }}
                />
              )}
              <label className="flex grow items-center" htmlFor={status}>
                <CategoryIcon
                  size={18}
                  className="mr-2"
                  color={getStatusColor(status).color}
                />
                {status}
              </label>
            </div>
          </DropdownItem>
        );
      })}
    </CommandGroup>
  );
}
