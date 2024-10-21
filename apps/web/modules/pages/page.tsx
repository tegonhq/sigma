'use client';

import { ScrollArea } from '@sigma/ui/components/scroll-area';
import { DocumentLine } from '@sigma/ui/icons';
import { observer } from 'mobx-react-lite';

import { usePage } from 'hooks/pages';

import { PageEditor } from './page-editor';
import { PageTitle } from './page-title';

export const Page = observer(() => {
  const page = usePage();

  const onPageChange = () => {};

  const onDescriptionChange = () => {};

  return (
    <ScrollArea className="grow flex h-full justify-center w-full">
      <div className="flex h-full justify-center w-full">
        <div className="grow flex flex-col gap-2 h-full max-w-[97ch]">
          <div className="py-6 flex flex-col gap-2">
            <div className="px-6">
              <DocumentLine size={24} />
            </div>

            <PageTitle value={page.title} onChange={onPageChange} />
            <PageEditor page={page} onDescriptionChange={onDescriptionChange} />
          </div>
        </div>
      </div>
    </ScrollArea>
  );
});
