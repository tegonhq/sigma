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
        '--sidebar-width': '13rem',
        '--sidebar-width-mobile': '13rem',
      }}
    >
      <AppSidebar />
      <SidebarInset className="bg-transparent md:peer-data-[variant=inset]:shadow-none">
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
