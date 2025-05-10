import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  useToast,
} from '@tegonhq/ui';
import { useTheme } from 'next-themes';
import React from 'react';

import { SettingSection } from 'modules/settings/setting-section';

import { useToggleDailySyncMutation } from 'services/workspace';

import { UserContext } from 'store/user-context';

export function Preferences() {
  const { theme, setTheme } = useTheme();
  const { mutate: toggleDailySync } = useToggleDailySyncMutation({});
  const { toast } = useToast();
  const user = React.useContext(UserContext);
  const preferences = user.workspace.preferences;

  return (
    <div className="flex flex-col gap-2">
      <SettingSection
        title="Theme"
        description="Choose a preferred theme for the app."
      >
        <Select
          value={theme}
          onValueChange={(value: string) => {
            setTheme(value);
          }}
        >
          <SelectTrigger className="w-[180px]" showIcon={false}>
            <SelectValue placeholder="Select your theme" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </SettingSection>

      <SettingSection
        title="Daily sync"
        description=" Wake up to a brief summary of today's top priorities, deadlines,
          meetings pulled from all tools you use. With the help of daily
          sync—plan your day in 30 secs, then go back to building."
      >
        <Select
          value={preferences.scheduleId ? 'enabled' : 'disabled'}
          onValueChange={(value: string) => {
            toggleDailySync(value === 'enabled' ? true : false, {
              onSuccess: () => {
                toast({
                  title: 'Success',
                  description: 'Daily sync has been updated',
                });
              },
            });
          }}
        >
          <SelectTrigger className="w-[180px]" showIcon={false}>
            <SelectValue placeholder="Enable/Disable daily sync" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="enabled">Enabled</SelectItem>
              <SelectItem value="disabled">Disabled</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </SettingSection>
    </div>
  );
}
