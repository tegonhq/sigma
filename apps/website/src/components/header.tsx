import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@redplanethq/ui';
import Image from 'next/image';
import { useRouter } from 'next/router';

import { DownloadButton } from './utils';

export const Header = () => {
  const router = useRouter();
  
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
    <header className="sticky z-50 top-0 w-full border-b border-white/10 bg-transparent">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}  
          <button 
            onClick={() => window.open('/', '_self')}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <Image src="/sol_logo.png" alt="SOL Logo" width={32} height={32} className="rounded" />
            <span className="font-bold text-2xl" style={{ color: '#FBFDFA' }}>SOL</span>
          </button>
          
          {/* Nav Links - Hidden on mobile */}
          <nav className="hidden md:flex items-center gap-8" style={{ color: '#FBFDFA' }}>
            <Button 
              variant="ghost" 
              className={`text-base font-medium transition-colors ${
                router.pathname === '/manifesto' 
                  ? 'text-[#EE5B48] bg-[#EE5B48]/10 border border-[#EE5B48]/30' 
                  : 'text-[#FBFDFA] hover:text-[#ffe6b0]'
              }`}
              onClick={() => window.open('/manifesto', '_self')}
            >
              Manifesto
            </Button>
            <Button variant="ghost" className="text-base font-medium hover:text-[#ffe6b0] transition-colors" style={{ color: '#FBFDFA' }} onClick={() => window.open('https://github.com/RedPlanetHQ/sol', '_blank')}>
              GitHub
            </Button>
            <Button variant="ghost" className="text-base font-medium hover:text-[#ffe6b0] transition-colors" style={{ color: '#FBFDFA' }} onClick={() => window.open('https://discord.gg/dVTC3BmgEq', '_blank')}>
              Discord
            </Button>
          </nav>
          
          {/* Talk to Human button */}
          <div className="flex items-center">
            <Button 
              size="lg" 
              variant="outline"
              className="border-2 border-white/60 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors hover:bg-white/10" 
              onClick={() => window.open('https://cal.com/manik-aggarwal-f1mjhp/15min', '_blank')}
            >
              Chat with Founders
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
