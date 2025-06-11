import { Footer, GitHubBanner, Header, Hero, Section } from '../components';
import { Automations } from '../features/automations';
import { Integrations } from '../features/integrations';

const Index = () => {
  return (
    <div className="flex flex-col">
      <Header />
      <Hero />
      <Automations />
      <Integrations />
      <Footer />
      <GitHubBanner />
    </div>
  );
};

export default Index;
