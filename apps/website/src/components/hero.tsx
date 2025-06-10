import { Badge, Button, Card } from '@redplanethq/ui';
import { RiGithubFill } from '@remixicon/react';
import Image from 'next/image';

import { Container, DownloadButton } from './utils';

export const Hero = () => {
  return (
    <section className="w-full py-20 lg:py-32" style={{ background: 'linear-gradient(180deg, #0F1019 0%, #1a1520 100%)' }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col items-center justify-center text-center">
          <h1 className="text-[56px] sm:text-5xl lg:text-6xl xl:text-7xl text-[#efead7] font-bold leading-tight mb-6 tracking-tight max-w-5xl">
            25-Hour-Day Assistant<br />for Product Builders
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl max-w-3xl mb-12 font-normal text-white/90 leading-relaxed">
            An AI sidekick that pulls every task into one place and tackles the busy work for you.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-12 justify-center w-full max-w-md sm:max-w-none">
            <Button 
              size="xl" 
              className="bg-[#EE5B48] hover:bg-[#EE5B48] text-white font-semibold px-8 py-4 rounded-lg text-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02]" 
              onClick={() => window.open('https://sol.com/waitlist', '_blank')}
            >
              Join Waitlist
            </Button>
            <Button 
              size="xl" 
              variant="outline" 
              className="font-semibold px-8 py-4 rounded-lg text-lg border-2 border-white/60 text-white hover:bg-white/10 transition-colors" 
              onClick={() => window.open('https://cal.com/manik-aggarwal-f1mjhp/15min', '_blank')}
            >
              Talk to Human
            </Button>
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
