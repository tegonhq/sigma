import { ScrollArea } from '@sigma/ui/components/scroll-area';
import React from 'react';

import { observer } from 'mobx-react-lite';
import { PageEditor } from './page-editor';
import type { PageType } from 'common/types';
import { PageTitle } from './page-title';
import { useUpdatePageMutation } from 'services/pages';

interface PageContentProps {
  page: PageType;
}

// A component to render individual date items.
export const PageContent = observer(({ page }: PageContentProps) => {
  const { mutate: updatePage } = useUpdatePageMutation({});

  return (
    <ScrollArea className="grow flex h-full justify-center w-full mt-3">
      <div className="flex h-full justify-center w-full">
        <div className="grow flex flex-col gap-1 h-full max-w-[97ch] pt-10">
          <div className="flex flex-col">
            <PageTitle
              value={page.title}
              onChange={(title: string) => {
                updatePage({ title, pageId: page.id });
              }}
            />

            <PageEditor page={page} onDescriptionChange={() => {}} />
          </div>
        </div>
      </div>
    </ScrollArea>
  );
});
