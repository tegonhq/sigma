import { ScrollArea } from '@sigma/ui/components/scroll-area';
import { observer } from 'mobx-react-lite';
import React from 'react';

import type { PageType } from 'common/types';

import { useUpdatePageMutation } from 'services/pages';

import { PageEditor } from './page-editor';
import { PageTitle } from './page-title';

interface PageContentProps {
  page: PageType;
}

// A component to render individual date items.
export const PageContent = observer(({ page }: PageContentProps) => {
  const { mutate: updatePage } = useUpdatePageMutation({});

  return (
    <ScrollArea className="grow flex h-full justify-center w-full p-6">
      <div className="flex h-full justify-center w-full">
        <div className="grow flex flex-col gap-1 h-full max-w-[97ch] pt-10">
          <div className="flex flex-col">
            <PageTitle
              value={page.title}
              autoFocus={page.title ? false : true}
              onChange={(title: string) => {
                updatePage({ title, pageId: page.id });
              }}
            />

            <PageEditor
              page={page}
              onDescriptionChange={() => {}}
              autoFocus={page.title ? true : false}
            />
          </div>
        </div>
      </div>
    </ScrollArea>
  );
});
