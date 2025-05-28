import { Button, Card } from '@tegonhq/ui';
import { Container } from './utils';

interface IntegrationCardProps {
  name: string;
  description: string;
  users: string;
  icon: React.ReactNode;
  status: 'Available' | 'Coming Soon';
}

const IntegrationCard = ({ name, description, users, icon, status }: IntegrationCardProps) => {
  return (
    <Card className="p-4 md:p-5 lg:p-6 bg-background border-border hover:shadow-md transition-shadow rounded-lg">
      <div className="flex items-start justify-between mb-3 md:mb-4">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center">{icon}</div>
          <div>
            <h3 className="font-semibold text-foreground text-sm md:text-base lg:text-lg">{name}</h3>
            <div className="text-xs md:text-sm text-muted-foreground font-medium">{users}</div>
          </div>
        </div>
        <div className={`text-xs px-2 py-1 rounded-full font-medium ${
          status === 'Available' 
            ? 'bg-green-100 text-green-700 border border-green-200' 
            : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
        }`}>
          {status}
        </div>
      </div>
      <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{description}</p>
    </Card>
  );
};

export const Integrations = () => {
  return (
    <section className="w-full py-12 md:py-16 lg:py-20">
      <Container className="flex flex-col items-center text-center">
        {/* Title */}
        <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-3 md:mb-4 lg:mb-6 text-blue-600">
          Growing integrations ecosystem
        </h2>
        
        {/* Subtitle */}
        <p className="text-base md:text-lg lg:text-xl max-w-2xl md:max-w-3xl mb-6 md:mb-8 lg:mb-10 text-muted-foreground px-4">
          Connect your favorite tools so Sigma can track, respond, and take{' '}
          action across your workflow. The more tools you connect, the smarter{' '}
          and more hands-on your assistant becomes.
        </p>
        
        {/* Call to action button */}
        <Button 
          size="lg" 
          className="mb-8 md:mb-10 lg:mb-12"
          onClick={() => window.open('https://github.com/tegonhq/sigma/issues/new', '_blank')}
        >
          Request integration →
        </Button>
        
        {/* Integrations Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 w-full max-w-7xl mb-6 md:mb-8 lg:mb-10 px-4">
          <IntegrationCard
            name="GitHub"
            description="Connect your repositories for seamless code management and PR tracking"
            users="2.5k+ connections"
            icon={
              <svg className="w-6 h-6 text-gray-900" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            }
            status="Available"
          />
          
          <IntegrationCard
            name="Slack"
            description="Stay updated with team communications and automate responses"
            users="1.8k+ connections"
            icon={
              <svg className="w-6 h-6 text-purple-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
              </svg>
            }
            status="Available"
          />
          
          <IntegrationCard
            name="Gmail"
            description="Manage emails efficiently with AI-powered drafting and organization"
            users="3.2k+ connections"
            icon={
              <svg className="w-6 h-6 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
              </svg>
            }
            status="Available"
          />
          
          <IntegrationCard
            name="Linear"
            description="Sync issues and track project progress automatically"
            users="950+ connections"
            icon={
              <svg className="w-6 h-6 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16l-6.776 6.776a.75.75 0 01-1.06 0L6.432 11.64a.75.75 0 010-1.06l1.06-1.061a.75.75 0 011.061 0l2.24 2.24 5.715-5.715a.75.75 0 011.06 0l1.061 1.06a.75.75 0 010 1.061z"/>
              </svg>
            }
            status="Available"
          />
          
          <IntegrationCard
            name="Jira"
            description="Streamline ticket management and project workflows"
            users="1.2k+ connections"
            icon={
              <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.571 11.513H0a5.218 5.218 0 0 0 5.232 5.215h2.13v2.057A5.215 5.215 0 0 0 12.575 24V12.518a1.005 1.005 0 0 0-1.005-1.005zm5.723-5.756H5.736a5.215 5.215 0 0 0 5.215 5.214h2.129V8.915A5.214 5.214 0 0 0 18.294 4.7V5.757zm5.701-5.756H11.429a5.215 5.215 0 0 0 5.215 5.215h2.129V2.958A5.215 5.215 0 0 0 23.995 0V.001z"/>
              </svg>
            }
            status="Available"
          />
          
          <IntegrationCard
            name="Notion"
            description="Sync your workspace and automate documentation workflows"
            users="Coming soon"
            icon={
              <svg className="w-6 h-6 text-gray-800" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z"/>
              </svg>
            }
            status="Coming Soon"
          />
        </div>
        
        {/* Footer text */}
        <div className="text-center px-4">
          <p className="text-sm md:text-base text-muted-foreground">
            And many more integrations coming soon.{' '}
            <button 
              className="text-blue-600 hover:text-blue-700 font-medium underline"
              onClick={() => window.open('https://github.com/tegonhq/sigma', '_blank')}
            >
              View all integrations →
            </button>
          </p>
        </div>
      </Container>
    </section>
  );
}; 