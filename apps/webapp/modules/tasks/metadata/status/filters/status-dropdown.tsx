import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  Command,
  CommandInput,
  Button,
} from '@tegonhq/ui';
import * as React from 'react';

import { StatusDropdownContent } from 'modules/tasks/metadata';

interface StatusProps {
  value?: string[];
  onChange?: (newStatus: string[]) => void;
}

export function StatusFilterDropdown({ value, onChange }: StatusProps) {
  const [open, setOpen] = React.useState(false);

  const change = (value: string[]) => {
    onChange(value);
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
            {value.length > 1 ? `${value.length} statuses` : value[0]}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput placeholder="Set status..." autoFocus />
            <StatusDropdownContent
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
}
