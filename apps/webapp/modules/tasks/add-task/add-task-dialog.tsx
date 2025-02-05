import { Dialog, DialogContent } from '@tegonhq/ui';
import React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { Key } from 'ts-key-enum';

import { SCOPES } from 'common/shortcut-scopes';

import { AddTask } from './add-task';

export const AddTaskDialog = () => {
  const [dialogOpen, setDialogOpen] = React.useState(false);

  useHotkeys(
    [`${Key.Meta}+n`],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    () => {
      setDialogOpen(true);
    },
    {
      scopes: [SCOPES.Global],
      enableOnFormTags: true,
      enableOnContentEditable: true,
    },
  );
  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent
        closeIcon={false}
        className="sm:max-w-[600px] min-w-[600px] gap-2"
      >
        <AddTask onCancel={() => setDialogOpen(false)} />
      </DialogContent>
    </Dialog>
  );
};
