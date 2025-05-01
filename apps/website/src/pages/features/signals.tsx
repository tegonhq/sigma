import { RiArrowLeftLine } from '@remixicon/react';
import { buttonVariants, cn, AI } from '@tegonhq/ui';
import Image from 'next/image';
import Link from 'next/link';

export default function SignalsFeature() {
  return (
    <div className="h-[100vh] w-[100vw] bg-background flex flex-col items-center overflow-auto">
      <div className="w-full max-w-[800px] px-4 pt-10">
        <div className="flex flex-col items-center gap-4">
          <AI size={32} className="text-foreground" />
          <h2 className="text-[36px] font-mono font-bold flex items-center gap-3">
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <RiArrowLeftLine size={24} />
            </Link>
            signals
          </h2>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[800px] mt-8 space-y-8 text-left px-4 mb-10">
        <p className="text-lg font-inter text-foreground/80 tracking-tight leading-relaxed">
          signals is your personalization hub in sigma&apos;s settings—where you and your agent co-author your bespoke workflow. think of it as a living doc that captures your preferences, rules, and personal details so sigma can think and act like you.
        </p>

        <div className="flex flex-col gap-6">
          <h3 className="text-lg font-inter font-semibold tracking-tight">what is it?</h3>
          <div className="space-y-4 pl-5">
            <p className="text-lg font-inter text-foreground/80 tracking-tight leading-relaxed relative">
              <span className="absolute -left-5 font-medium">1.</span>
              an editable document where you write instructions your ai agent will execute automatically.
            </p>
            <p className="text-lg font-inter text-foreground/80 tracking-tight leading-relaxed relative">
              <span className="absolute -left-5 font-medium">2.</span>
              the place to record key personal guidelines (e.g., &quot;when drafting email, always ask my sign-off, keep it kind, direct, one-liner&quot;).
            </p>
            <p className="text-lg font-inter text-foreground/80 tracking-tight leading-relaxed relative">
              <span className="absolute -left-5 font-medium">3.</span>
              a context-gatherer—sigma pulls relevant details from your past chats to enrich your signals page.
            </p>
          </div>
          <p className="text-lg font-inter text-foreground/80 tracking-tight leading-relaxed mt-2">
            the goal: build a single, exhaustive source of truth about how you work and what you like, making sigma truly personalized.
          </p>
        </div>

        <div className="flex flex-col gap-6 mt-10">
          <h3 className="text-lg font-inter font-semibold tracking-tight">example preferences you might add</h3>
          
          <div className="space-y-8">
            <div>
              <h4 className="text-lg font-inter font-medium mb-3 tracking-tight">about me</h4>
              <div className="space-y-2">
                <p className="text-lg font-inter text-foreground/80 tracking-tight leading-relaxed">
                  • i&apos;m 30 years old, male, and co-founder at sigma
                </p>
                <p className="text-lg font-inter text-foreground/80 tracking-tight leading-relaxed">
                  • prefer airbnbs over hotels
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-inter font-medium mb-3 tracking-tight">email</h4>
              <div className="space-y-2">
                <p className="text-lg font-inter text-foreground/80 tracking-tight leading-relaxed">
                  • auto-reply with my scheduling link when someone asks for a demo slot
                </p>
                <p className="text-lg font-inter text-foreground/80 tracking-tight leading-relaxed">
                  • any email from job portals i&apos;ve signed up for → add company & link to my &quot;job list&quot; in sigma
                </p>
                <p className="text-lg font-inter text-foreground/80 tracking-tight leading-relaxed">
                  • read meeting summaries and turn key action items into tasks
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-inter font-medium mb-3 tracking-tight">slack</h4>
              <div className="space-y-2">
                <p className="text-lg font-inter text-foreground/80 tracking-tight leading-relaxed">
                  • summarize threads where i&apos;m tagged and draft action-item tasks
                </p>
                <p className="text-lg font-inter text-foreground/80 tracking-tight leading-relaxed">
                  • convert &quot;granola notes&quot; summaries into sigma tasks automatically
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-inter font-medium mb-3 tracking-tight">github</h4>
              <div className="space-y-2">
                <p className="text-lg font-inter text-foreground/80 tracking-tight leading-relaxed">
                  • create a sigma task for each pull request or issue assigned to me, linking back to the original
                </p>
                <p className="text-lg font-inter text-foreground/80 tracking-tight leading-relaxed">
                  • include a quick PR summary in the task details
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-inter font-medium mb-3 tracking-tight">calendar</h4>
              <div className="space-y-2">
                <p className="text-lg font-inter text-foreground/80 tracking-tight leading-relaxed">
                  • for external attendees, research and append a &quot;meet prep&quot; note on their task page
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
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