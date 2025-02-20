import Mention from '@tiptap/extension-mention';
import { PluginKey } from '@tiptap/pm/state';

import { renderItems } from './link-task-utils';

export const LinkTaskExtension = Mention.extend({
  namepe: 'linkTask',
}).configure({
  suggestion: {
    char: '[[',
    pluginKey: new PluginKey('linkTaskSuggestion'),
    allowSpaces: true,
    items: () => [],
    render: renderItems,
  },
});
