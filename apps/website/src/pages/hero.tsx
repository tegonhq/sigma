import { RiAppleFill } from '@remixicon/react';
import { Badge, Button } from '@tegonhq/ui';

import { Container } from './utils';

export const Hero = () => {
  return (
    <section className="w-full">
      <Container className="flex flex-col items-start">
        <h1 className="text-[55px] font-bold text-left leading-tight mb-4 tracking-tight text-foreground max-w-[800px]">
          Your{' '}
          <span className="bg-primary bg-clip-text text-transparent">
            Personal AI Assistant
          </span>{' '}
          <br /> now in a todo app
        </h1>
        <p className="text-lg text-left max-w-[500px] mb-8 font-normal text-muted-foreground">
          Sigma is your AI command center that turns plans into action. It
          learns your style, grabs context from GitHub / Slack / email, and
          clears the busywork so you stay in flow.
        </p>

        <div className="flex gap-2 mt-6 mb-6 z-10"></div>
      </Container>

      <Container className="gap-2">
        <div className="flex gap-2">
          <Button size="xl" variant="default" className="gap-2 items-center">
            <RiAppleFill size={14} />
            Download
          </Button>
        </div>
        <div className="flex items-center gap-1">
          Backed by{' '}
          <Badge className="bg-[#FF6600] text-white text-base font-mono">
            Y
          </Badge>
        </div>
      </Container>
    </section>
  );
};
