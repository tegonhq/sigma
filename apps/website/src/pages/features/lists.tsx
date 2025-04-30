import { RiArrowLeftLine } from '@remixicon/react';
import { buttonVariants, cn, Project } from '@tegonhq/ui';
import Image from 'next/image';
import Link from 'next/link';

export default function ListsFeature() {
  return (
    <div className="h-[100vh] w-[100vw] bg-background flex flex-col items-center overflow-auto">
      <div className="w-full max-w-[800px] px-4 pt-10">
        <div className="flex flex-col items-center gap-4">
          <Project size={32} className="text-foreground" />
          <h2 className="text-[36px] font-mono font-bold flex items-center gap-3">
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <RiArrowLeftLine size={24} />
            </Link>
            lists
          </h2>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[800px] mt-8 space-y-6 text-left px-4 leading-[32px] mb-10">
        <p className="text-lg font-inter text-foreground/80 tracking-tight leading-relaxed">
          lists are your swiss army knife for organizing anything—code snippets,
          meeting notes, weekend plans, or that side project you&apos;re
          procrastinating on. think of them as flexible docs where chaos becomes
          clarity.
        </p>

        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-inter font-semibold tracking-tight">mix tasks, notes, and more</h3>
          <div className="space-y-3">
            <div>
              <h4 className="text-lg font-inter font-medium mb-1 tracking-tight">work</h4>
              <p className="text-lg font-inter text-foreground/80 tracking-tight leading-relaxed">
                a &quot;q4 migration plan&quot; list could have headers, pr
                links, and subtasks like &quot;update dependencies.&quot;
              </p>
            </div>
            <div>
              <h4 className="text-lg font-inter font-medium mb-1 tracking-tight">personal</h4>
              <p className="text-lg font-inter text-foreground/80 tracking-tight leading-relaxed">
                a &quot;camping trip&quot; list with checklists (tent, snacks),
                weather screenshots, and a loose note like &quot;ask dave about
                campfire recipes.&quot;
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-inter font-semibold tracking-tight">tasks ↔ lists, made easy</h3>
          <div className="space-y-3">
            <p className="text-lg font-inter text-foreground/80 tracking-tight leading-relaxed">
              add a checklist (e.g., &quot;fix auth bug 🔐&quot;) → boom,
              it&apos;s a tracked task in your tasks section, linked to the
              list.
            </p>
            <p className="text-lg font-inter text-foreground/80 tracking-tight leading-relaxed">
              use{' '}
              <span className="font-mono bg-grayAlpha-100 px-2 py-1 rounded">
                [[T-42]]
              </span>{' '}
              to embed existing tasks (like that jira ticket you&apos;ve been
              avoiding).
            </p>
          </div>
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
