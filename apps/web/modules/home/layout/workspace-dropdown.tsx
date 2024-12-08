import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Button,
  AvatarText,
} from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';
import { useRouter } from 'next/navigation';
import React from 'react';
import { signOut } from 'supertokens-auth-react/recipe/session';

import { useContextStore } from 'store/global-context-provider';

export const WorkspaceDropdown = observer(() => {
  const { workspaceStore } = useContextStore();
  const { push, replace } = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <div className="flex justify-between gap-2 items-center">
            <AvatarText text={workspaceStore.workspace.name} noOfChar={1} />
            <div className="truncate"> {workspaceStore.workspace.name}</div>
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="min-w-60" align="start">
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => {
              push(`/settings/account/profile`);
            }}
          >
            Preferences
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuItem
          onClick={async () => {
            await signOut();

            replace('/auth');
          }}
        >
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});
