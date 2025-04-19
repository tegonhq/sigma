import { AI } from '@tegonhq/ui';
import Link from 'next/link';
import { RiArrowLeftLine } from '@remixicon/react';

export default function AgentsFeature() {
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
              <AI size={24} className="text-foreground" />
              <h1 className="text-2xl font-semibold">agents</h1>
            </div>
          </div>
          <h2 className="text-[40px] font-mono text-left">
            because your brain deserves an assistant
          </h2>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[800px] mt-8 space-y-8 text-left px-4 leading-[32px] mb-10">
        <p className="text-xl text-foreground/80">
          sigma isn&apos;t just a task manager—it&apos;s your ai command center. assign agents to automate 
          the grind so you can focus on the fun stuff (like coding).
        </p>

        <h3 className="text-2xl font-semibold mt-12">meet the squad</h3>

        <div className="bg-card rounded-lg p-6 border border-border">
          <h3 className="text-xl font-semibold mb-4">task agent</h3>
          <p className="text-lg text-foreground/80 mb-4">
            chat with sigma like a teammate:
          </p>
          <div className="space-y-2 text-lg text-foreground/80">
            <p>&quot;add a pr review for #187 tomorrow at 2pm&quot; → done.</p>
            <p>&quot;create a vietnam trip list with flights, visas, and pho spots&quot; → booms a prepped list.</p>
            <p>&quot;what&apos;s blocking t-42?&quot; → instantly surfaces notes, subtasks, or slack threads.</p>
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border">
          <h3 className="text-xl font-semibold mb-4">coding agent</h3>
          <p className="text-lg text-foreground/80 mb-4">
            tired of boilerplate fixes? assign bugs like:
          </p>
          <div className="space-y-2 text-lg text-foreground/80">
            <p>&quot;update deprecated api calls in auth-service.js&quot; → agent writes the pr, you review.</p>
            <p>&quot;fix typo in docs&quot; → agent commits the change. no context switching.</p>
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border">
          <h3 className="text-xl font-semibold mb-4">browser agent</h3>
          <p className="text-lg text-foreground/80 mb-4">
            let sigma handle life&apos;s busywork:
          </p>
          <div className="space-y-2 text-lg text-foreground/80">
            <p>&quot;find cheap flights to hanoi in december&quot; → agent scours the web, dumps options into your task.</p>
            <p>&quot;book the 2pm flight from sf&quot; → agent fills your deets, clicks &quot;buy.&quot; trust optional (we get it).</p>
          </div>
        </div>

        <div className="bg-primary/10 rounded-lg p-6 border border-primary/20">
          <h3 className="text-xl font-semibold mb-4 text-primary">pro tip</h3>
          <p className="text-lg text-foreground/80">
            stuck in a sprint crunch? assign the coding agent to auto-fix lint errors or update dependencies. 
            ship faster, stress less.
          </p>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12 pt-8 border-t border-border">
          <h2 className="text-2xl font-semibold mb-4">ready to meet your ai team?</h2>
          <p className="text-muted-foreground mb-8">
            join sigma today and experience the future of ai-assisted productivity.
          </p>
          <button className="bg-primary text-primary-foreground px-8 py-4 rounded-md hover:bg-primary/90 text-lg font-medium">
            get started
          </button>
        </div>
      </div>
    </div>
  );
} 