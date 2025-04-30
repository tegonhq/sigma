import { RiDiscordFill, RiGithubFill } from '@remixicon/react';
import {
  AI,
  buttonVariants,
  CalendarLine,
  cn,
  IssuesLine,
  Project,
} from '@tegonhq/ui';
import Image from 'next/image';
import Link from 'next/link';

export default function Index() {
  return (
    <div className="h-[100vh] w-[100vw] bg-background flex flex-col items-center overflow-auto">
      <div className="flex flex-col items-center w-full max-w-[800px] px-4 pt-10">
        <Image
          src="/logo_light.svg"
          alt="logo"
          key={1}
          width={65}
          height={65}
        />
        <h2 className="text-[36px] font-mono mt-6 text-center font-bold w-full">
          the to-do app that thinks for you
        </h2>
        <p className="text-lg font-inter text-foreground/50 mt-3 italic text-center tracking-tight w-full">
          from &quot;manage emails&quot; to &quot;medicine reminders&quot; — ai plans and gets it done
        </p>
      </div>

      <div className="max-w-[800px] mt-6 px-4 space-y-6">
        <p className="text-lg font-inter text-foreground/80 tracking-tight leading-relaxed">
          the way we work is changing—no more manual effort just to stay organized. sigma is the first to-do app with a built-in ai agent that proactively gathers context, plans your day, and actually does the heavy lifting.
        </p>

        <p className="text-lg font-inter text-foreground/80 tracking-tight leading-relaxed">
          imagine a to-do app that knows your world: it scans your email, github, slack, jira, calendar, and more—then suggests and creates{' '}
          <Link
            href="/features/task"
            className={cn(
              buttonVariants({ size: 'default', variant: 'secondary' }),
              'gap-1.5 text-lg font-inter px-2 py-0.5 h-auto inline-flex'
            )}
          >
            <IssuesLine size={16} /> tasks
          </Link>{' '}
          and{' '}
          <Link
            href="/features/lists"
            className={cn(
              buttonVariants({ size: 'default', variant: 'secondary' }),
              'gap-1.5 text-lg font-inter px-2 py-0.5 h-auto inline-flex'
            )}
          >
            <Project size={16} /> lists
          </Link>{' '}
          automatically. sigma learns your preferences too via{' '}
          <Link
            href="/features/signals"
            className={cn(
              buttonVariants({ size: 'default', variant: 'secondary' }),
              'gap-1.5 text-lg font-inter px-2 py-0.5 h-auto inline-flex'
            )}
          >
            <AI size={16} /> signals
          </Link> , a dedicated section where you and your agent collaborate to define exactly how sigma should behave. set up rules and instructions—like &quot;any email from job agencies goes to my job list&quot;—and sigma will honor them.
        </p>

        <p className="text-lg font-inter text-foreground/80 tracking-tight leading-relaxed">
          until now, to-do apps have depended on you to capture every task. sigma flips the script. by unifying your task stream and acting on your signals, it removes the friction of manual entry and keeps your day running smoothly.
        </p>

        <p className="text-lg font-inter text-foreground/80 tracking-tight leading-relaxed">
          and sigma isn&apos;t just an aggregator—it&apos;s your ai agent: clean your inbox with &quot;archive newsletters&quot;, gather project details with &quot;show my open jira tickets&quot;, or prep for meetings with &quot;get me background on today&apos;s attendee&quot; and sigma compiles contacts, recent chats, and relevant tasks.
        </p>

        <p className="text-lg font-inter text-foreground/80 tracking-tight leading-relaxed">
          welcome to a to-do app that works as your agent—because your best ideas deserve more than just a list. they deserve execution.
        </p>

        <p className="text-lg font-inter text-foreground/80 italic tracking-tight">
          — the sigma team
        </p>

        <div className="flex justify-center w-full gap-2">
          <a
            href="https://discord.gg/dVTC3BmgEq"
            target="_blank"
            className={cn(
              buttonVariants({ size: 'default', variant: 'secondary' }),
              'gap-2 text-base px-2.5'
            )}
          >
            <RiDiscordFill size={16} />
            discord
          </a>
          <a
            href="https://github.com/tegonhq/sigma"
            target="_blank"
            className={cn(
              buttonVariants({ size: 'default', variant: 'secondary' }),
              'gap-2 text-base px-2.5'
            )}
          >
            <RiGithubFill size={16} />
            github
          </a>

          <a
            href="https://github.com/tegonhq/sigma/releases/tag/v0.1.12"
            target="_blank"
            className={cn(
              buttonVariants({ size: 'default', variant: 'secondary' }),
              'gap-2 text-base px-2.5'
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
