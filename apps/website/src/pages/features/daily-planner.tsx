import { CalendarLine } from '@tegonhq/ui';
import Link from 'next/link';
import { RiArrowLeftLine } from '@remixicon/react';

export default function DailyPlannerFeature() {
  return (
    <div className="h-[100vh] w-[100vw] bg-background flex flex-col items-center overflow-auto">
      {/* Header Section */}
      <div className="p-2 w-full flex flex-col pt-24">
        <div className="max-w-[800px] mx-auto w-full px-4">
          <div className="flex items-center mb-8 gap-6">
            <Link 
              href="/" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <RiArrowLeftLine size={24} />
            </Link>
            <div className="flex items-center gap-1">
              <CalendarLine size={24} className="text-foreground" />
              <h1 className="text-2xl font-semibold">daily planner</h1>
            </div>
          </div>
          <h2 className="text-[40px] font-mono text-left">
            because even rockstar devs need a roadmap.
          </h2>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[800px] mt-8 space-y-8 text-left px-4 leading-[32px] mb-10">
        <p className="text-xl text-foreground/80">
          your day just got a dev-friendly upgrade.
          sigma&apos;s my day cuts through the chaos of 100+ tasks to show what actually matters today. 
          it&apos;s like a daily standup for your brain:
        </p>

        <div className="bg-card rounded-lg p-6 border border-border">
          <h3 className="text-xl font-semibold mb-4">auto-scheduled tasks</h3>
          <p className="text-lg text-foreground/80">
            if you&apos;ve set a due date (or typed &quot;today&quot;), tasks land here. no hunting.
          </p>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border">
          <h3 className="text-xl font-semibold mb-4">focus mode</h3>
          <p className="text-lg text-foreground/80">
            drag in pr reviews, code fixes, or &quot;buy dog food&quot; — prioritize what you can realistically tackle.
          </p>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border">
          <h3 className="text-xl font-semibold mb-4">energy alignment</h3>
          <p className="text-lg text-foreground/80">
            add notes like &quot;debug after coffee&quot; or &quot;low-energy: write docs&quot; to match your flow.
          </p>
        </div>

        <div className="bg-primary/10 rounded-lg p-6 border border-primary/20">
          <h3 className="text-xl font-semibold mb-4 text-primary">pro tip</h3>
          <p className="text-lg text-foreground/80">
            overwhelmed by jira tickets? let sigma&apos;s ai suggest a realistic daily batch based on deadlines and your past velocity. 🚀
          </p>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12 pt-8 border-t border-border">
          <h2 className="text-2xl font-semibold mb-4">ready to plan your days better?</h2>
          <p className="text-muted-foreground mb-8">
            join sigma today and experience a more natural way to plan your work.
          </p>
          <button className="bg-primary text-primary-foreground px-8 py-4 rounded-md hover:bg-primary/90 text-lg font-medium">
            get started
          </button>
        </div>
      </div>
    </div>
  );
} 