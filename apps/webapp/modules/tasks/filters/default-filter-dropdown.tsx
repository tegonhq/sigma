import {
  CommandGroup,
  CommandItem,
  Project,
  UnscopedLine,
} from '@redplanethq/ui';
import { observer } from 'mobx-react-lite';
import * as React from 'react';

export const DefaultFilterDropdown = observer(
  ({ onSelect }: { onSelect: (value: string) => void }) => {
    return (
      <CommandGroup>
        <CommandItem
          key="Status"
          value="Status"
          className="flex items-center"
          onSelect={onSelect}
        >
          <UnscopedLine size={16} className="mr-2" /> Status
        </CommandItem>
        <CommandItem
          key="List"
          value="List"
          className="flex items-center"
          onSelect={onSelect}
        >
          <Project size={16} className="mr-2" /> List
        </CommandItem>
      </CommandGroup>
    );
  },
);
