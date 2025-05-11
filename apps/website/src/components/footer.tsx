import { RiDiscordFill, RiGithubFill } from '@remixicon/react';

export function Footer() {
  return (
    <footer className="w-full bg-background-2 py-10 flex flex-col items-center border-t border-gray-200">
      <div className="flex gap-4 mb-4">
        <a
          href="https://discord.gg/dVTC3BmgEq"
          target="_blank"
          rel="noopener noreferrer"
          className=""
        >
          <RiDiscordFill size={24} />
        </a>
        <a
          href="https://github.com/tegonhq/sigma"
          target="_blank"
          rel="noopener noreferrer"
          className=""
        >
          <RiGithubFill size={24} />
        </a>
      </div>
      <div className="text-sm">
        © {new Date().getFullYear()} sigma. All rights reserved.
      </div>
    </footer>
  );
}
