import 'styles/globals.css';

import '@tegonhq/ui/index.css';
import '@tegonhq/ui/global.css';

import type { AppLayoutProps } from 'next/app';

import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import React from 'react';
import { Hydrate } from 'react-query';

import { Provider } from 'modules/provider';

import { initSuperTokens } from 'common/init-config';

TimeAgo.addDefaultLocale(en);

initSuperTokens();

export const MyApp = ({
  Component,
  pageProps: { dehydratedState, ...pageProps },
}: AppLayoutProps) => {
  const getLayout = Component.getLayout || ((page: React.ReactNode) => page);

  return (
    <Provider>
      <Hydrate state={dehydratedState}>
        {getLayout(<Component {...pageProps} />)}
      </Hydrate>
    </Provider>
  );
};

export default MyApp;
