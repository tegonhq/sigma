import { Button, Badge, cn } from '@tegonhq/ui';
import Image from 'next/image';
import useSWR from 'swr';
import {
  RiDiscordFill,
  RiGithubFill,
  RiBookOpenLine,
  RiUser3Line,
  RiExternalLinkLine,
  RiListCheck2,
  RiCalendar2Fill,
} from '@remixicon/react';
import React from 'react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function Container({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('max-w-3xl mx-auto px-4', className)}>{children}</div>
  );
}

function HeroSection() {
  return (
    <section className="w-full pt-32 pb-12 bg-background-2 text-black px-4 relative overflow-hidden">
      <Container className="flex flex-col items-start">
        <h1 className="text-[55px] font-bold text-left leading-tight mb-4 tracking-tight text-foreground max-w-[800px]">
          Your{' '}
          <span className="bg-gradient-to-r from-[#F48FD7] to-[#6528FD] bg-clip-text text-transparent">
            Personal AI Assistant
          </span>{' '}
          <br /> now in a todo app
        </h1>
        <p className="text-lg text-left max-w-[800px] mb-8 font-normal text-muted-foreground">
          Sigma is your AI command center that turns plans into action. It
          learns your style, grabs context from GitHub / Slack / email, and
          clears the busywork so you stay in flow.
        </p>
        <div className="relative z-10 mt-6 w-full flex justify-start">
          <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200 bg-white/80 backdrop-blur-md transition-transform hover:scale-[1.01]">
            <Image
              src="/today.png"
              alt="App Screenshot"
              width={800}
              height={400}
              className="object-cover"
            />
          </div>
        </div>
        <div className="flex gap-2 mt-6 mb-6 z-10">
          <a
            href="#download"
            className="bg-black text-white px-4 py-2 rounded-lg font-semibold shadow-sm hover:bg-gray-800 transition text-base focus-visible:ring-2 focus-visible:ring-gray-900"
          >
            Download for Mac
          </a>
          <a
            href="#download"
            className="bg-white text-gray-900 border border-gray-900 px-4 py-2 rounded-lg font-semibold shadow-sm hover:bg-gray-100 transition text-base focus-visible:ring-2 focus-visible:ring-gray-900"
          >
            Download for Linux
          </a>
        </div>
        <div className="flex items-center gap-2 mt-6 mb-4">
          <Badge
            className="bg-[#FF6600] text-white font-semibold text-base"
            style={{ fontFamily: 'monospace' }}
          >
            Y
          </Badge>
          <span className="text-base text-foreground font-medium">
            Backed by Y Combinator
          </span>
        </div>
      </Container>
    </section>
  );
}

