import { RiArrowLeftLine } from '@remixicon/react';
import { buttonVariants, cn, IssuesLine } from '@tegonhq/ui';
import Image from 'next/image';
import Link from 'next/link';

export default function TaskFeature() {
  return (
    <div className="h-[100vh] w-[100vw] bg-background flex flex-col items-center overflow-auto">
      <div className="p-2 w-full flex gap-2 flex-col items-center pt-10">
        <IssuesLine size={50} className="text-foreground" />
        <div className="max-w-[800px] w-full px-4">
          <h2 className="text-[40px] font-mono mt-4 text-center text-bold flex justify-center items-center">
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground transition-colors relative right-5 top-1"
            >
              <RiArrowLeftLine size={30} />
            </Link>
            tasks
          </h2>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[800px] mt-8 space-y-8 text-left px-4 leading-[32px] mb-10">
        <p className="text-xl text-foreground/80">
          tasks are your core to-dos—anything from fixing a critical bug to
          picking up groceries. whether it&apos;s &quot;review pr #187&quot; or
          &quot;buy hiking shoes for the weekend,&quot; sigma keeps it all
          organized.
        </p>

        <p className="text-xl text-foreground/80">
          simple or complex? no biggie. add a task like &quot;fix login bug
          🔑&quot; or break it down into sub-tasks, notes, code snippets, or
          even attach a screenshot of that weird error.
        </p>

        <div className="flex flex-col gap-2">
          <h3 className="text-xl font-semibold">task details</h3>
          <p className="text-xl text-foreground/80">
            click any task id (like{' '}
            <span className="font-mono bg-grayAlpha-100 px-2 py-1 rounded">
              T-42
            </span>
            ) to open its hub. dump notes, add subtasks, todos, attachments, or
            even that angry slack message you need to reference later.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-xl font-semibold">schedule like a human</h3>
          <p className="text-xl text-foreground/80">
            type &quot;tomorrow 7pm&quot; or &quot;after standup&quot;—sigma
            gets it. no dropdowns. just vibes.
          </p>
        </div>

        <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
          <h3 className="text-xl font-semibold mb-2 text-primary">pro tip</h3>
          <p className="text-xl text-foreground/80">
            got a jira ticket or github issue or slack reminders as tasks? mark
            them done in sigma, and they&apos;re done everywhere else. no more
            context switching.
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
