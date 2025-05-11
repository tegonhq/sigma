import { Section, TaskItem } from '../components';

export const Personalisation = () => {
  return (
    <Section name="Personalisation" color="#4187C0" id="personalisation">
      <div className="flex flex-col">
        <h3 className="text-[40px] font-semibold text-foreground mb-1 text-left flex gap-1 items-center">
          Your workflow, <span className="text-primary">your way</span>
        </h3>
        <p className="text-md text-muted-foreground text-left">
          Write a rule or instruction in plain English and let Sigma take care
          of the rest. For example:
        </p>

        <h3 className="text-xl font-semibold text-foreground mb-1 mt-7 text-left flex gap-1 items-center">
          Signals
        </h3>
        <p className="text-base text-muted-foreground text-left">
          Signals is your source of truth—where context meets action. It
          remembers what matters to you (like <i>“You prefer Airbnb”</i> or{' '}
          <i>“You’re a developer at Suse”</i>) and turns that memory into
          intelligent workflows. From updating your preferences to triggering
          automations based on emails or meetings, Signals helps you work
          smarter—on your terms
        </p>

        <div className="w-full mt-4 overflow-hidden rounded-lg">
          <video
            className="w-full h-auto"
            autoPlay
            loop
            muted
            playsInline
            controls={false}
          >
            <source
              src="https://integrations.mysigma.ai/videos/signal.mp4"
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </video>
        </div>

        {/* <div className="flex flex-col md:flex-row mt-4 gap-4">
          <Card className="flex-1">
            <CardHeader>
              <CardTitle className="flex gap-2 items-center">
                <RiGithubFill size={20} className="shrink-0" /> Github PR /
                Slack Bookmark → Sigma Task
              </CardTitle>
              <CardDescription>
                Whenever a github PR/issue is assigned to you, create a sigma
                task automatically.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="flex-1">
            <CardHeader>
              <CardTitle className="flex gap-2 items-center">
                <Gmail size={20} className="shrink-0" /> Meeting Summary → Sigma
                Tasks
              </CardTitle>
              <CardDescription>
                Extract meeting notes summary from email or slack and create the
                tasks in sigma from the actionable items.
              </CardDescription>
            </CardHeader>
          </Card>
        </div> */}

        <p className="text-base text-muted-foreground text-lef mt-2">
          Note: Most agents hoard data in the dark. Signals lets you decide what
          user info to be stored—edit, add, or wipe anything anytime.
        </p>
      </div>

      <div className="flex flex-col mt-7">
        <h3 className="text-xl font-semibold text-foreground mb-1 text-left flex gap-1 items-center">
          Daily Sync
        </h3>
        <p className="text-base text-muted-foreground text-left">
          Wake up to a brief summary of today&apos;s top priorities, deadlines,
          meetings pulled from all tools you use. With the help of daily
          sync—plan your day in 30 secs, then go back to building.
        </p>

        <div className="flex justify-center w-full py-7 lg:py-9">
          <div className="flex w-full max-w-[600px] mx-auto shrink-0 flex-col overflow-hidden rounded p-4 bg-background-3">
            <h3 className="text-md font-semibold">
              Morning Workout & Task Planning for May 8th
            </h3>
            <p className="text-muted-foreground text-xs"> Today </p>
            <p className="flex flex-col gap-2 mt-4 text-sm">
              <p>
                Good morning! It&apos;s Friday, May 9th—ideal for a compound
                workout. Based on your recent sessions (Lower on May 8th, Pull
                on May 6th, Push on May 5th), go for the{' '}
                <strong>Balanced Push Routine</strong> today.
              </p>

              <p>
                The morning, after your workout (around 8:30 AM), would be ideal
                for working on{' '}
                <TaskItem title="Feat: Daily Sync" number="26" github />
                since you have multiple related tasks on this feature. Your day
                has one time-sensitive task:{' '}
                <TaskItem
                  title="Ordered/unordered list when selected in a page to
                      convert to task should get converted to task"
                  number="12"
                />
                due by 6:30 PM. I suggest tackling this after lunch around 2:00
                PM when you&apos;ll have several focused hours before the
                deadline.
              </p>

              <p>
                In the afternoon, group related dev tasks to reduce context
                switching. Around 4:00 PM, work on{' '}
                <TaskItem
                  title="Improve: Task extension in pages"
                  number="41"
                  github
                />{' '}
                to complement your earlier list-to-task work. If done,{' '}
                <TaskItem title="Reply: to GCP support" number="18" google /> is
                a good task for tomorrow morning when you&apos;re fresh.
              </p>
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
};
