import { ScrollArea } from '@sigma/ui/components/scroll-area';
import { format } from 'date-fns';
import React from 'react';

import { observer } from 'mobx-react-lite';
import { useApplication } from 'hooks/application';
import { PageEditor } from './page-editor';
import type { PageType } from 'common/types';
import { PageTitle } from './page-title';

interface PageContentProps {
  page: PageType;
}

// A component to render individual date items.
export const PageContent = observer(({ page }: PageContentProps) => {
  return (
    <ScrollArea className="grow flex h-full justify-center w-full mt-3">
      <div className="flex h-full justify-center w-full">
        <div className="grow flex flex-col gap-1 h-full max-w-[97ch] pt-10">
          <div className="flex flex-col">
            <PageTitle value={page.title} />

            <PageEditor
              page={page}
              onDescriptionChange={function (description: string): void {}}
            />
          </div>
        </div>
      </div>
    </ScrollArea>
  );
});
