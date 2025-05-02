import { RiArrowLeftLine } from '@remixicon/react';
import { buttonVariants, cn, Project } from '@tegonhq/ui';
import Image from 'next/image';
import Link from 'next/link';

export default function ListsFeature() {
  return (
    <div className="h-[100vh] w-[100vw] bg-background flex flex-col items-center overflow-auto">
      <div className="p-2 w-full flex gap-2 flex-col items-center pt-10">
        <Project size={50} className="text-foreground" />
        <div className="max-w-[800px] w-full px-4">
          <h2 className="text-[40px] font-mono mt-4 text-center text-bold flex justify-center items-center">
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground transition-colors relative right-5 top-1"
            >
              <RiArrowLeftLine size={30} />
            </Link>
            lists
          </h2>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[800px] mt-8 space-y-8 text-left px-4 leading-[32px] mb-10">
        <p className="text-xl text-foreground/80">
          lists are your swiss army knife for organizing anything—code snippets,
          meeting notes, weekend plans, or that side project you&apos;re
          procrastinating on. think of them as flexible docs where chaos becomes
          clarity.
        </p>

        <div className="flex flex-col gap-2">
          <h3 className="text-2xl font-semibold">mix tasks, notes, and more</h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-xl font-medium mb-2">work</h4>
              <p className="text-xl text-foreground/80">
                a &quot;q4 migration plan&quot; list could have headers, pr
                links, and subtasks like &quot;update dependencies.&quot;
              </p>
            </div>
            <div>
              <h4 className="text-xl font-medium mb-2">personal</h4>
              <p className="text-xl text-foreground/80">
                a &quot;camping trip&quot; list with checklists (tent, snacks),
                weather screenshots, and a loose note like &quot;ask dave about
                campfire recipes.&quot;
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-xl font-semibold">tasks ↔ lists, made easy</h3>
          <div className="space-y-4">
            <p className="text-xl text-foreground/80">
              add a checklist (e.g., &quot;fix auth bug 🔐&quot;) → boom,
              it&apos;s a tracked task in your tasks section, linked to the
              list.
            </p>
            <p className="text-xl text-foreground/80">
              use{' '}
              <span className="font-mono bg-muted px-2 py-1 rounded">
                [[T-42
              </span>{' '}
              to embed existing tasks (like that jira ticket you&apos;ve been
              avoiding).
            </p>
          </div>
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
