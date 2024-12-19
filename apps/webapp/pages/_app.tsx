import 'styles/globals.css';

import '@tegonhq/ui/index.css';
import '@tegonhq/ui/global.css';

import type { AppLayoutProps } from 'next/app';

import { cn } from '@tegonhq/ui';
import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import { useRouter } from 'next/router';
import React from 'react';
import { Hydrate } from 'react-query';

import { Provider } from 'modules/provider';

import { initSuperTokens } from 'common/init-config';

TimeAgo.addDefaultLocale(en);

export const MyApp = ({
  Component,
  pageProps: { dehydratedState, ...pageProps },
}: AppLayoutProps) => {
  const getLayout = Component.getLayout || ((page: React.ReactNode) => page);
  const router = useRouter();
  initSuperTokens(router);

  return (
    <Provider>
      <Hydrate state={dehydratedState}>
        <div
          className={cn(
            'min-h-screen font-sans antialiased flex flex-col justify-center',
            GeistSans.variable,
            GeistMono.variable,
          )}
        >
          {getLayout(<Component {...pageProps} />)}
        </div>
      </Hydrate>
    </Provider>
  );
};

export default MyApp;
