'use client';

import { TreeC } from '@sigma/ui/components/tree';
import { useApplication } from 'hooks/application';
import { observer } from 'mobx-react-lite';
import * as React from 'react';
import { useUpdatePageMutation } from 'services/pages';
import { TabViewType } from 'store/application';

import { useContextStore } from 'store/global-context-provider';
import { findNodeAndSiblings } from './utils';
import { generateKeyBetween } from 'fractional-indexing';

export const PageList = observer(() => {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const { activeTab: tab, updateTabType } = useApplication();
  const { pagesStore } = useContextStore();
  const { mutate: updatePage } = useUpdatePageMutation({});

  const onSelect = (selectedKey: string) => {
    updateTabType(TabViewType.PAGE, selectedKey);
  };

  const onDrop = (dropKey: string, dragKey: string, dropPostition: number) => {
    const { node, siblings } = findNodeAndSiblings(
      pagesStore.getPages(),
      dropKey,
      dropPostition,
    );

    if (dropPostition === -1) {
      const newSortOrder = generateKeyBetween(null, node.sortOrder);
      updatePage({
        pageId: dragKey,
        parentId: null,
        sortOrder: newSortOrder,
      });
    } else if (dropPostition === 0) {
      updatePage({
        pageId: dragKey,
        parentId: dropKey,
      });
    } else {
      const newSortOrder = generateKeyBetween(
        node.sortOrder,
        siblings[0].sortOrder,
      );
      updatePage({
        pageId: dragKey,
        parentId: node.parentId ? node.parentId : null,
        sortOrder: newSortOrder,
      });
    }
  };

  return (
    <div ref={containerRef} className="overflow-y-auto mt-4">
      <div className="px-6">Pages</div>
      <div className="px-6">
        <TreeC
          initialTreeData={pagesStore.getPages()}
          onChange={onSelect}
          onDrop={onDrop}
          defaultSelectedKey={tab.entity_id}
        />
      </div>
    </div>
  );
});
