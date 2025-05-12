import { Button, cn, SidebarInset, SidebarProvider } from '@tegonhq/ui';
import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { signOut } from 'supertokens-auth-react/recipe/session';

import { AIThinking } from 'modules/ai-thinking';
import { SettingsProvider } from 'modules/settings';

import { useIPC } from 'hooks/ipc';

import { AppSidebar } from './app-sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const ipc = useIPC();
  const { replace } = useRouter();

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
    <SidebarProvider
      className={cn('sidebar', GeistSans.variable, GeistMono.variable)}
      style={{
        '--sidebar-width': '13rem',
        '--sidebar-width-mobile': '13rem',
        backgroundColor: 'oklch(var(--background)) !important',
      }}
    >
      <SettingsProvider>
        <AppSidebar />
        <SidebarInset className="bg-transparent md:peer-data-[variant=inset]:shadow-none">
          {children}
        </SidebarInset>
      </SettingsProvider>

      <AIThinking />
    </SidebarProvider>
  );
}
