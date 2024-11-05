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
    sortOrder?: string;
  }>;
  defaultSelectedKey?: string;
  onChange?: (selectedKey: string) => void;
  onDrop?: (dropKey: string, dragKey: string, dropPostition: number) => void;
}

export const TreeC: React.FC<TreeCProps> = ({
  initialTreeData,
  onChange,
  defaultSelectedKey,
  onDrop: onDropParent,
}) => {
  const [expandedKeys, setExpandedKeys] = useState<string[]>([
    defaultSelectedKey,
  ]);
  const [selectedKey, setSelectedKey] = useState<string | undefined>(
    defaultSelectedKey,
  );

  React.useEffect(() => {
    if (selectedKey !== defaultSelectedKey) {
      setSelectedKey(defaultSelectedKey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultSelectedKey]);

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

  const onDrop = (info: any) => {
    const dropKey = info.node.key;
    const dragKey = info.dragNode.key;
    const dropPos = info.node.pos.split('-');
    const dropPosition =
      info.dropPosition - Number(dropPos[dropPos.length - 1]);

    onDropParent && onDropParent(dropKey, dragKey, dropPosition);
  };

  const renderTreeNodes = (data: any[], depth: number) =>
    data.map((item) => {
      const paddingLeft = depth === 0 ? '5px' : `${depth * 4 * 5}px`;
      const isOpen = expandedKeys.includes(item.id);
      const isSelected = selectedKey === item.id; // Check if the node is selected

      const hasChildren = item.children && item.children.length > 0; // Check if children exist and have length

      const title = (
        <div
          className={cn('w-full flex items-center gap-1 py-1 group/button')}
          style={{
            paddingLeft,
          }}
          onClick={() => {
            handleSelect([item.id]);
          }}
        >
          {hasChildren ? ( // Use hasChildren instead of item.children
            <>
              <Button
                variant="link"
                size="xs"
                className="px-0 pr-0.5 h-4 w-4 hidden group-hover/button:block"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
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
            <DocumentLine className="flex-shrink-0" size={16} />
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
            pos={item.sortOrder}
            key={item.id}
            expanded={isSelected}
          >
            {renderTreeNodes(item.children, depth + 1)}
          </TreeNode>
        );
      }

      return (
        <TreeNode
          dragOver={false}
          className={cn(
            'flex items-center rounded flex-nowrap px-1 mt-0.5',
            isSelected
              ? 'bg-accent text-accent-foreground'
              : 'hover:bg-grayAlpha-100',
          )}
          title={title}
          pos={item.sortOrder}
          key={item.id}
          isLeaf={false}
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
      onDrop={onDrop}
    >
      {renderTreeNodes(initialTreeData, 0)}
    </Tree>
  );
};