function PersonalisationSection() {
  return (
    <section
      id="personalisation"
      className="w-full bg-background-2 py-12 flex flex-col items-center"
    >
      <Container className="flex flex-col gap-8">
        <div>
          <h2 className="text-2xl font-bold text-primary mb-2 text-left">
            Personalisation
          </h2>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1 text-left">
            Daily Sync
          </h3>
          <p className="text-base text-muted-foreground text-left">
            Wake up to a brief summary of today&apos;s top priorities,
            deadlines, meetings pulled from all tools you use. With the help of
            daily sync—plan your day in 30 secs, then go back to building.
          </p>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1 text-left flex items-center gap-2">
            <span>Signals</span>
            <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-blue-100 text-primary">
              <RiUser3Line size={18} />
            </span>
          </h3>
          <p className="text-base text-muted-foreground mb-3 text-left">
            Sigma keeps a living &apos;about-you&apos; doc—fully editable by
            you—so the agent grows smarter without creeping you out. Below is an
            example:
          </p>
          <div className="bg-white/80 border border-gray-200 rounded-xl shadow-sm p-6 flex flex-col gap-4">
            <div>
              <span className="font-semibold text-foreground text-lg">
                Work & Projects
              </span>
              <ul className="text-muted-foreground list-disc list-inside ml-4 mt-1">
                <li>
                  You&apos;re an Indian founder building Sigma, a todo app with
                  an AI personal assistant.
                </li>
                <li>
                  You often explore product-market fit and growth strategies for
                  B2B SaaS.
                </li>
              </ul>
            </div>
            <div>
              <span className="font-semibold text-foreground text-lg">
                Learning
              </span>
              <ul className="text-muted-foreground list-disc list-inside ml-4 mt-1">
                <li>
                  You&apos;re beefing up AI fundamentals and hands-on
                  agent-building skills (OpenAI API, prompting frameworks, RAG,
                  fine-tuning, etc.).
                </li>
                <li>
                  You prefer structured 28-day learning plans with a mix of
                  theory and practical, free/YouTube resources when possible.
                </li>
              </ul>
            </div>
            <div>
              <span className="font-semibold text-foreground text-lg">
                Health & Fitness
              </span>
              <ul className="text-muted-foreground list-disc list-inside ml-4 mt-1">
                <li>
                  You track nutrition closely (LDL, triglycerides, grade-1 fatty
                  liver) and request diet tweaks, supplement timing, and workout
                  plans.
                </li>
                <li>
                  You shifted from CrossFit to bodybuilding-style routines and
                  like warm-up / cool-down guidance.
                </li>
              </ul>
            </div>
            <div>
              <span className="font-semibold text-foreground text-lg">
                Communication preferences
              </span>
              <ul className="text-muted-foreground list-disc list-inside ml-4 mt-1">
                <li>
                  Concise summaries for straightforward facts, but detailed,
                  actionable breakdowns for complex topics.
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div>
          <p className="text-base text-muted-foreground text-left">
            Note: Most agents hoard data in the dark. Signals lets you decide
            what user info to be stored—edit, add, or wipe anything anytime.
          </p>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-2 text-left">
            AI workflow automations
          </h3>
          <p className="text-base md:text-lg text-muted-foreground mb-4 text-left">
            Write a rule or instruction in plain English and let Sigma take care
            of the rest. For example:
          </p>
          <div className="flex flex-col gap-3">
            <div className="bg-gray-100 border border-gray-200 rounded-lg px-4 py-3 text-sm text-foreground">
              <span className="font-semibold">
                Github PR / Slack Bookmark → Sigma Task:
              </span>{' '}
              Whenever a github PR/issue is assigned to you, create a sigma task
              automatically.
            </div>
            <div className="bg-gray-100 border border-gray-200 rounded-lg px-4 py-3 text-sm text-foreground">
              <span className="font-semibold">
                Meeting Summary → Sigma Tasks:
              </span>{' '}
              Extract meeting notes summary from email or slack and create the
              tasks in sigma from the actionable items.
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function TaskManagementSection() {
  return (
    <section
      id="task-management"
      className="w-full bg-background-2 py-12 flex flex-col items-center"
    >
      <Container className="flex flex-col gap-8">
        <div>
          <h2 className="text-2xl font-bold text-green-600 mb-2 text-left">
            Task Management
          </h2>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-2 text-left flex items-center gap-2">
            <RiListCheck2 size={24} className="text-green-600" />
            Tasks and notes
          </h3>
          <p className="text-base md:text-lg text-muted-foreground text-left">
            Capture tasks and notes together in the same space—no tab-hopping.
          </p>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-2 text-left flex items-center gap-2">
            <RiListCheck2 size={24} className="text-green-600" />
            Lists
          </h3>
          <p className="text-base md:text-lg text-muted-foreground text-left">
            Your Swiss-army doc for everything—code snippets, research,
            side-projects, grocery runs. Group related tasks and notes in one
            flexible list for instant clarity and project-level visibility.
          </p>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-2 text-left flex items-center gap-2">
            <RiCalendar2Fill size={24} className="text-green-600" />
            Today
          </h3>
          <p className="text-base md:text-lg text-muted-foreground text-left">
            One focused view of today&apos;s priorities, meetings, and quick
            notes. Open it, see exactly what matters, and dive straight into the
            work that counts.
          </p>
        </div>
      </Container>
    </section>
  );
}

function SigmaChatSection() {
  return (
    <section
      id="sigma-chat"
      className="w-full bg-background-2 py-12 flex flex-col items-center"
    >
      <Container className="flex flex-col gap-8">
        <div>
          <h2 className="text-2xl font-bold text-purple-600 mb-2 text-left">
            Sigma chat
          </h2>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-2 text-left">
            Find answers, not files.
          </h3>
          <p className="text-base md:text-lg text-muted-foreground text-left">
            The average worker loses 9 hours a week hunting for information.
            Sigma Chat skips the scavenger hunt—because it&apos;s already
            plugged into your Calendar, Email, Slack, Jira, and GitHub. Just
            ask.
          </p>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-2 text-left">
            What you can do with sigma chat
          </h3>
          <ul className="text-muted-foreground list-disc list-inside ml-4 flex flex-col gap-2">
            <li>Create or update tasks, lists in sigma</li>
            <li>
              Query project status: &quot;What&apos;s the progress on JIRA-123
              and its blockers?&quot;
            </li>
            <li>Give me a two-line overview of PR #42</li>
          </ul>
        </div>
        <div>
          <p className="text-base md:text-lg text-muted-foreground text-left">
            One of my favourite use cases: &quot;Read my emails for last 2 weeks
            and tell me where I am lacking in sales, be as detailed as
            possible&quot;
          </p>
        </div>
      </Container>
    </section>
  );
}

function Footer() {
  return (
    <footer className="w-full bg-background-2 py-10 flex flex-col items-center border-t border-gray-200">
      <div className="flex gap-6 mb-4">
        <a
          href="#features"
          className="text-gray-700 hover:underline focus-visible:ring-2 focus-visible:ring-gray-900 font-medium"
        >
          Features
        </a>
        <a
          href="#testimonials"
          className="text-gray-700 hover:underline focus-visible:ring-2 focus-visible:ring-gray-900 font-medium"
        >
          Testimonials
        </a>
        <a
          href="#download"
          className="text-gray-700 hover:underline focus-visible:ring-2 focus-visible:ring-gray-900 font-medium"
        >
          Download
        </a>
      </div>
      <div className="flex gap-4 mb-4">
        <a
          href="https://discord.gg/dVTC3BmgEq"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-700 hover:text-black focus-visible:ring-2 focus-visible:ring-[#5865F2]"
        >
          <RiDiscordFill size={24} />
        </a>
        <a
          href="https://github.com/tegonhq/sigma"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-700 hover:text-black focus-visible:ring-2 focus-visible:ring-[#23272f]"
        >
          <RiGithubFill size={24} />
        </a>
      </div>
      <div className="text-gray-400 text-sm">
        © {new Date().getFullYear()} sigma. All rights reserved.
      </div>
    </footer>
  );
}

export default function Index() {
  const { data } = useSWR(
    'https://api.github.com/repos/tegonhq/sigma',
    fetcher,
    { refreshInterval: 60000 },
  );
  const stars: number | undefined = data?.stargazers_count;
  const formatStars = (n: number) =>
    n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k' : n.toString();

  return (
    <div className="w-full min-h-screen bg-background-2 flex flex-col items-center overflow-x-hidden font-sans h-full">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 bg-background-2 border-b border-gray-200 shadow-sm transition-shadow flex items-center justify-center h-16 px-4 backdrop-blur-md">
        <div className="flex items-center w-full max-w-4xl justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Image src="/logo_light.svg" alt="logo" width={36} height={36} />
            <span className="text-muted-foreground font-semibold text-xl tracking-tight">
              sigma
            </span>
          </div>
          {/* Nav Links */}
          <nav className="flex-1 flex justify-center gap-8 items-center">
            {/* Features Dropdown */}
            <div className="relative group">
              <button className="text-base font-semibold text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-gray-900 rounded transition flex items-center gap-1">
                Features
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-md py-2 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 pointer-events-none group-hover:pointer-events-auto group-focus-within:pointer-events-auto transition-opacity z-50">
                <a
                  href="#personalisation"
                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-gray-900 transition font-medium"
                >
                  <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
                  Personalisation
                </a>
                <a
                  href="#task-management"
                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-gray-900 transition font-medium"
                >
                  <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                  Task Management
                </a>
                <a
                  href="#sigma-chat"
                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-gray-900 transition font-medium"
                >
                  <span className="inline-block w-2 h-2 rounded-full bg-purple-500"></span>
                  Sigma Chat
                </a>
              </div>
            </div>
            <a
              href="#docs"
              className="text-base font-semibold text-gray-700 hover:text-gray-900 focus-visible:ring-2 focus-visible:ring-gray-900 rounded transition flex items-center gap-1"
            >
              <RiBookOpenLine size={16} />
              Docs
            </a>
            <a
              href="#about"
              className="text-base font-semibold text-gray-700 hover:text-gray-900 focus-visible:ring-2 focus-visible:ring-gray-900 rounded transition flex items-center gap-1"
            >
              <RiUser3Line size={16} />
              About us
            </a>
            <a
              href="https://github.com/tegonhq/sigma"
              target="_blank"
              rel="noopener noreferrer"
              className="text-base font-semibold text-gray-700 hover:text-gray-900 focus-visible:ring-2 focus-visible:ring-gray-900 rounded transition flex items-center gap-1"
            >
              <RiGithubFill size={16} />
              <span className="tabular-nums">
                {stars !== undefined ? formatStars(stars) : '--'}
              </span>
              <RiExternalLinkLine size={13} className="text-gray-400 mt-0.5" />
            </a>
            <a
              href="https://discord.gg/dVTC3BmgEq"
              target="_blank"
              rel="noopener noreferrer"
              className="text-base font-semibold text-gray-700 hover:text-gray-900 focus-visible:ring-2 focus-visible:ring-[#5865F2] rounded transition flex items-center gap-1"
            >
              <RiDiscordFill size={16} />
              Discord
            </a>
          </nav>
          {/* Right Side: Download only */}
          <div className="flex items-center gap-2">
            <a
              href="#download"
              className="bg-black text-white px-4 py-2 rounded-lg font-bold shadow-sm hover:bg-gray-800 transition text-base focus-visible:ring-2 focus-visible:ring-gray-900"
            >
              Download
            </a>
          </div>
        </div>
      </header>
      <HeroSection />
      <PersonalisationSection />
      <TaskManagementSection />
      <SigmaChatSection />
      <Footer />
    </div>
  );
}
