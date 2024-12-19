import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  Button,
  IssuesLine,
} from '@tegonhq/ui';
import React from 'react';

import { useEditor } from 'common/editor';

export function isValidUrl(url: string) {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}

export function getUrlFromString(str: string) {
  if (isValidUrl(str)) {
    return str;
  }
  try {
    if (str.includes('.') && !str.includes(' ')) {
      return new URL(`https://${str}`).toString();
    }
  } catch (e) {
    return null;
  }

  return null;
}

export interface TaskContent {
  text: string;
  start: number;
  end: number;
}

interface TaskSelectorProps {
  onCreate: (tasks: TaskContent[]) => void;
}

export const TaskSelector = ({ onCreate }: TaskSelectorProps) => {
  const { editor } = useEditor();

  const processNodes = () => {
    const selection = editor.view.state.selection;
    const textContent = [
      {
        text: editor.state.doc.textBetween(selection.from, selection.to),
        start: selection.from,
        end: selection.to,
      },
    ];

    return textContent;
  };

  const createTask = () => {
    const textContent = processNodes();
    onCreate && onCreate(textContent);
  };

  return (
    <div className="flex">
      <Tooltip>
        <TooltipTrigger>
          <Button
            variant="ghost"
            onClick={createTask}
            className="gap-2 rounded border-none hover:bg-accent hover:text-accent-foreground"
          >
            <IssuesLine size={16} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Create task</TooltipContent>
      </Tooltip>
    </div>
  );
};
