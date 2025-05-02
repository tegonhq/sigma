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

import { Feature } from 'src/components';

export default function Index() {
  return (
    <div className="h-[100vh] w-[100vw] bg-background flex flex-col items-center overflow-auto">
      <div className="p-2 w-full flex gap-2 flex-col items-center pt-10">
        <Image
          src="/logo_light.svg"
          alt="logo"
          key={1}
          width={50}
          height={50}
        />
        <div className="max-w-[800px] w-full px-4">
          <h2 className="text-[40px] font-mono mt-4 text-center text-bold">
            the to-do list that works as your assistant
          </h2>
        </div>
      </div>

      <div className="max-w-[800px] mt-8 space-y-6 text-left px-4 leading-[40px] mb-10 lowercase">
        <p className="text-xl text-foreground/50 mt-4 italic">
          from &apos;fix bugs&apos; to &apos;buy groceries&apos;—ai plans and
          gets it done
        </p>

        <p className="text-xl text-foreground/80">
          the way we work is changing—no more starting from scratch on mundane
          tasks. with intelligent agents transforming our workflows, automations
          are taking over, and how we plan our days is getting a major upgrade.
        </p>

        <p className="text-xl text-foreground/80">
          imagine a todo app that doesn&apos;t just track your tasks, but
          actually gets things done for you. sigma is that all-in-one workspace
          for notes, tasks, and projects, built for the modern era. it pulls in{' '}
          <Feature
            Icon={<IssuesLine size={20} />}
            text="tasks"
            href="/features/task"
          />{' '}
          automatically from all your favorite tools like github, slack, and
          jira, so nothing ever slips through the cracks. think of its{' '}
          <Feature
            Icon={<CalendarLine size={20} />}
            text="daily planner"
            href="/features/daily-planner"
          />
          as a standup meeting for your brain—helping you carve out the perfect
          day with optimized focus and flow.
        </p>

        <p className="text-xl text-foreground/80">
          and when it comes to organizing, sigma&apos;s{' '}
          <Feature
            Icon={<Project size={20} />}
            text="lists"
            href="/features/lists"
          />{' '}
          feature is like a swiss army knife—whether you&apos;re managing tasks,
          jotting down notes, or stashing code snippets, it&apos;s got you
          covered. plus, with built-in{' '}
          <Feature
            Icon={<AI size={20} />}
            text="agents"
            href="/features/agents"
          />{' '}
          like a coding assistant and a browser helper, you have a 24/7 sidekick
          for research, automation, and execution.
        </p>

        <p className="text-xl text-foreground/80">
          but sigma isn&apos;t just another productivity tool—it&apos;s your
          control center. as it grows, it&apos;ll anticipate your needs,
          streamline your workflows, and keep you in your creative zone.
        </p>

        <p className="text-xl text-foreground/80">
          welcome to the next generation of todo lists. come join us and shape
          the future of work.
        </p>

        <p className="text-xl text-foreground/80"> – the sigma team </p>

        <div className="flex justify-center w-full p-2 gap-2">
          <a
            href="https://discord.gg/dVTC3BmgEq"
            target="_blank"
            className={cn(
              buttonVariants({ size: 'xl', variant: 'secondary' }),
              'gap-2 text-lg px-3',
            )}
          >
            <RiDiscordFill size={20} />
            discord
          </a>
          <a
            href="https://github.com/tegonhq/sigma"
            target="_blank"
            className={cn(
              buttonVariants({ size: 'xl', variant: 'secondary' }),
              'gap-2 text-lg px-3',
            )}
          >
            <RiGithubFill size={20} />
            github
          </a>

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
