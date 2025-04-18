import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@tegonhq/ui';
import { useTheme } from 'next-themes';

import { SettingSection } from 'modules/settings/setting-section';

export function Preferences() {
  const { theme, setTheme } = useTheme();

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
    </div>
  );
}
