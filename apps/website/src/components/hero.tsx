import { RiGithubFill } from '@remixicon/react';
import { Badge, Button, Card, Separator } from '@tegonhq/ui';
import Image from 'next/image';

import { Container, DownloadButton } from './utils';

export const Hero = () => {
  return (
    <section className="w-full py-8 md:py-16">
      <Container className="flex flex-col items-center text-center">
        {/* Title */}
        <h1 className="text-3xl md:text-4xl lg:text-[48px] font-bold leading-tight mb-4 md:mb-6 tracking-tight text-foreground max-w-[800px]">
         Your AI Assistant That Starts Before You Do
        </h1>
        
        {/* Subheading */}
        <p className="text-base md:text-lg max-w-[800px] mb-6 md:mb-8 font-normal text-muted-foreground px-4">
          Sigma connects to Slack, GitHub, Linear & Gmail — summarises PRs, drafts emails, creates issues, and clears the busywork so you stay in flow.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4 md:mb-6">
          <DownloadButton />
          <Button
            size="xl"
            variant="secondary"
            className="gap-2 items-center w-fit"
            onClick={() =>
              window.open('https://github.com/tegonhq/sigma', '_blank')
            }
          >
            <RiGithubFill size={16} />
            Star us
          </Button>
        </div>

        {/* Availability text */}
        <div className="flex items-center gap-1 mb-8 md:mb-12">
          <span className="text-sm md:text-base text-muted-foreground">Available for macOS, Linux, and soon for Windows</span>
        </div>

        {/* Main content box */}
        <Card className="w-full max-w-5xl mx-auto border-border shadow-lg rounded-2xl p-3 md:p-4 bg-background">
          {/* Features section */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 mb-4 md:mb-6">
            {/* Daily Brief */}
            <div className="text-center md:text-left space-y-2 flex-1">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <div className="w-6 h-6 md:w-8 md:h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-semibold text-xs md:text-sm">📊</span>
                </div>
                <h3 className="text-base md:text-lg font-semibold text-foreground">Chat</h3>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
              Ask across your tools — Sigma answers and acts, from email drafts to updating issues.
              </p>
            </div>
            
            {/* Separator 1 */}
            <div className="hidden md:flex">
              <Separator orientation="vertical" className="h-16" />
            </div>
            
            {/* Memory */}
            <div className="text-center md:text-left space-y-2 flex-1">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <div className="w-6 h-6 md:w-8 md:h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-semibold text-xs md:text-sm">🧠</span>
                </div>
                <h3 className="text-base md:text-lg font-semibold text-foreground">Memory</h3>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                Stores your tone, style, role & contacts—adapts as it learns from you.
              </p>
            </div>
            
            {/* Separator 2 */}
            <div className="hidden md:flex">
              <Separator orientation="vertical" className="h-16" />
            </div>
            
            {/* Rules */}
            <div className="text-center md:text-left space-y-2 flex-1">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <div className="w-6 h-6 md:w-8 md:h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-semibold text-xs md:text-sm">⚡</span>
                </div>
                <h3 className="text-base md:text-lg font-semibold text-foreground">Rules</h3>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                Tell sigma in natural language what to automate—like alerts, tasks, or any manual work.
              </p>
            </div>
          </div>
          
          {/* Visual separator */}
          <Separator className="my-3 md:my-4" />
          
          {/* Hero image section */}
          <div className="flex justify-center pt-1 md:pt-2">
            <div className="w-full max-w-3xl md:max-w-4xl">
              <Image
                src="/main.png"
                alt="Sigma AI Assistant Interface"
                width={1080}
                height={720}
                className="w-full h-auto rounded-lg shadow-sm"
                style={{
                  width: 'auto',
                  height: 'auto',
                }}
              />
            </div>
          </div>
        </Card>

        {/* Backed by Y Combinator */}
        <div className="flex items-center gap-1 mt-6 md:mt-8">
          <span className="text-sm text-muted-foreground">Backed by</span>
          <Badge className="bg-[#FF6600] text-white text-base font-mono">
            Y
          </Badge>
          <span className="text-sm text-muted-foreground">Combinator</span>
        </div>
      </Container>
    </section>
  );
};
