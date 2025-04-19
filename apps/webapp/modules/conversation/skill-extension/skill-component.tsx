import { NodeViewWrapper } from '@tiptap/react';
import { observer } from 'mobx-react-lite';

import { getIcon, type IconType } from 'common/icon-utils';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SkillComponent = observer((props: any) => {
  const id = props.node.attrs.id;
  const name = props.node.attrs.name;
  const agent = props.node.attrs.agent;
  const Icon = getIcon(agent as IconType);

  if (id === 'undefined' || id === undefined || !name) {
    return null;
  }

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
      <div className="content">
        <div className="bg-grayAlpha-100 p-1 w-fit rounded px-2 flex gap-1 items-center">
          <Icon size={16} className="rounded-sm" />
          {snakeToTitleCase(name)}
        </div>
      </div>
    </NodeViewWrapper>
  );
});
