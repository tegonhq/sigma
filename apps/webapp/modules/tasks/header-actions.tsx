import { AddLine, Button } from '@tegonhq/ui';
import React from 'react';

import { AddTaskDialogContext } from './add-task';

export const HeaderActions = () => {
  const { setDialogOpen } = React.useContext(AddTaskDialogContext);

  return (
    <Button
      className="gap-1"
      variant="secondary"
      onClick={() => setDialogOpen(true)}
    >
      <AddLine size={14} />
      Add task
    </Button>
  );
};
