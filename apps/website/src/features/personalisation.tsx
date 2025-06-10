import React, { useState } from 'react';

const automations = [
  {
    label: 'Daily Brief',
    content: `"When it's 09:00 on weekdays, scan Slack, Linear, GitHub and Gmail.\nSummarise blockers, critical reviews and overdue tasks in under two minutes."`,
  },
  {
    label: 'Code-review autopilot',
    content: `"When a PR is assigned to me, create a task, run static checks,\ndraft inline comments on bugs or anti-patterns, and wait for my OK to post."`,
  },
  {
    label: 'Meeting notes → issues',
    content: `"From any message tagged #meeting-notes, list action items.\nIf urgent and not already in Linear, draft issues and ask for my approval."`,
  },
  {
    label: 'Async bug-fix with Claude Code',
    content: `"For tasks labelled bug-fix, plan the fix, get my thumbs-up,\nask Claude to code it, then open a PR."`,
  },
];

export const Personalisation = () => {
  const [selected, setSelected] = useState(1); // Default to 'Code-review autopilot'

  return (
    <>
      {/* Never track tasks section */}
      <section className="w-full py-20 lg:py-24" style={{ background: 'linear-gradient(180deg, #1a1520 0%, #2d1f25 100%)' }}>
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
      <section className="w-full py-20 lg:py-24" style={{ background: 'linear-gradient(180deg, #2d1f25 0%, #3d2519 100%)' }}>
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-[46px] lg:text-5xl xl:text-6xl font-bold text-[#efead7] mb-12 lg:mb-16 tracking-tight text-center">
            Automations in Action
          </h2>
          
          <div className="max-w-4xl mx-auto">
            <div className="rounded-2xl bg-[#23191a]/90 border border-[#fff2] shadow-2xl overflow-hidden">
              
              {/* Tab Navigation */}
              <div className="flex flex-wrap border-b border-[#fff2] bg-[#23191a]/95">
                {automations.map((tab, idx) => (
                  <button
                    key={tab.label}
                    className={`px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-medium transition-all duration-200 tracking-wide flex-1 min-w-0 ${
                      selected === idx
                        ? 'bg-[#18141a] text-[#ffe6b0] border-b-2 border-[#ffe6b0] shadow-md'
                        : 'text-[#ffe6b0bb] hover:text-[#ffe6b0] hover:bg-[#18141a]/50'
                    }`}
                    style={{ outline: 'none', border: 'none' }}
                    onClick={() => setSelected(idx)}
                  >
                    <span className="truncate">{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Content Area */}
              <div className="bg-[#18141a] p-8 lg:p-12 min-h-[280px] flex flex-col justify-center relative">
                <p className="text-lg lg:text-xl text-[#ffe6b0] whitespace-pre-line leading-relaxed">
                  {automations[selected].content}
                </p>
                
                {/* Mars rover icon */}
                <div className="absolute bottom-6 right-6">
                  <svg width="48" height="32" viewBox="0 0 40 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-60">
                    <rect x="2" y="16" width="36" height="6" rx="2" fill="#ff6a1a" />
                    <rect x="8" y="12" width="24" height="4" rx="2" fill="#ff6a1a" />
                    <rect x="16" y="8" width="8" height="4" rx="2" fill="#ff6a1a" />
                    <circle cx="6" cy="22" r="2" fill="#ff6a1a" />
                    <circle cx="34" cy="22" r="2" fill="#ff6a1a" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}; 