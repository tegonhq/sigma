'use client';

import './global.css';
import '@sigma/ui/index.css';
import '@sigma/ui/global.css';
import { cn } from '@sigma/ui/lib/utils';
import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import { useRouter } from 'next/navigation';

import { initPosthog, initSuperTokens } from 'common/init-config';

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
            'min-h-screen font-sans antialiased flex',
            GeistSans.variable,
            GeistMono.variable,
          )}
        >
          <Provider>{children}</Provider>
        </div>
      </body>
    </html>
  );
}
