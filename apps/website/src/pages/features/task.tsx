import { RiArrowLeftLine } from '@remixicon/react';
import { buttonVariants, cn, IssuesLine } from '@tegonhq/ui';
import Image from 'next/image';
import Link from 'next/link';

export default function TaskFeature() {
  return (
    <div className="h-[100vh] w-[100vw] bg-background flex flex-col items-center overflow-auto">
      <div className="w-full max-w-[800px] px-4 pt-10">
        <div className="flex flex-col items-center gap-4">
          <IssuesLine size={32} className="text-foreground" />
          <h2 className="text-[36px] font-mono font-bold flex items-center gap-3">
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <RiArrowLeftLine size={24} />
            </Link>
            tasks
          </h2>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[800px] mt-8 space-y-6 text-left px-4 leading-[32px] mb-10">
        <p className="text-lg font-inter text-foreground/80 tracking-tight leading-relaxed">
          tasks are your core to-dos—anything from fixing a critical bug to
          picking up groceries. whether it&apos;s &quot;review pr #187&quot; or
          &quot;buy hiking shoes for the weekend,&quot; sigma keeps it all
          organized.
        </p>

        <p className="text-lg font-inter text-foreground/80 tracking-tight leading-relaxed">
          simple or complex? no biggie. add a task like &quot;fix login bug
          🔑&quot; or break it down into sub-tasks, notes, code snippets, or
          even attach a screenshot of that weird error.
        </p>

        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-inter font-semibold tracking-tight">task details</h3>
          <p className="text-lg font-inter text-foreground/80 tracking-tight leading-relaxed">
            click any task id (like{' '}
            <span className="font-mono bg-grayAlpha-100 px-2 py-1 rounded">
              T-42
            </span>
            ) to open its hub. dump notes, add subtasks, todos, attachments, or
            even that angry slack message you need to reference later.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-inter font-semibold tracking-tight">schedule like a human</h3>
          <p className="text-lg font-inter text-foreground/80 tracking-tight leading-relaxed">
            type &quot;tomorrow 7pm&quot; or &quot;after standup&quot;—sigma
            gets it. no dropdowns. just vibes.
          </p>
        </div>

        <div className="bg-primary/5 rounded-lg p-3 border border-primary/10">
          <h3 className="text-lg font-inter font-semibold text-primary mb-1 tracking-tight">pro tip</h3>
          <p className="text-lg font-inter text-foreground/80 tracking-tight leading-relaxed">
            got a jira ticket or github issue or slack reminders as tasks? mark them done in sigma, and they&apos;re done everywhere else. no more context switching.
          </p>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-8">
          <a
            href="https://github.com/tegonhq/sigma/releases/tag/v0.1.11"
            target="_blank"
            className={cn(
              buttonVariants({ size: 'default', variant: 'secondary' }),
              'gap-2 text-base font-inter px-2.5'
            )}
          >
            <Image
              src="/logo_light.svg"
              alt="logo"
              key={1}
              width={16}
              height={16}
            />
            download
          </a>
        </div>
      </div>
    </div>
  );
}
