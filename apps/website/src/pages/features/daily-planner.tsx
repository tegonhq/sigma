import { CalendarLine } from '@tegonhq/ui';

export const DailyPlanner = () => {
  return (
    <div className="flex flex-col flex-1">
      <h3 className="text-lg font-semibold text-foreground mb-1 text-left flex gap-1 items-center">
        <CalendarLine size={18} />
        Today
      </h3>
      <p className="text-base text-muted-foreground text-left">
        One focused view of today&apos;s priorities, meetings, and quick notes.
      </p>

      <div className="flex flex-col w-full bg-background-2 mt-2 px-2 rounded-sm py-2">
        <h2 className="text-md font-medium"> Sat, May 10th, 2025</h2>
        <p> Your notes and tasks to be done for the day </p>
      </div>
    </div>
  );
};
