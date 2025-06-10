import { Footer, GitHubBanner, Header, Hero, Section } from '../components';
import { DailyPlanner } from '../features/daily-planner';
import { Lists } from '../features/lists';
import { Personalisation } from '../features/personalisation';
import { Tasks } from '../features/task';

const TaskManagement = () => {
  return <Tasks />;
};

const Index = () => {
  return (
    <div className="flex flex-col">
      <Header />
      <Hero />
      <Personalisation />
      <TaskManagement />
      <Footer />
      <GitHubBanner />
    </div>
  );
};

export default Index;
