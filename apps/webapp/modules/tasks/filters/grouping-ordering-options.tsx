import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  StackLine,
} from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';

import { useApplication } from 'hooks/application';

import type { GroupingEnum } from 'store/application';

export const GroupingOrderingOptions = observer(() => {
  const { displaySettings, updateDisplaySettings } = useApplication();

  return (
    <div className="flex items-center gap-2">
      <Select
        value={displaySettings.grouping}
        onValueChange={(value: string) => {
          updateDisplaySettings({
            grouping: value as GroupingEnum,
          });
        }}
      >
        <SelectTrigger className="h-7 py-1 flex gap-1 items-center" showIcon>
          <StackLine size={16} />
          <SelectValue placeholder="Select a category" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel className="text-sm font-normal">Group by</SelectLabel>
            <SelectItem value="schedule">Schedule</SelectItem>
            <SelectItem value="status">Status</SelectItem>
            <SelectItem value="assignee">List</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
});
