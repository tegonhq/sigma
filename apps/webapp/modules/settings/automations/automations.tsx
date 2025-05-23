import { AddLine, Button, Card } from '@tegonhq/ui';
import { EditorContent, useEditor } from '@tiptap/react';
import { Trash2 } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import React from 'react';

import { CustomMention } from 'modules/conversation/suggestion-extension';

import { extensionsForConversation } from 'common/editor';

import {
  useCreateAutomationMutation,
  useDeleteAutomationMutation,
} from 'services/automation';
import { useGetIntegrationDefinitions } from 'services/integration-definition';

import { useContextStore } from 'store/global-context-provider';

import { SettingSection } from '../setting-section';
import { AddAutomation } from './add-automation';

export const Automation = observer(
  ({ automationId }: { automationId: string }) => {
    const { automationsStore } = useContextStore();
    const automation = automationsStore.getAutomationById(automationId);
    const { mutate: deleteAutomation } = useDeleteAutomationMutation({});

    const editor = useEditor({
      extensions: [...extensionsForConversation, CustomMention],
      editable: false,
      content: automation.text,
    });

    if (!automation) {
      return null;
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

          <Button
            variant="ghost"
            onClick={() => deleteAutomation({ automationId })}
          >
            <Trash2 size={14} />
          </Button>
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
    <div className="flex flex-col gap-2">
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
          <AddAutomation
            onSend={(value, agents) => {
              createAutomation({ text: value, mcps: agents });
            }}
            onClose={() => setAddAutomation(false)}
          />
        )}
        {automationsStore.automations.map((automation, index) => (
          <Automation automationId={automation.id} key={index} />
        ))}
      </SettingSection>
    </div>
  );
});
