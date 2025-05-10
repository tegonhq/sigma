import { RiGithubFill } from '@remixicon/react';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  DocumentLine,
} from '@tegonhq/ui';
import { EditorContent, useEditor } from '@tiptap/react';
import { RefreshCcw, Zap } from 'lucide-react';

import { Gmail } from 'src/icons';

import { DailyPlanner } from './features/daily-planner';
import { Lists } from './features/lists';
import { Tasks } from './features/task';
import { Footer } from './footer';
import { Header } from './header';
import { Hero } from './hero';
import { CONTENT, contextExtensions, Section, TaskItem } from './utils';

const Personalisation = () => {
  const editor = useEditor({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    extensions: contextExtensions as any,
    editable: true,
    content: CONTENT,
  });

  return (
    <Section name="Personalisation" color="#4187C0" id="personalisation">
      <div className="flex flex-col">
        <h3 className="text-xl font-semibold text-foreground mb-1 text-left flex gap-1 items-center">
          <Zap size={20} />
          AI workflow automations
        </h3>
        <p className="text-base text-muted-foreground text-left">
          Write a rule or instruction in plain English and let Sigma take care
          of the rest. For example:
        </p>

        <div className="flex flex-col md:flex-row mt-4 gap-4">
          <Card className="flex-1">
            <CardHeader>
              <CardTitle className="flex gap-2 items-center">
                <RiGithubFill size={20} className="shrink-0" /> Github PR /
                Slack Bookmark → Sigma Task
              </CardTitle>
              <CardDescription>
                Whenever a github PR/issue is assigned to you, create a sigma
                task automatically.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="flex-1">
            <CardHeader>
              <CardTitle className="flex gap-2 items-center">
                <Gmail size={20} className="shrink-0" /> Meeting Summary → Sigma
                Tasks
              </CardTitle>
              <CardDescription>
                Extract meeting notes summary from email or slack and create the
                tasks in sigma from the actionable items.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      <div className="flex flex-col mt-7">
        <h3 className="text-xl font-semibold text-foreground mb-1 text-left flex gap-1 items-center">
          <DocumentLine size={20} />
          Signals
        </h3>
        <p className="text-base text-muted-foreground text-left">
          Sigma keeps a living &apos;about-you&apos; doc—fully editable by
          you—so the agent grows smarter without creeping you out. Below is an
          example:
        </p>

        <div className="flex w-full items-center justify-center mt-4 bg-background-3 rounded">
          <EditorContent
            editor={editor}
            className="bg-background-3 w-full h-full border-none outline-none px-4 pt-2 rounded py-4"
          />
        </div>

        <p className="text-base text-muted-foreground text-lef mt-2">
          Note: Most agents hoard data in the dark. Signals lets you decide what
          user info to be stored—edit, add, or wipe anything anytime.
        </p>
      </div>

      <div className="flex flex-col mt-7">
        <h3 className="text-xl font-semibold text-foreground mb-1 text-left flex gap-1 items-center">
          <RefreshCcw size={20} />
          Daily Sync
        </h3>
        <p className="text-base text-muted-foreground text-left">
          Wake up to a brief summary of today&apos;s top priorities, deadlines,
          meetings pulled from all tools you use. With the help of daily
          sync—plan your day in 30 secs, then go back to building.
        </p>

        <div className="flex justify-center w-full py-7 lg:py-9">
          <div className="flex w-full max-w-[600px] mx-auto shrink-0 flex-col overflow-hidden rounded p-4 bg-background-3">
            <h3 className="text-md font-semibold">
              Morning Workout & Task Planning for May 8th
            </h3>
            <p className="text-muted-foreground text-xs"> Today </p>
            <p className="flex flex-col gap-2 mt-4 text-sm">
              <p>
                Good morning! It&apos;s Friday, May 9th—ideal for a compound
                workout. Based on your recent sessions (Lower on May 8th, Pull
                on May 6th, Push on May 5th), go for the{' '}
                <strong>Balanced Push Routine</strong> today.
              </p>

              <p>
                The morning, after your workout (around 8:30 AM), would be ideal
                for working on{' '}
                <TaskItem title="Feat: Daily Sync" number="26" github />
                since you have multiple related tasks on this feature. Your day
                has one time-sensitive task:{' '}
                <TaskItem
                  title="Ordered/unordered list when selected in a page to
                      convert to task should get converted to task"
                  number="12"
                />
                due by 6:30 PM. I suggest tackling this after lunch around 2:00
                PM when you&apos;ll have several focused hours before the
                deadline.
              </p>

              <p>
                In the afternoon, group related dev tasks to reduce context
                switching. Around 4:00 PM, work on{' '}
                <TaskItem
                  title="Improve: Task extension in pages"
                  number="41"
                  github
                />{' '}
                to complement your earlier list-to-task work. If done,{' '}
                <TaskItem title="Reply: to GCP support" number="18" google /> is
                a good task for tomorrow morning when you&apos;re fresh.
              </p>
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
};

const TaskManagement = () => {
  return (
    <Section name="Task management" color="#1C91A8" id="task_management">
      <div className="flex flex-col md:flex-row gap-4 mb-7 lg:mb-9">
        <Tasks />
        <Lists />
        <DailyPlanner />
      </div>
    </Section>
  );
};

const Chat = () => {
  return (
    <Section name="Chat" color="#4187C0" id="chat" className="mb-7 lg:mb-9">
      <div className="flex flex-col flex-1">
        <h3 className="text-xl font-semibold text-foreground mb-1 text-left flex gap-1 items-center">
          Find answers, not files.
        </h3>
        <p className="text-base text-muted-foreground text-left">
          The average worker loses 9 hours a week hunting for information. Sigma
          Chat skips the scavenger hunt—because it&apos;s already plugged into
          your Calendar, Email, Slack, Jira, and GitHub. Just ask
        </p>
      </div>
    </Section>
  );
};

const Index = () => {
  return (
    <div className="h-[100vh] flex flex-col overflow-y-auto px-4">
      <Header />
      <Hero />

      <Personalisation />
      <TaskManagement />
      <Chat />
      <Footer />
    </div>
  );
};

export default Index;
