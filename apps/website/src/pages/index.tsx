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

import {
  Footer,
  Header,
  Hero,
  CONTENT,
  contextExtensions,
  Section,
  TaskItem,
} from '../components';
import { DailyPlanner } from '../features/daily-planner';
import { Lists } from '../features/lists';
import { Tasks } from '../features/task';
import { Personalisation } from '../features/personalisation';

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
