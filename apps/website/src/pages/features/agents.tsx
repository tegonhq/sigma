import { RiArrowLeftLine } from '@remixicon/react';
import { AI, buttonVariants, cn } from '@tegonhq/ui';
import Image from 'next/image';
import Link from 'next/link';

export default function AgentsFeature() {
  return (
    <div className="h-[100vh] w-[100vw] bg-background flex flex-col items-center overflow-auto">
      {/* Header Section */}
      <div className="p-2 w-full flex gap-2 flex-col items-center pt-10">
        <AI size={50} className="text-foreground" />
        <div className="max-w-[800px] w-full px-4">
          <h2 className="text-[40px] font-mono mt-4 text-center text-bold flex justify-center items-center">
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground transition-colors relative right-5 top-1"
            >
              <RiArrowLeftLine size={30} />
            </Link>
            agents
          </h2>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[800px] mt-8 space-y-8 text-left px-4 leading-[32px] mb-10">
        <p className="text-xl text-foreground/80">
          sigma isn&apos;t just a task manager—it&apos;s your ai command center.
          assign agents to automate the grind so you can focus on the fun stuff
          (like coding).
        </p>

        <div className="flex flex-col gap-2">
          <h3 className="text-2xl font-semibold mb-2">meet the squad</h3>

          <h3 className="text-xl font-semibold">task agent</h3>
          <p className="text-xl text-foreground/80">
            chat with sigma like a teammate:
          </p>
          <div className="space-y-2 text-xl text-foreground/80">
            <p>&quot;add a pr review for #187 tomorrow at 2pm&quot; → done.</p>
            <p>
              &quot;create a vietnam trip list with flights, visas, and photo
              spots&quot; → booms a prepped list.
            </p>
            <p>
              &quot;what&apos;s blocking t-42?&quot; → instantly surfaces notes,
              subtasks, or slack threads.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-xl font-semibold">coding agent</h3>
          <p className="text-xl text-foreground/80">
            tired of boilerplate fixes? assign bugs like:
          </p>
          <div className="space-y-2 text-xl text-foreground/80">
            <p>
              &quot;update deprecated api calls in auth-service.js&quot; → agent
              writes the pr, you review.
            </p>
            <p>
              &quot;fix typo in docs&quot; → agent commits the change. no
              context switching.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-xl font-semibold">browser agent</h3>
          <p className="text-xl text-foreground/80">
            let sigma handle life&apos;s busywork:
          </p>
          <div className="space-y-2 text-xl text-foreground/80">
            <p>
              &quot;find cheap flights to hanoi in december&quot; → agent scours
              the web, dumps options into your task.
            </p>
            <p>
              &quot;book the 2pm flight from sf&quot; → agent fills your deets,
              clicks &quot;buy.&quot; trust optional (we get it).
            </p>
          </div>
        </div>

        <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
          <h3 className="text-xl font-semibold text-primary">pro tip</h3>
          <p className="text-xl text-foreground/80">
            stuck in a sprint crunch? assign the coding agent to auto-fix lint
            errors or update dependencies. ship faster, stress less.
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
