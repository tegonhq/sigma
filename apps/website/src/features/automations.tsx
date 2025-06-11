import React, { useState } from 'react';

const automations = [
  {
    label: 'Daily Brief',
    title: 'Your Morning Command Center',
    content: `"At 9 AM, scan my Slack DMs, Linear assigned issues, GitHub PRs, and urgent emails. Create a prioritized list with estimated time for each task. Flag anything blocking the team."`,
    benefits: '45 min saved daily',
    tags: ['PM', 'Engineering', 'Executive']
  },
  {
    label: 'Smart Code Reviews',
    title: 'AI-Powered Review Assistant',
    content: `"When assigned a PR, analyze the diff, run security/performance checks, draft inline comments for potential issues, and notify me with a priority score."`,
    benefits: '2.5 hours saved weekly',
    tags: ['Engineering', 'DevOps']
  },
  {
    label: 'Meeting → Action Items',
    title: 'Automatic Follow-up Generator',
    content: `"From any message tagged #meeting-notes, extract action items with owners and deadlines. If urgent and not in Linear, draft issues and assign them. Send follow-up summaries to attendees."`,
    benefits: '1 hour saved per meeting',
    tags: ['PM', 'Design', 'Executive']
  },
  {
    label: 'Bug Fix Automation',
    title: 'End-to-End Fix Pipeline',
    content: `"For bugs labeled 'routine-fix', research the issue, propose a solution, get my approval, implement with Claude Code, run tests, and open a PR with proper description."`,
    benefits: '4 hours saved per bug',
    tags: ['Engineering', 'DevOps']
  },
];

export const Automations = () => {
  const [selected, setSelected] = useState(1); // Default to 'Smart Code Reviews'

  return (
    <>
      {/* Never track tasks section */}
      <section className="w-full py-24 lg:py-32" style={{ background: 'linear-gradient(180deg, #1a1520 0%, #2d1f25 100%)' }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center">
            <h2 className="text-[46px] lg:text-5xl xl:text-6xl font-bold text-[#efead7] mb-8 tracking-tight">
              Never track tasks by hand again
            </h2>
            <p className="text-xl lg:text-2xl text-white/90 leading-relaxed max-w-4xl mx-auto">
              SOL automatically pulls in every Slack mention, GitHub PR, Linear issues, Gmail request, and calendar event—so you spend time doing, not listing.
            </p>
          </div>
        </div>
      </section>

      {/* Automations in Action section */}
      <section className="w-full py-24 lg:py-32" style={{ background: 'linear-gradient(180deg, #2d1f25 0%, #3d2519 100%)' }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-[46px] lg:text-5xl xl:text-6xl font-bold text-[#efead7] mb-6 tracking-tight">
              Real Automations, Real Results
            </h2>

          </div>
          
          <div className="max-w-6xl mx-auto">
            {/* Tabs */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {automations.map((tab, idx) => (
                <button
                  key={tab.label}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    selected === idx
                      ? 'bg-[#EE5B48] text-white shadow-lg'
                      : 'bg-[#23191a]/60 text-white/70 hover:text-white hover:bg-[#23191a]/80'
                  }`}
                  onClick={() => setSelected(idx)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Main Content Card */}
            <div className="bg-[#23191a]/90 border border-[#fff2] rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-8 lg:p-12">
                
                {/* Header with title and tags */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                  <h3 className="text-2xl lg:text-3xl font-bold text-[#ffe6b0] mb-4 lg:mb-0">
                    {automations[selected].title}
                  </h3>
                  <div className="flex gap-2">
                    {automations[selected].tags.map((tag) => (
                      <span 
                        key={tag}
                        className="px-3 py-1 bg-[#EE5B48]/20 border border-[#EE5B48]/40 text-[#EE5B48] text-sm rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Automation Description */}
                <div className="bg-[#18141a] rounded-lg p-6 border-l-4 border-[#EE5B48] relative">
                  <p className="text-lg text-[#ffe6b0] leading-relaxed whitespace-pre-line mb-4">
                    {automations[selected].content}
                  </p>
                  
                  {/* Inline time savings */}
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-white/60">⚡ Saves:</span>
                    <span className="text-[#EE5B48] font-semibold">{automations[selected].benefits}</span>
                  </div>
                </div>
              </div>

              {/* Mars rover icon */}
              <div className="absolute bottom-4 right-4 opacity-30">
                <svg width="40" height="28" viewBox="0 0 40 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="16" width="36" height="6" rx="2" fill="#EE5B48" />
                  <rect x="8" y="12" width="24" height="4" rx="2" fill="#EE5B48" />
                  <rect x="16" y="8" width="8" height="4" rx="2" fill="#EE5B48" />
                  <circle cx="6" cy="22" r="2" fill="#EE5B48" />
                  <circle cx="34" cy="22" r="2" fill="#EE5B48" />
                </svg>
              </div>
            </div>

            {/* Subtle bottom stats */}
            <div className="mt-12 text-center">
              <p className="text-white/60 text-sm mb-4">Built for busy product builders who value their time</p>
              <div className="flex justify-center items-center gap-8 text-sm">
                <span className="text-[#EE5B48] font-medium">10+ hrs saved weekly</span>
                <span className="text-white/40">•</span>
                <span className="text-[#EE5B48] font-medium">500+ workflows possible</span>
                <span className="text-white/40">•</span>
                <span className="text-[#EE5B48] font-medium">Zero manual tracking</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}; 