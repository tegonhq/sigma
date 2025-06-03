import { Button } from '@redplanethq/ui';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useHotkeys } from 'react-hotkeys-hook';
import { signOut } from 'supertokens-auth-react/recipe/session';
import { Key } from 'ts-key-enum';

import { AIThinking } from 'modules/ai-thinking';
import { SettingsProvider } from 'modules/settings';
import { Updates } from 'modules/updates/updates';

import { SCOPES } from 'common/shortcut-scopes';
import { RightSideLayout } from 'layouts/right-side-layout';

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
      <RightSideLayout>
        <div className="h-[100vh]">
          <div className="sticky top-0 z-10 w-full bg-background">
            <div className="flex h-10 items-center pl-4">
              <div className="flex items-center overflow-hidden w-full md:max-w-[calc(100%-10px)]">
                <div className="h-7 pl-1 relative flex items-center w-full">
                  <AppTabs addTab={addTab} />
                </div>
              </div>
            </div>
          </div>

          <div className="h-[calc(100vh_-_40px)] flex flex-col px-2 pb-2 overflow-hidden">
            <div className="bg-background-2 h-full w-full overflow-hidden rounded-md">
              {children}
            </div>
          </div>
          <AIThinking />
          <Navigation />
          <Updates />
        </div>
      </RightSideLayout>
    </SettingsProvider>
  );
}
