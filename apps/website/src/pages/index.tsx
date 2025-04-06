import {
  AI,
  Badge,
  Button,
  CalendarLine,
  IssuesLine,
  Project,
} from '@tegonhq/ui';
import Image from 'next/image';

export default function Index() {
  return (
    <div className="h-[100vh] w-[100vw] bg-background flex flex-col items-center overflow-auto">
      <div className="p-2 w-full flex gap-2 flex-col items-center pt-10">
        <Image
          src="/logo_light.svg"
          alt="logo"
          key={1}
          width={50}
          height={50}
        />
        <h2 className="text-[40px] font-mono mt-4 text-center text-bold">
          a new way to work
        </h2>
      </div>

      <div className="max-w-[800px] mt-8 space-y-6 text-left px-4 leading-[40px] mb-10 lowercase">
        <p className="text-xl text-foreground/80">
          the way we work is transforming. no more fragmented workflows, no more
          scattered focus. the future of development is here—where everything
          just works, together.
        </p>

        <p className="text-xl text-foreground/80">
          sigma is your intelligent workspace, built for this new era—where you
          can <b>aggregate</b>, <b>plan</b>, and <b>execute</b> seamlessly.
        </p>

        <p className="text-xl text-foreground/80">
          with
          <Badge
            className="inline-flex h-8 items-center p-1.5 gap-1.5 relative top-0.5 mx-1.5 text-xl border-1 border-border rounded-md transition-transform hover:rotate-3"
            variant="secondary"
          >
            <IssuesLine size={20} /> task
          </Badge>
          , work is automatically tracked and generated, ensuring nothing slips
          through.
          <Badge
            className="inline-flex h-8 items-center p-2 gap-1.5 relative top-0.5 mx-1.5 text-xl border-1 border-border rounded-md transition-transform hover:rotate-3"
            variant="secondary"
          >
            <CalendarLine size={20} /> my day
          </Badge>
          aligns your day to your energy, optimizing focus and flow.
          <Badge
            className="inline-flex h-8 items-center p-2 gap-1.5 relative top-0.5 mx-1.5 text-xl border-1 border-border rounded-md transition-transform hover:rotate-3"
            variant="secondary"
          >
            <Project size={20} /> lists
          </Badge>
          blend checklists, notes, and code snippets effortlessly, keeping
          everything within reach. and with
          <Badge
            className="inline-flex h-8 items-center p-2 gap-1.5 relative top-0.5 mx-1.5 text-xl border-1 border-border rounded-md transition-transform hover:rotate-3"
            variant="secondary"
          >
            <AI size={20} /> agents
          </Badge>
          —including a coding agent, browser agent, and more to come—you have an
          always-on assistant for research, automation, and execution.
        </p>

        <p className="text-xl text-foreground/80">
          but sigma is more than a productivity tool—it&apos;s your developer
          control center. as it evolves, it will anticipate your needs, automate
          workflows, and help you stay in the zone.
        </p>

        <p className="text-xl text-foreground/80">
          the next generation of work is here. join us in shaping it.
        </p>

        <p className="text-xl text-foreground/80"> -- the sigma team </p>

        <div className="flex justify-center w-full p-2">
          <Button variant="secondary" size="xl" className="gap-2 text-lg px-3">
            <Image
              src="/logo_light.svg"
              alt="logo"
              key={1}
              width={20}
              height={20}
            />{' '}
            join waitlist
          </Button>
        </div>
      </div>
    </div>
  );
}
