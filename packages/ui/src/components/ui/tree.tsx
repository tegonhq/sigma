import Tree, { TreeNode } from 'rc-tree';
import React from 'react';

import { ChevronDown, ChevronRight } from '@sigma/ui/icons'; // Custom icons

interface TreeCProps {
  treeData: Array<{
    key: string;
    title: string;
    children?: any[];
  }>;
}

const renderTreeNodes = (data: any[]) =>
  data.map((item) => {
    if (item.children) {
      return (
        <TreeNode
          className="flex"
          title={
            <div className="w-full flex items-center pl-1">
              <span className="truncate">{item.title}</span>
            </div>
          }
          key={item.key}
        >
          {renderTreeNodes(item.children)}
        </TreeNode>
      );
    }
    return (
      <TreeNode
        title={<span className="pl-4 truncate w-full block">{item.title}</span>}
        key={item.key}
        isLeaf
      />
    );
  });

const TreeC: React.FC<TreeCProps> = ({ treeData }) => {
  return (
    <Tree
      defaultExpandAll
      switcherIcon={({ expanded, isLeaf }) =>
        !isLeaf ? expanded ? <ChevronDown /> : <ChevronRight /> : null
      } // Custom switcher icon
      onSelect={(selectedKeys, info) => {
        console.log('selected', selectedKeys, info);
      }}
    >
      {renderTreeNodes(treeData)}
    </Tree>
  );
};

export default TreeC;
