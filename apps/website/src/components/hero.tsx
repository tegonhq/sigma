import { RiGithubFill } from '@remixicon/react';
import { Badge, Button, Card } from '@tegonhq/ui';
import Image from 'next/image';

import { Container, DownloadButton } from './utils';

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

        <Container className="!pt-0 pb-7">
          <Card className="w-full max-w-6xl mx-auto border-border border-1 shadow-1 rounded">
            <div className="flex justify-center">
              <Image
                src="/main.png"
                alt="logo"
                width={1080}
                height={720}
                className="sm:w-40 sm:h-40 md:w-60 md:h-60 lg:w-80 lg:h-80 rounded"
                style={{
                  width: 'auto',
                  height: 'auto',
                }}
              />
            </div>
          </Card>
        </Container>
      </Container>

      <Container className="gap-2">
        <div className="flex gap-2">
          <DownloadButton />

          <Button
            size="xl"
            variant="secondary"
            className="gap-2 items-center"
            onClick={() =>
              window.open('https://github.com/tegonhq/sigma', '_blank')
            }
          >
            <RiGithubFill size={16} />
            Star us
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
