import { AddLine, Button } from '@tegonhq/ui';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useHotkeys } from 'react-hotkeys-hook';
import { signOut } from 'supertokens-auth-react/recipe/session';
import { Key } from 'ts-key-enum';

import { AIThinking } from 'modules/ai-thinking';
import { SettingsProvider } from 'modules/settings';
import { Updates } from 'modules/updates/updates';

import { SCOPES } from 'common/shortcut-scopes';

import { useApplication } from 'hooks/application';
import { useIPC } from 'hooks/ipc';

import { AppTabs } from './app-tabs';
import { Navigation } from './navigation';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const ipc = useIPC();
  const { replace } = useRouter();
  const { addTab } = useApplication();

  useHotkeys(
    [`${Key.Meta}+n`],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    () => {
      addTab();
    },
    {
      scopes: [SCOPES.Global],
      enableOnFormTags: true,
      enableOnContentEditable: true,
    },
  );

  if (!ipc) {
    return (
      <div className="flex flex-col">
        <div className="flex gap-2">
          <Image
            src="/logo_light.svg"
            alt="logo"
            key={1}
            width={20}
            height={20}
          />
          You can access in the App
        </div>
        <div className="flex justify-center mt-2">
          <Button
            variant="secondary"
            onClick={async () => {
              await signOut();

              replace('/auth');
            }}
          >
            Log out
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SettingsProvider>
      <div className="h-full w-full">
        <div className="sticky top-0 z-50 w-full bg-background">
          <div className="flex h-12 items-end px-4">
            <div className="flex items-center overflow-hidden w-full md:max-w-[calc(100%-10px)]">
              <div className="h-9 pl-1 relative flex items-center w-full">
                <AppTabs />

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 shrink-0 ml-1"
                  onClick={() => {
                    addTab();
                  }}
                >
                  <AddLine size={20} />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div>{children}</div>
        <AIThinking />
        <Navigation />
        <Updates />
      </div>
    </SettingsProvider>
  );
}
