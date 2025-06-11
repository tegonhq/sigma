import { Badge, Button, Card } from '@redplanethq/ui';
import { RiGithubFill } from '@remixicon/react';
import Image from 'next/image';

import { Container, DownloadButton } from './utils';

export const Hero = () => {
  return (
    <section className="w-full py-24 lg:py-32">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col items-center justify-center text-center">
          <h1 className="text-[56px] sm:text-5xl lg:text-6xl xl:text-7xl text-[#efead7] font-bold leading-tight mb-6 tracking-tight max-w-5xl">
            Your 25-Hour-Day <br /> Personal Assistant
          </h1>
          <p className="text-xl lg:text-2xl max-w-4xl mb-12 font-normal text-white/90 leading-relaxed">
          SOL funnels Slack, Linear, Gmail & more into one feed—flags what’s urgent and automates busywork.
          </p>

          
          <div className="flex justify-center mb-12 w-full">
            {/* Email Signup Form */}
            <div className="w-full max-w-lg">
              <div className="bg-[#23191a]/80 backdrop-blur border border-white/20 rounded-lg px-4 py-2 flex items-center gap-3">
                <input 
                  type="email" 
                  placeholder="your@example.com"
                  className="bg-transparent text-white placeholder:text-white/60 text-lg outline-none flex-1 font-medium"
                />
                <Button 
                  size="lg" 
                  className="bg-[#EE5B48] hover:bg-[#d54936] text-white font-semibold px-6 py-2.5 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl focus:ring-2 focus:ring-[#EE5B48]/50 focus:ring-offset-2 focus:ring-offset-transparent border border-[#EE5B48] whitespace-nowrap" 
                  onClick={() => window.open('https://sol.com/waitlist', '_blank')}
                >
                  Get Early Access →
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-2 mb-16">
            <span className="text-lg text-white/80">Backed by</span>
            <span className="bg-[#FF6600] text-white text-lg font-mono px-3 py-1.5 rounded font-bold">Y</span>
            <span className="text-lg text-white/80">Combinator</span>
          </div>
          
          <div className="flex justify-center w-full">
            <div className="relative max-w-4xl w-full">
              <Image 
                src="/sol.png" 
                alt="Mars Rover" 
                width={800} 
                height={800} 
                className="w-full h-auto max-w-2xl lg:max-w-4xl mx-auto" 
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
