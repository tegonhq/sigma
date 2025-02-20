import {
  Popover,
  Button,
  Command,
  CommandInput,
  PopoverContent,
  PopoverTrigger,
  PopoverPortal,
} from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';
import * as React from 'react';

import { StatusDropdownContent } from './status-dropdown-content';
import { getStatusColor, getStatusIcon } from './status-utils';

export enum StatusDropdownVariant {
  NO_BACKGROUND = 'NO_BACKGROUND',
  DEFAULT = 'DEFAULT',
  LINK = 'LINK',
}

interface StatusProps {
  value?: string;
  onChange?: (newStatus: string) => void;
  variant?: StatusDropdownVariant;
}

export const StatusDropdown = observer(
  ({
    value,
    onChange,
    variant = StatusDropdownVariant.DEFAULT,
  }: StatusProps) => {
    const [open, setOpen] = React.useState(false);

    const CategoryIcon = getStatusIcon(value);

    function getTrigger() {
      if (variant === StatusDropdownVariant.NO_BACKGROUND) {
        return (
          <Button
            variant="outline"
            role="combobox"
            size="sm"
            aria-expanded={open}
            className="flex items-center !bg-transparent hover:bg-transparent shadow-none p-0 border-0 justify-between focus-visible:ring-1 focus-visible:border-primary "
          >
            <CategoryIcon size={20} color={getStatusColor(value).color} />
          </Button>
        );
      }

      if (variant === StatusDropdownVariant.LINK) {
        return (
          <Button
            variant="link"
            role="combobox"
            aria-expanded={open}
            className="flex items-center px-0 shadow-none justify-between focus-visible:ring-1 focus-visible:border-primary"
          >
            <CategoryIcon
              size={20}
              className="text-muted-foreground"
              color={getStatusColor(value).color}
            />
          </Button>
        );
      }

      return (
        <Button
          variant="secondary"
          role="combobox"
          aria-expanded={open}
          className="flex items-center gap-2 justify-between shadow-none focus-visible:ring-1 focus-visible:border-primary border-border"
        >
          <CategoryIcon size={18} color={getStatusColor(value).color} />
          {value}
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
          <PopoverPortal>
            <PopoverContent className="w-72 p-0" align="start">
              <Command>
                <CommandInput placeholder="Set status..." autoFocus />
                <StatusDropdownContent
                  onChange={onChange}
                  onClose={() => setOpen(false)}
                  value={value}
                />
              </Command>
            </PopoverContent>
          </PopoverPortal>
        </Popover>
      </div>
    );
  },
);
