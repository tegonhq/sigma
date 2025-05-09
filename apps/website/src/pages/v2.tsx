import { DocumentLine } from '@tegonhq/ui';
import { Header } from './header';
import { Hero } from './hero';
import { Section, TaskItem } from './utils';
import { RefreshCcw } from 'lucide-react';

const Personalisation = () => {
  return (
    <Section name="Personalisation" color="#4187C0">
      <div className="flex flex-col">
        <h3 className="text-xl font-semibold text-foreground mb-1 text-left flex gap-1 items-center">
          <DocumentLine size={20} />
          AI workflow automations
        </h3>
        <p className="text-base text-muted-foreground text-left">
          Write a rule or instruction in plain English and let Sigma take care
          of the rest. For example:
        </p>
      </div>

      <div className="flex flex-col mt-7">
        <h3 className="text-xl font-semibold text-foreground mb-1 text-left flex gap-1 items-center">
          <DocumentLine size={20} />
          Signals
        </h3>
        <p className="text-base text-muted-foreground text-left">
          Sigma keeps a living &apos;about-you&apos; doc—fully editable by
          you—so the agent grows smarter without creeping you out. Below is an
          example:
        </p>
      </div>

      <div className="flex flex-col">
        <h3 className="text-xl font-semibold text-foreground mb-1 text-left flex gap-1 items-center">
          <RefreshCcw size={20} />
          Daily Sync
        </h3>
        <p className="text-base text-muted-foreground text-left">
          Wake up to a brief summary of today&apos;s top priorities, deadlines,
          meetings pulled from all tools you use. With the help of daily
          sync—plan your day in 30 secs, then go back to building.
        </p>

        <div className="flex justify-center w-full py-7 lg:py-9">
          <div className="flex w-full max-w-[600px] mx-auto shrink-0 flex-col overflow-hidden rounded shadow-1 p-4">
            <h3 className="text-lg font-semibold">
              Morning Workout & Task Planning for May 8th
            </h3>
            <p className="text-muted-foreground text-sm"> Today </p>
            <p className="flex flex-col gap-2 mt-4">
              <p>
                Good morning! It&apos;s Thursday, May 8th, and today looks like
                an ideal day for a compound workout followed by focused
                development work. Based on your recent workout history (Lower on
                May 8th, Pull on May 6th, and Push on May 5th), I recommend
                trying the <strong>Balanced Push Routine</strong> this morning
                to maintain your training balance. This routine features
                compound movements like Bench Press and focuses on chest,
                shoulders, and triceps - perfect for your preference for
                compound exercises.
              </p>

              <p>
                Your day has one time-sensitive task:{' '}
                <TaskItem
                  title="#36 Ordered/unordered list when selected in a page to
                      convert to task should get converted to task"
                  number="12"
                />
                due by 6:30 PM. I suggest tackling this after lunch around 2:00
                PM when you&apos;ll have several focused hours before the
                deadline. The morning, after your workout (around 8:30 AM),
                would be ideal for working on{' '}
                <TaskItem title="#26 Feat: Daily Sync" number="26" />
                since you have multiple related tasks on this feature.
              </p>

              <p>
                In the afternoon, consider grouping related development tasks
                together to minimize context switching. Around 4:00 PM, you
                could work on{' '}
                <TaskItem
                  title="#35 Improve: Task extension in pages"
                  number="41"
                />
                which complements your earlier work on the list-to-task
                conversion feature. If you complete these priority items,{' '}
                <TaskItem title=" Linear Integration" number="18" />
                would be a good task to tackle tomorrow morning when your focus
                is fresh.
              </p>
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
};

const Index = () => {
  return (
    <div className="h-[100vh] flex flex-col overflow-y-auto">
      <Header />
      <Hero />

      <Personalisation />
    </div>
  );
};

export default Index;
