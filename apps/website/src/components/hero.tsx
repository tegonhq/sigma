import { Badge, Button, Card } from '@redplanethq/ui';
import { RiGithubFill } from '@remixicon/react';
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
        <p className="text-lg text-left max-w-[800px] mb-8 font-normal text-muted-foreground">
          Sigma learns your style, organizes your day, and sweeps up the
          busywork—auto-creating tasks, drafting replies, and running routine
          workflows—so you can focus on what truly matters.
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
        <div className="flex flex-col md:flex-row gap-2">
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
          <div className="flex items-center ml-1 gap-1">
            Backed by{' '}
            <Badge className="bg-[#FF6600] text-white text-base font-mono">
              Y
            </Badge>
          </div>
        </div>
      </Container>
    </section>
  );
};
