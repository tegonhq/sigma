'use client';

import './global.css';
import '@tegonhq/ui/index.css';
import '@tegonhq/ui/global.css';
import { cn } from '@tegonhq/ui';
import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import { useRouter } from 'next/navigation';

import { initPosthog, initSuperTokens } from 'common/init-config';
import { IPCWrapper } from 'common/ipc-wrapper';

import { Provider } from '../modules/provider';

initPosthog();

TimeAgo.addDefaultLocale(en);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  initSuperTokens(router);

  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={`${GeistMono.variable} ${GeistSans.variable} font-sans`}>
        <div
          className={cn(
            'min-h-screen font-sans antialiased flex flex-col',
            GeistSans.variable,
            GeistMono.variable,
          )}
        >
          <IPCWrapper />
          <Provider>{children}</Provider>
        </div>
      </body>
    </html>
  );
}
