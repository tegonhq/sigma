import { Card, Button } from '@tegonhq/ui';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  image?: string;
}

const FeatureCard = ({ title, description, icon, image }: FeatureCardProps) => {
  return (
    <Card className="p-4 md:p-6 bg-background border-border hover:shadow-lg transition-all duration-300 rounded-xl group">
      {/* Feature Image/Screenshot */}
      {image && (
        <div className="mb-4 rounded-lg overflow-hidden bg-muted/10 h-40 md:h-48 flex items-center justify-center border border-border/50">
          <div className="text-muted-foreground/60 text-sm font-medium">Feature Screenshot</div>
        </div>
      )}
      
      {/* Icon and Title */}
      <div className="flex items-center gap-3 mb-3">
        <div className="text-blue-600 group-hover:text-blue-700 transition-colors">{icon}</div>
        <h3 className="text-lg md:text-xl font-semibold text-foreground">{title}</h3>
      </div>
      
      {/* Description */}
      <p className="text-muted-foreground text-sm md:text-base leading-relaxed">{description}</p>
    </Card>
  );
};

export const UseCases = () => {
  return (
    <section className="w-full py-12 md:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12 md:mb-16 lg:mb-20">
          {/* Small header text */}
          <div className="text-xs md:text-sm text-muted-foreground/80 font-medium mb-3 md:mb-4 tracking-wider uppercase">
            FOREVER SHIPPING
          </div>
          
          {/* Main title */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 md:mb-6 text-blue-600 leading-tight">
            Sigma ensures you focus on things that matters
          </h2>
          
          {/* Subtitle */}
          <p className="text-lg md:text-xl lg:text-2xl max-w-4xl mx-auto text-muted-foreground mb-6 md:mb-8 leading-relaxed">
            Incredibly powerful out of the box. And it only gets better as, every week, there&apos;s always a new version.
          </p>
          
          {/* Optional link */}
          <Button variant="ghost" className="text-blue-600 hover:text-blue-700 text-base md:text-lg">
            View all features →
          </Button>
        </div>

        {/* Hero Feature Display */}
        <div className="mb-12 md:mb-16 lg:mb-20">
          <Card className="p-6 md:p-8 lg:p-10 bg-background border-border rounded-2xl">
            <div className="bg-muted/20 rounded-xl h-64 md:h-80 lg:h-96 flex items-center justify-center">
              <div className="text-center">
                <div className="text-muted-foreground text-lg mb-2">Hero Feature Display</div>
                <div className="text-muted-foreground/60 text-sm">Main showcase area</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-10">
          {/* Daily Brief Feature Card */}
          <FeatureCard
            title="Daily Brief"
            description="2-minute summary on today's priorities, who needs you, and what's slipping through."
            icon={
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            }
            image="daily-brief"
          />

          {/* All Tasks, One Place Feature Card */}
          <FeatureCard
            title="All Tasks, One Place"
            description="Sigma pulls tasks from Slack, GitHub, Gmail, Linear, and more—based on simple rules you set."
            icon={
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
              </svg>
            }
            image="all-tasks"
          />

          {/* Automate the Busywork Feature Card */}
          <FeatureCard
            title="Automate the Busywork"
            description="From urgent emails to PR summaries, Sigma turns your rules into actions—no clicks needed."
            icon={
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            }
            image="automate-busywork"
          />

          {/* Lists Feature Card */}
          <FeatureCard
            title="Lists"
            description="Your Swiss-army doc for everything—code snippets, side-projects, grocery runs."
            icon={
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
              </svg>
            }
            image="lists"
          />
        </div>
      </div>
    </section>
  );
}; 