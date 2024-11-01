'use client';

import { observer } from 'mobx-react-lite';
import React from 'react';

import { usePage } from 'hooks/pages';

import { PageContent } from './page-content';

interface PageProps {
  pageId: string;
}

export const Page = observer(({ pageId }: PageProps) => {
  const page = usePage(pageId);

  if (!page) {
    return null;
  }

  return <PageContent page={page} />;
});
