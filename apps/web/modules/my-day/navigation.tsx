import { Button } from '@sigma/ui/components/button';
import { Calendar } from '@sigma/ui/components/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@sigma/ui/components/popover';
import { ArrowLeft, ArrowRight, CalendarLine } from '@sigma/ui/icons';
import { addDays, isSameDay, subDays } from 'date-fns';
import { observer } from 'mobx-react-lite';
import { useHotkeys } from 'react-hotkeys-hook';
import { Key } from 'ts-key-enum';

import { SCOPES } from 'common/shortcut-scopes';

import { useTab } from 'hooks/application/use-tab';
import { useScope } from 'hooks/use-scope';

export const Navigation = observer(() => {
  useScope(SCOPES.Day);
  const { tab } = useTab();
  const { date = new Date() } = tab.data;

  const onBackDate = () => {
    tab.updateData({
      date: subDays(date, 1),
    });
  };

  const onNextDate = () => {
    tab.updateData({
      date: addDays(date, 1),
    });
  };

  const goToToday = () => {
    tab.updateData({
      date: new Date(),
    });
  };

  useHotkeys(
    [`${Key.Meta}+${Key.ArrowRight}`, `${Key.Meta}+${Key.ArrowLeft}`],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (event) => {
      const isMetaKey = event.metaKey;
      switch (event.key) {
        case Key.ArrowRight:
          if (isMetaKey) {
            onNextDate();
          }
          break;
        case Key.ArrowLeft:
          if (isMetaKey) {
            onBackDate();
          }
          break;

        default:
          break;
      }
    },
    {
      scopes: [SCOPES.Day],
      enableOnFormTags: true,
      enableOnContentEditable: true,
    },
  );

  return (
    <div className="flex -mx-2 justify-between">
      <div className="flex gap-0.5">
        <Button variant="ghost" onClick={onBackDate}>
          <ArrowLeft size={18} />
        </Button>
        <Button variant="ghost" onClick={onNextDate}>
          <ArrowRight size={18} />
        </Button>

        {!isSameDay(date, new Date()) && (
          <Button variant="secondary" onClick={goToToday}>
            Today
          </Button>
        )}
      </div>

      <div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="secondary">
              <CalendarLine size={18} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={new Date(date)}
              onSelect={(date: Date) =>
                tab.updateData({
                  date,
                })
              }
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
});
