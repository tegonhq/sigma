'use client';

import TreeC from '@sigma/ui/components/tree';
import { Workflow, Folder, Layout } from 'lucide-react';
import * as React from 'react';

// Define your tree data structure
const treeData = [
  {
    key: '0-0',
    title: 'Node 1Node 1Node 1Node 1Node 1Node 1Node 1Node 1Node 1',
    children: [
      { key: '0-0-0', title: 'Child Node 1' },
      { key: '0-0-1', title: 'Child Node 2' },
    ],
  },
  { key: '0-1', title: 'Node 2' },
];

export default function PageList() {
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  return (
    <div ref={containerRef} className="h-full overflow-y-auto mt-4">
      <div className="mb-2">Pages</div>
      <div>
        <TreeC treeData={treeData} />
      </div>
    </div>
  );
}
