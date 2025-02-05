import { Checkbox, CommandGroup } from '@tegonhq/ui';

import type { ListType } from 'common/types';

import { DropdownItem } from '../status-dropdown/dropdown-item';
import React from 'react';
import { RiHashtag } from '@remixicon/react';
import { HashIcon } from 'lucide-react';

interface ListDropdownContentProps {
  onChange?: (id: string | string[]) => void;
  onClose: () => void;
  multiple?: boolean;
  value: string | string[];
  lists: ListType[];
  searchValue: string;
}

export function ListDropdownContent({
  onChange,
  onClose,
  multiple = false,
  value,
  lists,
  searchValue,
}: ListDropdownContentProps) {
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

  const filteredList = React.useMemo(() => {
    return lists.filter((list) =>
      list.name.toLowerCase().includes(searchValue.toLowerCase()),
    );
  }, [searchValue, lists]);

  const modifiedList = React.useMemo(() => {
    if (filteredList.length === 0 && searchValue) {
      return [
        ...filteredList,
        { name: `Create list ${searchValue}`, id: `${searchValue}__new` },
      ];
    }

    return filteredList;
  }, [searchValue, filteredList]);

  return (
    <CommandGroup>
      {modifiedList.map((list, index) => {
        return (
          <DropdownItem
            key={list.id}
            id={list.id}
            value={list.id}
            index={index + 1}
            onSelect={(currentValue: string) => {
              if (!multiple) {
                onChange && onChange(currentValue);
                onClose();
              } else {
                onValueChange(!value.includes(currentValue), list.id);
              }
            }}
          >
            <div className="flex gap-2 items-center">
              {multiple && (
                <Checkbox
                  id={list.id}
                  checked={value.includes(list.id)}
                  onCheckedChange={(value: boolean) => {
                    onValueChange(value, list.id);
                  }}
                />
              )}
              <label className="flex grow items-center gap-1" htmlFor={list.id}>
                <HashIcon size={14} /> {list.name}
              </label>
            </div>
          </DropdownItem>
        );
      })}
    </CommandGroup>
  );
}
