import type { Agent } from './mention-list';
import Image from 'next/image';

import { cn } from '@tegonhq/ui';
import Mention from '@tiptap/extension-mention';
import {
  mergeAttributes,
  type NodeViewProps,
  NodeViewWrapper,
  ReactNodeViewRenderer,
} from '@tiptap/react';
import { observer } from 'mobx-react-lite';

import { getIcon, type IconType } from 'common/icon-utils';

import { useMentionSuggestions } from './use-agent-suggestions';
import { useMCPServers } from './use-mcp';

export const MentionComponent = observer((props: NodeViewProps) => {
  const mcpServers = useMCPServers();

  const agent = mcpServers.find((ag) => ag.key === props.node.attrs.id);
  const Icon = getIcon(agent.key as IconType);

  return (
    <NodeViewWrapper className="inline w-fit">
      <span
        className={cn(
          'mention bg-grayAlpha-100 px-1 rounded-sm text-foreground inline-flex w-fit items-center gap-1 h-5 relative top-0.5',
        )}
      >
        {agent.name === 'Sigma' ? (
          <Image
            src="/logo_light.svg"
            alt="logo"
            key={1}
            width={14}
            height={14}
          />
        ) : (
          <Icon size={14} className="rounded-sm" />
        )}
        {agent?.name}
      </span>
    </NodeViewWrapper>
  );
});

export const CustomMention = Mention.extend({
  parseHTML() {
    return [
      {
        tag: 'agent',
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      'agent',
      mergeAttributes(HTMLAttributes),
      HTMLAttributes['data-id'],
    ];
  },
  addNodeView() {
    return ReactNodeViewRenderer(MentionComponent);
  },
});

export { useMentionSuggestions };
export type { Agent };
