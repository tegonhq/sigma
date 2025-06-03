import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  Button,
  SettingsLine,
} from '@redplanethq/ui';
import { observer } from 'mobx-react-lite';
import React from 'react';

import { TooltipWrapper } from 'common/tooltip';

import { useApplication } from 'hooks/application';

import { CompletedFilter } from './completed-filter';
import { ViewOptionItem } from './view-option-item';

export const ViewOptions = observer(() => {
  const { displaySettings, updateDisplaySettings } = useApplication();

  return (
    <>
      <Popover>
        <TooltipWrapper tooltip="Display Options">
          <PopoverTrigger asChild>
            <Button variant="ghost">
              <SettingsLine size={20} />
            </Button>
          </PopoverTrigger>
        </TooltipWrapper>
        <PopoverContent className="w-52 p-0" align="end">
          <div className="w-full">
            <div className="flex flex-col p-3 pb-2">
              <h4 className="text-sm text-muted-foreground">
                Completed filter
              </h4>
              <CompletedFilter />
            </div>
            <div className="flex flex-col gap-2 p-3 pt-0">
              <h4 className="text-sm text-muted-foreground">
                Display settings
              </h4>

              <ViewOptionItem
                text="Show empty groups"
                id="showEmptyGroups"
                checked={displaySettings.showEmptyGroups}
                onCheckedChange={(value: boolean) =>
                  updateDisplaySettings({
                    showEmptyGroups: value,
                  })
                }
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
});
