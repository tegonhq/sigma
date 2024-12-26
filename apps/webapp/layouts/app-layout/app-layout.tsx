import { cn, SidebarInset, SidebarProvider } from '@tegonhq/ui';
import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';

import { AppSidebar } from './app-sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider
      className={cn('!bg-transparent', GeistSans.variable, GeistMono.variable)}
      style={{
        '--sidebar-width': '10rem',
        '--sidebar-width-mobile': '10rem',
      }}
    >
      <AppSidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
