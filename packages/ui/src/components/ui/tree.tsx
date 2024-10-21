import Tree, { TreeNode } from 'rc-tree';
import React, { useState } from 'react';

import { ChevronDown, ChevronRight, DocumentLine } from '@sigma/ui/icons'; // Custom icons

import { Button } from './button';
import { cn } from '../../lib/utils';

interface TreeCProps {
  initialTreeData: Array<{
    key: string;
    title: string;
    children?: any[];
  }>;
  defaultSelectedKey?: string;
  onChange?: (selectedKey: string) => void;
}

const TreeC: React.FC<TreeCProps> = ({
  initialTreeData,
  onChange,
  defaultSelectedKey,
}) => {
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [selectedKey, setSelectedKey] = useState<string | undefined>(
    defaultSelectedKey,
  );

  const handleExpand = (expandedKeys: string[]) => {
    setExpandedKeys(expandedKeys);
  };

  const handleSelect = (selectedKeys: string[]) => {
    if (selectedKeys[0]) {
      setSelectedKey(selectedKeys[0]);
      onChange && onChange(selectedKeys[0]);
    }
  };

  const handleIconClick = (key: string) => {
    setExpandedKeys((prevExpandedKeys) =>
      prevExpandedKeys.includes(key)
        ? prevExpandedKeys.filter((k) => k !== key)
        : [...prevExpandedKeys, key],
    );
  };

  const renderTreeNodes = (data: any[], depth: number) =>
    data.map((item) => {
      const paddingLeft = depth === 0 ? '0.25rem' : `${depth * 5 * 0.25}rem`;
      const isOpen = expandedKeys.includes(item.id);
      const isSelected = selectedKey === item.id; // Check if the node is selected

      const hasChildren = item.children && item.children.length > 0; // Check if children exist and have length

      const title = (
        <div
          className={cn('w-full flex items-center gap-1 py-1 group/button')}
          style={{
            paddingLeft,
          }}
        >
          {hasChildren ? ( // Use hasChildren instead of item.children
            <>
              <Button
                variant="link"
                size="xs"
                className="px-0 pr-0.5 hidden group-hover/button:block h-4 w-4"
                onClick={(e) => {
                  e.preventDefault();
                  handleIconClick(item.id);
                }}
              >
                {isOpen ? (
                  <ChevronDown
                    size={16}
                    className="flex-shrink-0 cursor-pointer"
                  />
                ) : (
                  <ChevronRight
                    size={16}
                    className="flex-shrink-0 cursor-pointer"
                  />
                )}
              </Button>
              <DocumentLine
                size={16}
                className="flex-shrink-0 flex group-hover/button:hidden"
              />
            </>
          ) : (
            <DocumentLine className="flex-shrink-0" />
          )}
          <span className="truncate flex-1">{item.title ?? 'Untitled'}</span>
        </div>
      );

      if (hasChildren) {
        // Use hasChildren instead of item.children
        return (
          <TreeNode
            dragOver
            className={cn(
              'flex items-center rounded flex-nowrap px-1 mt-0.5',
              isSelected
                ? 'bg-accent text-accent-foreground'
                : 'hover:bg-grayAlpha-100',
            )}
            title={title}
            key={item.id}
          >
            {renderTreeNodes(item.children, depth + 1)}
          </TreeNode>
        );
      }

      return (
        <TreeNode
          dragOver
          className={cn(
            'flex items-center rounded flex-nowrap px-1 mt-0.5',
            isSelected
              ? 'bg-accent text-accent-foreground'
              : 'hover:bg-grayAlpha-100',
          )}
          title={title}
          key={item.id}
          isLeaf
        />
      );
    });

  return (
    <Tree
      defaultExpandAll
      draggable
      switcherIcon={null} // Custom switcher icon
      onExpand={handleExpand}
      expandedKeys={expandedKeys}
      selectedKeys={[selectedKey]}
      onSelect={handleSelect}
    >
      {renderTreeNodes(initialTreeData, 0)}
    </Tree>
  );
};

export default TreeC;
