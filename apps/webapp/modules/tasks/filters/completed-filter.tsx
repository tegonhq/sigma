import { CheckLine } from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';

import { useApplication } from 'hooks/application';

import { TimeBasedFilterEnum } from 'store/application';

interface ItemProps {
  text: string;
  selected?: boolean;
  onChange: (value: string) => void;
}

function Item({ text, selected = false, onChange }: ItemProps) {
  return (
    <div
      onClick={() => onChange(text)}
      className="relative flex w-full cursor-default select-none items-center rounded-sm py-1 pl-2 pr-8 gap-1 outline-none focus:bg-accent focus:text-accent-foreground"
    >
      <span className="flex h-3.5 w-3.5 items-center justify-center">
        {selected && (
          <div>
            <CheckLine className="h-4 w-4" />
          </div>
        )}
      </span>
      <div>{text}</div>
    </div>
  );
}

export const CompletedFilter = observer(() => {
  const { updateDisplaySettings, displaySettings } = useApplication();

  const onFilterChange = (value: string) => {
    updateDisplaySettings({
      completedFilter: value as TimeBasedFilterEnum,
    });
  };

  return (
    <div className="flex flex-col">
      {Object.values(TimeBasedFilterEnum).map((filter) => (
        <Item
          key={filter}
          text={filter}
          onChange={onFilterChange}
          selected={filter === displaySettings.completedFilter}
        />
      ))}
    </div>
  );
});
