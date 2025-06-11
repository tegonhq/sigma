import React from 'react';
import Image from 'next/image';

export const Manifesto = () => {
  return (
    <section className="w-full py-20 lg:py-32" style={{ background: 'linear-gradient(180deg, #0F1019 0%, #1a1520 50%, #2d1f25 100%)' }}>
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-[46px] lg:text-5xl xl:text-6xl text-[#efead7] font-bold leading-tight mb-6 tracking-tight">
            Our Manifesto
          </h1>
          <div className="w-24 h-1 bg-[#EE5B48] mx-auto rounded-full mb-8"></div>
        </div>

        {/* Content Sections */}
        <div className="space-y-16">
          
          {/* Section 1: Problem */}
          <div className="relative">
            <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-[#EE5B48] to-transparent opacity-60"></div>
            <div className="pl-8">
              <h2 className="text-xl lg:text-4xl text-[#ffe6b0] font-bold mb-6 leading-tight">
                Personal task management is broken.
              </h2>
              <p className="text-xl lg:text-2xl text-white/90 leading-relaxed font-light">
                Linear nails team tasks, but individuals still chase work in Linear, PRs on GitHub, pings in Slack, email alerts, and personal to-dos elsewhere.
              </p>
            </div>
          </div>

          {/* Visual Separator */}
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-[#EE5B48]/20 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-[#EE5B48]"></div>
              </div>
              <div className="w-16 h-px bg-gradient-to-r from-[#EE5B48] to-transparent"></div>
              <div className="w-4 h-4 rounded-full bg-[#EE5B48]/40"></div>
              <div className="w-16 h-px bg-gradient-to-r from-transparent to-[#EE5B48]"></div>
              <div className="w-8 h-8 rounded-full bg-[#EE5B48]/20 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-[#EE5B48]"></div>
              </div>
            </div>
          </div>

          {/* Section 2: Why it fails */}
          <div className="relative">
            <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-[#EE5B48]/60 to-transparent opacity-60"></div>
            <div className="pl-8">
              <h2 className="text-xl lg:text-4xl text-[#ffe6b0] font-bold mb-6 leading-tight">
                Why the current setup fails
              </h2>
              <div className="space-y-6">
                <p className="text-xl lg:text-2xl text-white/90 leading-relaxed font-light">
                  Tasks land in Linear or a to-do app—if you remember to log them. Manual entry is tedious, so you give up. Even when lists stay updated, they only store tasks; they don&apos;t plan your day, protect your focus, or finish work for you.
                </p>
                <div className="bg-[#23191a]/60 border border-[#EE5B48]/30 rounded-lg p-6 backdrop-blur">
                  <p className="text-xl lg:text-2xl text-[#ffe6b0] font-medium text-center leading-relaxed">
                    Today we are building things 100 × faster than before, yet still manage life at 1 × speed.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Separator */}
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-[#EE5B48]/20 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-[#EE5B48]"></div>
              </div>
              <div className="w-16 h-px bg-gradient-to-r from-[#EE5B48] to-transparent"></div>
              <div className="w-4 h-4 rounded-full bg-[#EE5B48]/40"></div>
              <div className="w-16 h-px bg-gradient-to-r from-transparent to-[#EE5B48]"></div>
              <div className="w-8 h-8 rounded-full bg-[#EE5B48]/20 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-[#EE5B48]"></div>
              </div>
            </div>
          </div>

          {/* Section 3: Solution */}
          <div className="relative">
            <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-[#EE5B48] via-[#EE5B48]/60 to-transparent opacity-60"></div>
            <div className="pl-8">
              <h2 className="text-xl lg:text-4xl text-[#ffe6b0] font-bold mb-8 leading-tight">
                What you need is:
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-3 h-3 rounded-full bg-[#EE5B48] mt-3 flex-shrink-0"></div>
                  <p className="text-xl lg:text-2xl text-white/90 leading-relaxed font-light">
                    One place that automatically pulls every task, reminder, and notification.
                  </p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-3 h-3 rounded-full bg-[#EE5B48] mt-3 flex-shrink-0"></div>
                  <p className="text-xl lg:text-2xl text-white/90 leading-relaxed font-light">
                    Context-aware guidance that surfaces what matters now.
                  </p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-3 h-3 rounded-full bg-[#EE5B48] mt-3 flex-shrink-0"></div>
                  <p className="text-xl lg:text-2xl text-white/90 leading-relaxed font-light">
                    An assistant that offloads routine work—not just tracks it.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center pt-16">
            <div className="bg-gradient-to-r from-[#EE5B48]/10 via-[#EE5B48]/20 to-[#EE5B48]/10 border border-[#EE5B48]/30 rounded-2xl p-8 backdrop-blur">
              <p className="text-2xl lg:text-3xl text-[#efead7] font-semibold mb-6 leading-tight">
                That&apos;s why we&apos;re building SOL.
              </p>
              <p className="text-lg text-white/80 leading-relaxed max-w-2xl mx-auto">
                Your 25-hour-day personal assistant that turns chaos into clarity, urgency into action, and busywork into freedom.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}; 