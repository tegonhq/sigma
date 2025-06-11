import { RiDiscordFill, RiGithubFill } from '@remixicon/react';

export function Footer() {
  return (
    <footer className="w-full py-24 lg:py-32" style={{ background: 'linear-gradient(180deg, #4a2e1a 0%, #0F1019 100%)' }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col items-center justify-center space-y-6">
          <div className="flex gap-8">
            <a
              href="https://discord.gg/dVTC3BmgEq"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-[#ffe6b0] transition-colors duration-200 p-2 hover:scale-110 transform"
              aria-label="Join our Discord"
            >
              <RiDiscordFill size={32} />
            </a>
            <a
              href="https://github.com/RedPlanetHQ/sol"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-[#ffe6b0] transition-colors duration-200 p-2 hover:scale-110 transform"
              aria-label="View our GitHub"
            >
              <RiGithubFill size={32} />
            </a>
          </div>
          <div className="text-base text-white/70">
            © {new Date().getFullYear()} SOL. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
