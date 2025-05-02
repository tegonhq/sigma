import { RiArrowLeftLine } from '@remixicon/react';
import { buttonVariants, CalendarLine, cn } from '@tegonhq/ui';
import Image from 'next/image';
import Link from 'next/link';

export default function DailyPlannerFeature() {
  return (
    <div className="h-[100vh] w-[100vw] bg-background flex flex-col items-center overflow-auto">
      <div className="p-2 w-full flex gap-2 flex-col items-center pt-10">
        <CalendarLine size={50} className="text-foreground" />
        <div className="max-w-[800px] w-full px-4">
          <h2 className="text-[40px] font-mono mt-4 text-center text-bold flex justify-center items-center">
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground transition-colors relative right-5 top-1"
            >
              <RiArrowLeftLine size={30} />
            </Link>
            daily planner
          </h2>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[800px] mt-8 space-y-8 text-left px-4 leading-[32px] mb-10">
        <p className="text-xl text-foreground/80">
          your day just got a dev-friendly upgrade. sigma&apos;s my day cuts
          through the chaos of 100+ tasks to show what actually matters today.
          it&apos;s like a daily standup for your brain:
        </p>

        <div className="flex flex-col gap-2">
          <h3 className="text-xl font-semibold">auto-scheduled tasks</h3>
          <p className="text-xl text-foreground/80">
            if you&apos;ve set a due date (or typed &quot;today&quot;), tasks
            land here. no hunting.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-xl font-semibold">focus mode</h3>
          <p className="text-xl text-foreground/80">
            drag in pr reviews, code fixes, or &quot;buy dog food&quot; —
            prioritize what you can realistically tackle.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-xl font-semibold">energy alignment</h3>
          <p className="text-xl text-foreground/80">
            add notes like &quot;debug after coffee&quot; or &quot;low-energy:
            write docs&quot; to match your flow.
          </p>
        </div>

        <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
          <h3 className="text-xl font-semibold mb-2 text-primary">pro tip</h3>
          <p className="text-xl text-foreground/80">
            overwhelmed by jira tickets? let sigma&apos;s ai suggest a realistic
            daily batch based on deadlines and your past velocity. 🚀
          </p>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12 pt-8">
          <a
            href="https://github.com/tegonhq/sigma/releases/tag/v0.1.11"
            target="_blank"
            className={cn(
              buttonVariants({ size: 'xl', variant: 'secondary' }),
              'gap-2 text-lg px-3',
            )}
          >
            <Image
              src="/logo_light.svg"
              alt="logo"
              key={1}
              width={20}
              height={20}
            />
            download
          </a>
        </div>
      </div>
    </div>
  );
}
