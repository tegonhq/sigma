import {
  AI,
  Button,
  CalendarLine,
  IssuesLine,
  Project,
  TeamLine,
} from '@tegonhq/ui';
import Image from 'next/image';
import { Feature } from 'src/components';

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
        <h2 className="text-[40px] font-mono mt-4 text-center">
          a new way to work
        </h2>
      </div>

      <div className="max-w-[800px] mt-8 space-y-6 text-left px-4 leading-[40px] mb-10">
        <p className="text-xl text-foreground/80">
          The way we work is transforming. No more fragmented workflows, no more
          scattered focus. The future of development is here—where everything
          just works, together.
        </p>

        <p className="text-xl text-foreground/80">
          Sigma is your intelligent workspace, built for this new era—where you
          can <b>aggregate</b>, <b>plan</b>, and <b>execute</b> seamlessly.
        </p>

        <p className="text-xl text-foreground/80">
          With <Feature Icon={<IssuesLine size={22} />} text="Task" />, work is
          automatically tracked and generated, ensuring nothing slips through.
          <Feature Icon={<CalendarLine size={22} />} text="My day" /> aligns
          your day to your energy, optimizing focus and flow.
          <Feature Icon={<Project size={22} />} text="Lists" /> blend
          checklists, notes, and code snippets effortlessly, keeping everything
          within reach. And with
          <Feature Icon={<AI size={22} />} text="Agents" />
          —including a coding agent, browser agent, and more to come—you have an
          always-on assistant for research, automation, and execution.
        </p>

        <p className="text-xl text-foreground/80">
          But Sigma is more than a productivity tool—it&apos;s your developer
          control center. As it evolves, it will anticipate your needs, automate
          workflows, and help you stay in the zone.
        </p>

        <p className="text-xl text-foreground/80">
          The next generation of work is here. Join us in shaping it.
        </p>

        <p className="text-xl text-foreground/80"> -- The Sigma team </p>

        <div className="flex justify-center w-full p-2">
          <Button variant="secondary" size="xl" className="gap-2 text-lg px-3">
            <TeamLine size={16} /> Join waitlist
          </Button>
        </div>
      </div>
    </div>
  );
}
