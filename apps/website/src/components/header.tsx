import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@redplanethq/ui';
import Image from 'next/image';

import { DownloadButton } from './utils';

export const Header = () => {
  // Scroll handler for feature buttons
  const handleScroll = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      console.warn(`Section with id '${id}' not found.`);
    }
  };

  return (
    <header className="sticky z-50 top-0 w-full border-b border-white/10" style={{ background: '#0F1019' }}>
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}  
          <div className="flex items-center gap-3">
            <Image src="/sol_logo.png" alt="SOL Logo" width={32} height={32} className="rounded" />
            <span className="font-bold text-2xl" style={{ color: '#FBFDFA' }}>SOL</span>
          </div>
          
          {/* Nav Links - Hidden on mobile */}
          <nav className="hidden md:flex items-center gap-8" style={{ color: '#FBFDFA' }}>
            <Button variant="ghost" className="text-base font-medium hover:text-[#ffe6b0] transition-colors" style={{ color: '#FBFDFA' }} onClick={() => window.open('https://github.com/RedPlanetHQ/sol', '_blank')}>
              GitHub
            </Button>
            <Button variant="ghost" className="text-base font-medium hover:text-[#ffe6b0] transition-colors" style={{ color: '#FBFDFA' }} onClick={() => window.open('https://discord.gg/dVTC3BmgEq', '_blank')}>
              Discord
            </Button>
          </nav>
          
          {/* Join Waitlist button */}
          <div className="flex items-center">
            <Button 
              size="lg" 
              className="bg-[#EE5B48] hover:bg-[#EE5B48] text-white font-semibold px-6 py-2.5 rounded-lg transition-colors shadow-lg hover:shadow-xl" 
              onClick={() => window.open('https://sol.com/waitlist', '_blank')}
            >
              Join Waitlist
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
