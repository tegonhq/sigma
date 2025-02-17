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
import { useRouter } from 'next/router';
import React from 'react';
import { signOut } from 'supertokens-auth-react/recipe/session';

import { Settings } from 'modules/settings';

import { useContextStore } from 'store/global-context-provider';

export const WorkspaceDropdown = observer(() => {
  const { workspaceStore } = useContextStore();
  const { replace } = useRouter();
  const [settingsOpen, setSettingsOpen] = React.useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="hover:bg-transparent justify-between gap-2 items-center shrink min-w-[0px] max-w-[150px]"
          >
            <div className="flex justify-between gap-2 items-center">
              <AvatarText text={workspaceStore.workspace.name} noOfChar={1} />
            </div>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="min-w-60" align="start">
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() => {
                setSettingsOpen(true);
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

      <Settings open={settingsOpen} setOpen={setSettingsOpen} />
    </>
  );
});
