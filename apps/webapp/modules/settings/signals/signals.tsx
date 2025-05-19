import { Loader } from '@tegonhq/ui';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { observer } from 'mobx-react-lite';
import React from 'react';

import {
  CustomMention,
  useMentionSuggestions,
} from 'modules/conversation/suggestion-extension';

import {
  contextExtensions,
  Editor,
  EditorContextProvider,
  EditorExtensions,
  lowlight,
  suggestionItems,
} from 'common/editor';
import type { PageType } from 'common/types';

import { useGetIntegrationDefinitions } from 'services/integration-definition';
import { useUpdatePageMutation } from 'services/pages';

import { useContextStore } from 'store/global-context-provider';

import { SettingSection } from '../setting-section';
import { generateHTML } from '@tiptap/react';

interface SignalsEditorProps {
  page: PageType;
  placeholder: string;
  onChange: (value: string) => void;
  defaultValue: string;
}

export const SignalsEditor = observer(
  ({ page, placeholder, onChange, defaultValue }: SignalsEditorProps) => {
    const suggestion = useMentionSuggestions();

    if (!page) {
      return null;
    }

    const onDescriptionChange = (value: string) => {
      const valueJson = JSON.parse(value);

      onChange(valueJson.json);
    };

    return (
      <EditorContextProvider source={{}}>
        <Editor
          value={defaultValue}
          onChange={onDescriptionChange}
          extensions={[
            ...contextExtensions,
            CodeBlockLowlight.configure({
              lowlight,
            }),
            CustomMention.configure({
              suggestion,
            }),
          ]}
          placeholder={placeholder}
          autoFocus
          className="px-2 min-h-[200px]"
        >
          <EditorExtensions
            suggestionItems={suggestionItems}
          ></EditorExtensions>
        </Editor>
      </EditorContextProvider>
    );
  },
);

export const Signals = observer(() => {
  const { pagesStore } = useContextStore();
  const page = pagesStore.getContextPage();
  const { isLoading } = useGetIntegrationDefinitions();
  const { mutate: updatePage } = useUpdatePageMutation({});

  if (isLoading) {
    return <Loader />;
  }

  const onChange = (value: string, key: string) => {
    console.log(value);
  };

  const getDefaultValue = (value: string, key: string) => {
    return '';
  };

  return (
    <div className="flex flex-col gap-2">
      <SettingSection
        title="Context"
        description="Edit user preferences/memory"
      >
        <div className="flex flex-col gap-2">
          <h3> Memory </h3>
          <SignalsEditor
            page={page}
            placeholder="Write about you"
            onChange={(value) => onChange(value, 'memory')}
            defaultValue={getDefaultValue(page.description, 'memory')}
          />

          <h3> Automations </h3>
          <SignalsEditor
            page={page}
            placeholder="Write any automation from activity"
            onChange={(value) => onChange(value, 'automations')}
            defaultValue={getDefaultValue(page.description, 'automations')}
          />
        </div>
      </SettingSection>
    </div>
  );
});
