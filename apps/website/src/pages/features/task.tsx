import { IssuesLine } from '@tegonhq/ui';
import Link from 'next/link';
import { RiArrowLeftLine } from '@remixicon/react';

export default function TaskFeature() {
  return (
    <div className="h-[100vh] w-[100vw] bg-background flex flex-col items-center overflow-auto">
      {/* Navigation Bar */}
      <div className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-b border-border z-10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center">
          <Link 
            href="/" 
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <RiArrowLeftLine size={20} />
            <span>back to home</span>
          </Link>
        </div>
      </div>

      {/* Header Section */}
      <div className="p-2 w-full flex gap-2 flex-col items-center pt-24">
        <div className="flex items-center gap-2">
          <IssuesLine size={24} className="text-foreground" />
          <h1 className="text-2xl font-semibold">tasks</h1>
        </div>
        <div className="max-w-[800px] mt-8 px-4">
          <h2 className="text-[40px] font-mono text-left">
            because even developers need to buy milk.
          </h2>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[800px] mt-8 space-y-8 text-left px-4 leading-[32px] mb-10">
        <p className="text-xl text-foreground/80">
          tasks are your core to-dos—anything from fixing a critical bug to picking up groceries. 
          whether it&apos;s &quot;review pr #187&quot; or &quot;buy hiking shoes for the weekend,&quot; sigma keeps it all organized.
        </p>

        <p className="text-xl text-foreground/80">
          simple or complex? no biggie. add a task like &quot;fix login bug 🔑&quot; or break it down into sub-tasks, 
          notes, code snippets, or even attach a screenshot of that weird error.
        </p>

        <div className="bg-card rounded-lg p-6 border border-border">
          <h3 className="text-xl font-semibold mb-4">task details</h3>
          <p className="text-lg text-foreground/80">
            click any task id (like <span className="font-mono bg-muted px-2 py-1 rounded">t-42</span>) to open its hub. 
            dump notes, add subtasks, todos, attachments, or even that angry slack message you need to reference later.
          </p>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border">
          <h3 className="text-xl font-semibold mb-4">schedule like a human</h3>
          <p className="text-lg text-foreground/80">
            type &quot;tomorrow 7pm&quot; or &quot;after standup&quot;—sigma gets it. no dropdowns. just vibes.
          </p>
        </div>

        <div className="bg-primary/10 rounded-lg p-6 border border-primary/20">
          <h3 className="text-xl font-semibold mb-4 text-primary">pro tip</h3>
          <p className="text-lg text-foreground/80">
            got a jira ticket or github issue or slack reminders as tasks? 
            mark them done in sigma, and they&apos;re done everywhere else. no more context switching.
          </p>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12 pt-8 border-t border-border">
          <h2 className="text-2xl font-semibold mb-4">ready to simplify your task management?</h2>
          <p className="text-muted-foreground mb-8">
            join sigma today and experience a more natural way to manage tasks.
          </p>
          <button className="bg-primary text-primary-foreground px-8 py-4 rounded-md hover:bg-primary/90 text-lg font-medium">
            get started
          </button>
        </div>
      </div>
    </div>
  );
} 