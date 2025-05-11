import { Footer, Header, Hero, Section } from '../components';
import { DailyPlanner } from '../features/daily-planner';
import { Lists } from '../features/lists';
import { Personalisation } from '../features/personalisation';
import { Tasks } from '../features/task';

const TaskManagement = () => {
  return (
    <Section name="Task management" color="#1C91A8" id="task_management">
      <h3 className="text-[40px] font-semibold text-foreground mb-1 text-left flex gap-1 items-center">
        Your day, <span className="text-primary">Organised</span>
      </h3>
      <p className="text-md text-muted-foreground text-left">
        Keep tasks, notes, lists, and priorities in one clear view—so you can
        focus on what matters, without the clutter.
      </p>

      <div className="flex flex-col md:flex-row gap-4 my-7 lg:my-9">
        <Tasks />
        <Lists />
        <DailyPlanner />
      </div>

      <div className="w-full mt-4 overflow-hidden rounded-lg">
        <video
          className="w-full h-auto"
          autoPlay
          loop
          muted
          playsInline
          controls={false}
        >
          <source
            src="https://integrations.mysigma.ai/videos/task_management.mp4"
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>
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
          your Calendar, Email, Slack, Jira, and GitHub. Just ask.
        </p>
      </div>

      <div className="w-full mt-4 overflow-hidden rounded-lg">
        <video
          className="w-full h-auto"
          autoPlay
          loop
          muted
          playsInline
          controls={false}
        >
          <source
            src="https://integrations.mysigma.ai/videos/chat.mp4"
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>
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
