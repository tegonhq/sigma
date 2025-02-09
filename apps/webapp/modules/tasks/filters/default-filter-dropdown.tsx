import { CommandGroup, CommandItem, UnscopedLine } from '@tegonhq/ui';
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
      </CommandGroup>
    );
  },
);
