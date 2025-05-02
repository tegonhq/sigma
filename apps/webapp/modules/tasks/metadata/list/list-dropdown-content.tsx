import { Checkbox, CommandGroup } from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';

import { getIcon } from 'common/icon-picker';

import { useLists } from 'hooks/list';

import { useContextStore } from 'store/global-context-provider';

import { DropdownItem } from '../dropdown-item';

interface ListDropdownContentProps {
  onChange?: (id: string | string[]) => void;
  onClose: () => void;
  multiple?: boolean;
  value: string | string[];
}

export const ListDropdownContent = observer(
  ({
    onChange,
    onClose,
    multiple = false,
    value,
  }: ListDropdownContentProps) => {
    const lists = useLists();
    const { pagesStore } = useContextStore();

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
        {lists.map((list, index) => {
          const page = pagesStore.getPageWithId(list?.pageId);

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
                <label className="flex grow items-center gap-2">
                  {getIcon(list?.icon, 14)}
                  {page?.title}
                </label>
              </div>
            </DropdownItem>
          );
        })}
      </CommandGroup>
    );
  },
);
