import {
  Popover,
  Button,
  Command,
  CommandInput,
  PopoverContent,
  PopoverTrigger,
  CommandGroup,
  CommandItem,
  PopoverPortal,
} from '@tegonhq/ui';
import { useLocalCommonState } from 'common/use-local-state';
import { Clock } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import * as React from 'react';

export enum ScheduleDropdownDropdownVariant {
  NO_BACKGROUND = 'NO_BACKGROUND',
  DEFAULT = 'DEFAULT',
  LINK = 'LINK',
}

interface ScheduleDropdownProps {
  value?: string;
  onChange?: (newStatus: string) => void;
  variant?: ScheduleDropdownDropdownVariant;
}

export const ScheduleDropdown = observer(
  ({
    value,
    onChange,
    variant = ScheduleDropdownDropdownVariant.DEFAULT,
  }: ScheduleDropdownProps) => {
    return (
      <div
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <Popover>
          <PopoverTrigger>
            <Button variant="secondary" className="gap-1">
              <Clock size={14} className="text-foreground" />
              Schedule
            </Button>
          </PopoverTrigger>

          <PopoverPortal>
            <PopoverContent className="w-72 p-0" align="start">
              <Command className="border-none">
                <CommandInput
                  placeholder="Finish by 3pm / Meeting on Friday at 9 - 9:30"
                  autoFocus
                />

                <CommandGroup>
                  <CommandItem>Calendar</CommandItem>
                  <CommandItem>Search Emoji</CommandItem>
                  <CommandItem>Calculator</CommandItem>
                </CommandGroup>
              </Command>
            </PopoverContent>
          </PopoverPortal>
        </Popover>
      </div>
    );
  },
);
