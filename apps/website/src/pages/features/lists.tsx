import { Project } from '@tegonhq/ui';
import Link from 'next/link';
import { RiArrowLeftLine } from '@remixicon/react';

export default function ListsFeature() {
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
              <Project size={24} className="text-foreground" />
              <h1 className="text-2xl font-semibold">lists</h1>
            </div>
          </div>
          <h2 className="text-[40px] font-mono text-left">
            where your adhd meets your ocd.
          </h2>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[800px] mt-8 space-y-8 text-left px-4 leading-[32px] mb-10">
        <p className="text-xl text-foreground/80">
          lists are your swiss army knife for organizing anything—code snippets, meeting notes, weekend plans, 
          or that side project you&apos;re procrastinating on. think of them as flexible docs where chaos becomes clarity.
        </p>

        <div className="bg-card rounded-lg p-6 border border-border">
          <h3 className="text-xl font-semibold mb-4">mix tasks, notes, and more</h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-lg font-medium mb-2">work</h4>
              <p className="text-lg text-foreground/80">
                a &quot;q4 migration plan&quot; list could have headers, pr links, and subtasks like &quot;update dependencies.&quot;
              </p>
            </div>
            <div>
              <h4 className="text-lg font-medium mb-2">personal</h4>
              <p className="text-lg text-foreground/80">
                a &quot;camping trip&quot; list with checklists (tent, snacks), weather screenshots, and a loose note like 
                &quot;ask dave about campfire recipes.&quot;
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border">
          <h3 className="text-xl font-semibold mb-4">tasks ↔ lists, made easy</h3>
          <div className="space-y-4">
            <p className="text-lg text-foreground/80">
              add a checklist (e.g., &quot;fix auth bug 🔐&quot;) → boom, it&apos;s a tracked task in your tasks section, 
              linked to the list.
            </p>
            <p className="text-lg text-foreground/80">
              use <span className="font-mono bg-muted px-2 py-1 rounded">[[t-42]]</span> to embed existing tasks 
              (like that jira ticket you&apos;ve been avoiding).
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12 pt-8 border-t border-border">
          <h2 className="text-2xl font-semibold mb-4">ready to organize your chaos?</h2>
          <p className="text-muted-foreground mb-8">
            join sigma today and experience a more natural way to organize your work and life.
          </p>
          <button className="bg-primary text-primary-foreground px-8 py-4 rounded-md hover:bg-primary/90 text-lg font-medium">
            get started
          </button>
        </div>
      </div>
    </div>
  );
} 