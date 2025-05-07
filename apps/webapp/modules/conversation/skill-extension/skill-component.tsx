import {
  Badge,
  Button,
  ChevronDown,
  ChevronRight,
  cn,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@tegonhq/ui';
import { NodeViewWrapper } from '@tiptap/react';
import { observer } from 'mobx-react-lite';
import Image from 'next/image';
import React from 'react';

import { getIcon as iconUtil, type IconType } from 'common/icon-utils';

import { useMCPServers } from '../suggestion-extension/use-mcp';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SkillComponent = observer((props: any) => {
  const id = props.node.attrs.id;
  const name = props.node.attrs.name;
  const agent = props.node.attrs.agent;
  const agents = useMCPServers();
  const currentAgent = agents.find((ag) => ag.key === agent);
  const [open, setOpen] = React.useState(false);

  if (id === 'undefined' || id === undefined || !name) {
    return null;
  }

  const getIcon = () => {
    if (agent === 'sigma') {
      return (
        <Image
          src="/logo_light.svg"
          alt="logo"
          key={1}
          width={18}
          height={18}
        />
      );
    }
    const Icon = iconUtil(agent as IconType);

    return <Icon size={18} className="rounded-sm" />;
  };

  const snakeToTitleCase = (input: string): string => {
    if (!input) {
      return '';
    }

    const words = input.split('_');

    // First word: capitalize first letter
    const firstWord =
      words[0].charAt(0).toUpperCase() + words[0].slice(1).toLowerCase();

    // Rest of the words: all lowercase
    const restWords = words.slice(1).map((word) => word.toLowerCase());

    // Join with spaces
    return [firstWord, ...restWords].join(' ');
  };

  return (
    <NodeViewWrapper className="inline w-fit">
      <Collapsible
        className={cn(
          'content bg-grayAlpha-100 w-fit rounded mb-0.5',
          open && 'w-full',
        )}
        open={open}
        onOpenChange={setOpen}
      >
        <CollapsibleTrigger className="p-1 px-2 h-full flex gap-0 items-center">
          <div className="px-0">
            {!open ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
          </div>
          <div className="flex gap-2 items-center">
            {getIcon()}
            {currentAgent?.name ?? 'Sigma'}
            <Badge
              variant="secondary"
              className="text-muted-foreground font-mono text-xs items-center"
            >
              {snakeToTitleCase(name)}
            </Badge>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>\</CollapsibleContent>
      </Collapsible>
    </NodeViewWrapper>
  );
});
