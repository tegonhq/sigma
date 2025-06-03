import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  Command,
  CommandInput,
  Button,
} from '@redplanethq/ui';
import { observer } from 'mobx-react-lite';
import * as React from 'react';

import { useContextStore } from 'store/global-context-provider';

import { ListDropdownContent } from '../list-dropdown-content';

interface ListProps {
  value?: string[];
  onChange?: (newList: string[]) => void;
}

export const ListFilterDropdown = observer(({ value, onChange }: ListProps) => {
  const [open, setOpen] = React.useState(false);
  const { listsStore, pagesStore } = useContextStore();

  const change = (value: string[]) => {
    onChange(value);
  };

  const getText = () => {
    if (value.length > 1) {
      return `${value.length} lists`;
    }

    const list = listsStore.getListWithId(value[0]);
    const page = pagesStore.getPageWithId(list?.pageId);

    return page?.title;
  };

  return (
    <div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="link"
            role="combobox"
            size="sm"
            aria-expanded={open}
            className="flex items-center p-0 justify-between focus-visible:ring-1 focus-visible:border-primary "
          >
            {getText()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput placeholder="Select list..." autoFocus />
            <ListDropdownContent
              onChange={change}
              onClose={() => setOpen(false)}
              value={value}
              multiple
            />
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
});
