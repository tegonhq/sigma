'use client';

import TreeC from '@sigma/ui/components/tree';
import { useApplication } from 'hooks/application';
import { observer } from 'mobx-react-lite';
import * as React from 'react';
import { TabViewType } from 'store/application';

import { useContextStore } from 'store/global-context-provider';

export const PageList = observer(() => {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const { activeTab: tab, updateTabType } = useApplication();
  const { pagesStore } = useContextStore();

  const onSelect = (selectedKey: string) => {
    updateTabType(TabViewType.PAGE, selectedKey);
  };

  return (
    <div ref={containerRef} className="overflow-y-auto mt-4">
      <div className="px-6">Pages</div>
      <div className="px-6">
        <TreeC
          initialTreeData={pagesStore.getPages()}
          onChange={onSelect}
          defaultSelectedKey={tab.entity_id}
        />
      </div>
    </div>
  );
});
