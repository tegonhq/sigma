import { AddLine, Button, Card, EditLine } from '@redplanethq/ui';
import { EditorContent, useEditor } from '@tiptap/react';
import { Trash2 } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import React from 'react';

import { CustomMention } from 'modules/conversation/suggestion-extension';

import { extensionsForConversation } from 'common/editor';

import {
  useCreateAutomationMutation,
  useDeleteAutomationMutation,
  useUpdateAutomationMutation,
} from 'services/automation';
import { useGetIntegrationDefinitions } from 'services/integration-definition';

import { useContextStore } from 'store/global-context-provider';

import { SettingSection } from '../setting-section';
import { EditorAutomation } from './editor-automation';

export const Automation = observer(
  ({ automationId }: { automationId: string }) => {
    const { automationsStore } = useContextStore();
    const [update, setUpdate] = React.useState(false);
    const automation = automationsStore.getAutomationById(automationId);
    const { mutate: deleteAutomation } = useDeleteAutomationMutation({});
    const { mutate: updateAutomation } = useUpdateAutomationMutation({});

    const editor = useEditor({
      extensions: [...extensionsForConversation, CustomMention],
      editable: false,
      content: automation.text,
    });

    if (!automation) {
      return null;
    }

    if (update) {
      return (
        <EditorAutomation
          defaultValue={automation.text}
          onSend={(value, agents) => {
            updateAutomation({
              text: value,
              mcps: agents,
              automationId: automation.id,
            });
            setUpdate(false);
          }}
          className="min-w-3xl"
          onClose={() => setUpdate(false)}
        />
      );
    }

    return (
      <Card className="p-2">
        <EditorContent editor={editor} />
        <div className="flex justify-between items-center mt-2">
          <div className="text-muted-foreground text-sm">
            Ran
            <span className="mx-1 text-muted-foreground">
              {automation.usedCount}
            </span>
            times
          </div>

          <div className="flex">
            <Button variant="ghost" onClick={() => setUpdate(true)}>
              <EditLine size={14} />
            </Button>
            <Button
              variant="ghost"
              onClick={() => deleteAutomation({ automationId })}
            >
              <Trash2 size={14} />
            </Button>
          </div>
        </div>
      </Card>
    );
  },
);

export const Automations = observer(() => {
  const [addAutomation, setAddAutomation] = React.useState(false);
  const { automationsStore } = useContextStore();
  const { isLoading } = useGetIntegrationDefinitions();
  const { mutate: createAutomation } = useCreateAutomationMutation({
    onSuccess: () => {
      setAddAutomation(false);
    },
  });

  if (isLoading) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 w-3xl mx-auto px-4 py-6">
      <SettingSection
        title="Automations"
        description="Edit user automations"
        actions={
          <Button
            variant="secondary"
            className="gap-1"
            onClick={() => setAddAutomation(true)}
          >
            <AddLine size={14} /> Add automation
          </Button>
        }
      >
        {addAutomation && (
          <EditorAutomation
            onSend={(value, agents) => {
              createAutomation({ text: value, mcps: agents });
              setAddAutomation(false);
            }}
            onClose={() => setAddAutomation(false)}
            className="min-w-[500px]"
          />
        )}
        {automationsStore.automations.map((automation, index) => (
          <Automation automationId={automation.id} key={index} />
        ))}
      </SettingSection>
    </div>
  );
});
