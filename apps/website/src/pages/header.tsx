import { RiAppleFill } from '@remixicon/react';
import { Button, Popover, PopoverContent, PopoverTrigger } from '@tegonhq/ui';
import Image from 'next/image';

export const Header = () => {
  return (
    <header className="sticky z-100 transition-all duration-300 ease-out top-0 translate-y-none">
      <div className="pt-3 pb-6 md:pb-2 mx-auto max-w-5xl w-full flex gap-2 justify-between items-center bg-background">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Image src="/logo_light.svg" alt="logo" width={30} height={30} />
        </div>
        {/* Nav Links */}
        <nav className="flex-1 flex justify-start gap-8 items-center">
          {/* Features Dropdown */}
          <Popover>
            <PopoverTrigger>
              <Button variant="ghost"> Features </Button>
            </PopoverTrigger>

            <PopoverContent>
              <div className="flex gap-1">
                <Button variant="ghost"> Personalization </Button>
              </div>
            </PopoverContent>
          </Popover>
        </nav>
        {/* Right Side: Download only */}
        <div className="flex items-center gap-2">
          <Button size="xl" variant="default" className="gap-2 items-center">
            <RiAppleFill size={14} />
            Download
          </Button>
        </div>
      </div>
    </header>
  );
};
