import { Section, TaskItem } from '../components';

export const Personalisation = () => {
  return (
    <Section name="Personalisation" color="#4187C0" id="personalisation">
      <div className="flex flex-col">
        <h3 className="text-[40px] font-semibold text-foreground mb-1 text-left flex gap-1 items-center">
          Tell sigma how you work;
          <span className="text-primary">it does the work.</span>
        </h3>
        <p className="text-md text-muted-foreground text-left">
          Write a rule or instruction in plain English and let Sigma take care
          of the rest. For example:
          <ul className="list-disc ml-6 mt-2">
            <li>When a GitHub pull request or issue is assigned to me, automatically add a task in Sigma.</li>
            <li>Turn each bookmarked Slack message into a Sigma task for its action items.</li>
            <li>Post a comment on every new issue opened in tegonhq/sigma.</li>
          </ul>
        </p>

        <h3 className="text-xl font-semibold text-foreground mb-1 mt-7 text-left flex gap-1 items-center">
          Signals
        </h3>
        <p className="text-base text-muted-foreground text-left">
        It is your editable profile that learns your preferences and automates tasks.
        <ul className="list-disc ml-6 mt-2">
            <li>Remembers what matters: <i>"No meetings after 6 pm"</i>, <i>"Reply in a direct tone"</i>, <i>"I prefer Airbnbs."</i></li>
            <li>Acts on simple rules: "When a GitHub issue is assigned to me, create a task."</li>
            <li>Keeps you in control: edit or erase anything—Sigma stores only what you approve.</li>
        </ul>
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

      </div>

      <div className="flex flex-col mt-7">
        <h3 className="text-xl font-semibold text-foreground mb-1 text-left flex gap-1 items-center">
          Daily Sync
        </h3>
        <p className="text-base text-muted-foreground text-left">
          Kick start your day with a 30-second summary of today&apos;s top priorities, deadlines - plan fast, then get back to work.
        </p>

        <div className="flex justify-center w-full py-7 lg:py-9">
          <div className="flex w-full max-w-[600px] mx-auto shrink-0 flex-col overflow-hidden rounded p-4 bg-background-3">
            <h3 className="text-md font-semibold">
              Today&apos;s Key Priorities - Friday, May 9th
            </h3>
            <div className="flex flex-col gap-2 mt-4 text-sm">
              <p><strong>8:30 AM – 11:30 AM</strong><br />
              <TaskItem title="Feat: Daily Sync" number="26" github />— knock out the cluster of related tasks while energy is high.
              </p>
              <p><strong>2:00 – 4:00 PM</strong><br />
              <TaskItem
                  title="Ordered/unordered list when selected in a page to
                      convert to task should get converted to task"
                  number="12"
                />
              — due 6:30 PM; start right after lunch for an uninterrupted work block.
              </p>
              <p><strong>4:00 – 6:00 PM</strong><br />
              <TaskItem
                  title="Improve: Task extension in pages"
                  number="41"
                  github
                />{' '}
              — follows naturally from the earlier list-to-task work and keeps dev context consistent.
              </p>
              <p><strong>Defer to tomorrow morning:</strong><br />
              <TaskItem title="Reply: to GCP support" number="18" google />  — best tackled fresh.
              </p>
              <p>
              Stay focused on these four windows and you'll clear today's must-dos with time to spare.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
};
