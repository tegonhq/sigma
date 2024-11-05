import { PageTypeEnum } from '@sigma/types';
import { Button } from '@sigma/ui/components/button';
import { CreateIssueLine, HelpLine, SearchLine } from '@sigma/ui/icons';
import React from 'react';

import { useApplication } from 'hooks/application';

import { useCreatePageMutation } from 'services/pages';

import { TabViewType } from 'store/application';
import { useContextStore } from 'store/global-context-provider';

export function BottomBar() {
  const { updateTabType } = useApplication();
  const { mutate: createPage } = useCreatePageMutation({
    onSuccess: (data) => {
      updateTabType(TabViewType.PAGE, data.id);
    },
  });
  const { pagesStore } = useContextStore();

  const onCreatePage = () => {
    createPage({
      sortOrder: pagesStore.getSortOrderForNewPage,
      type: PageTypeEnum.Default,
    });
  };

  return (
    <div className="w-full flex justify-between px-6 py-4">
      <Button
        variant="link"
        onClick={() => {
          window.open('https://docs.mysigma.ai', '_blank');
        }}
      >
        <HelpLine size={20} />
      </Button>

      <Button variant="link" isActive className="px-3" onClick={onCreatePage}>
        <CreateIssueLine size={20} />
      </Button>

      <Button variant="link">
        <SearchLine size={20} />
      </Button>
    </div>
  );
}
