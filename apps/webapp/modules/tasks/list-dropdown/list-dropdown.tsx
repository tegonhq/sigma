import {
  Popover,
  Button,
  Command,
  CommandInput,
  PopoverContent,
  PopoverTrigger,
} from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';
import * as React from 'react';

import { ListDropdownContent } from './list-dropdown-content';
import { useLists } from 'hooks/list';
import { RiHashtag } from '@remixicon/react';
import { HashIcon } from 'lucide-react';

export enum ListDropdownVariant {
  NO_BACKGROUND = 'NO_BACKGROUND',
  DEFAULT = 'DEFAULT',
  LINK = 'LINK',
}

interface StatusProps {
  value?: string;
  onChange?: (list: string) => void;
  variant?: ListDropdownVariant;
}

export const ListDropdown = observer(
  ({ value, onChange, variant = ListDropdownVariant.DEFAULT }: StatusProps) => {
    const [open, setOpen] = React.useState(false);
    const [searchValue, setSearchValue] = React.useState('');
    const lists = useLists();

    function getTrigger() {
      if (variant === ListDropdownVariant.NO_BACKGROUND) {
        return (
          <Button
            variant="outline"
            role="combobox"
            size="sm"
            aria-expanded={open}
            className="flex items-center !bg-transparent hover:bg-transparent shadow-none p-0 border-0 justify-between focus-visible:ring-1 focus-visible:border-primary "
          >
            #
          </Button>
        );
      }

      if (variant === ListDropdownVariant.LINK) {
        return (
          <Button
            variant="link"
            role="combobox"
            aria-expanded={open}
            className="flex items-center px-0 shadow-none justify-between focus-visible:ring-1 focus-visible:border-primary"
          >
            {value}
          </Button>
        );
      }

      return (
        <Button
          variant="secondary"
          role="combobox"
          aria-expanded={open}
          className="flex items-center gap-1 justify-between shadow-none focus-visible:ring-1 focus-visible:border-primary border-border"
        >
          <HashIcon size={14} />
          {value ? `${value}` : 'Add list...'}
        </Button>
      );
    }

    return (
      <div
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>{getTrigger()}</PopoverTrigger>
          <PopoverContent className="w-72 p-0" align="start">
            <Command shouldFilter={false}>
              <CommandInput
                placeholder="Set list..."
                autoFocus
                value={searchValue}
                onInput={(e) => setSearchValue(e.currentTarget.value)}
              />
              <ListDropdownContent
                onChange={onChange}
                onClose={() => setOpen(false)}
                value={value}
                lists={lists}
                searchValue={searchValue}
              />
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    );
  },
);
