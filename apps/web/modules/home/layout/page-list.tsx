'use client';

import TreeC from '@sigma/ui/components/tree';
import { observer } from 'mobx-react-lite';
import { useParams, useRouter } from 'next/navigation';
import * as React from 'react';

import { useContextStore } from 'store/global-context-provider';

export const PageList = observer(() => {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const { pageId } = useParams<{ pageId: string }>();

  const { pagesStore } = useContextStore();

  const onSelect = (selectedKey: string) => {
    console.log(selectedKey);
    router.push(`/pages/${selectedKey}`);
  };

  return (
    <div ref={containerRef} className="overflow-y-auto mt-4">
      <div className="px-6">Pages</div>
      <div className="px-6">
        <TreeC
          initialTreeData={pagesStore.getPages()}
          onChange={onSelect}
          defaultSelectedKey={pageId}
        />
      </div>
    </div>
  );
});
