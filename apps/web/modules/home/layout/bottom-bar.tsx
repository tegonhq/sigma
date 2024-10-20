import { Button } from '@sigma/ui/components/button';
import { CreateIssueLine, HelpLine, SearchLine } from '@sigma/ui/icons';
import React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

import { SCOPES } from 'common/shortcut-scopes';

export function BottomBar() {
  return (
    <div className="w-full flex justify-between px-6 py-4">
      <Button
        variant="link"
        onClick={() => {
          window.open('https://docs.mysigma.ai', '_blank');
        }}
      >
        <HelpLine size={20} />
      </Button>

      <Button variant="link" isActive className="px-3">
        <CreateIssueLine size={20} />
      </Button>

      <Button variant="link">
        <SearchLine size={20} />
      </Button>
    </div>
  );
}
