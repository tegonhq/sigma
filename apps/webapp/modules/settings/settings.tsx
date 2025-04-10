import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  Dialog,
  DialogContent,
  cn,
  BuildingLine,
  StackLine,
  SidebarHeader,
  SettingsLine,
  Button,
} from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';
import React from 'react';

import { Integrations } from './integrations';
import { Preferences } from './preferences';
import { Workspace } from './workspace';

interface SettingsProps {
  open: boolean;
  setOpen: (value: boolean) => void;
}

const COMPONENTS_MAP = {
  Workspace,
  Integrations,
  Preferences,
};

export const Settings = observer(({ open, setOpen }: SettingsProps) => {
  const [settingsView, setSettingsView] = React.useState('Workspace');
  const data = {
    nav: [
      { name: 'Workspace', icon: BuildingLine },
      { name: 'Preferences', icon: SettingsLine },
      { name: 'Integrations', icon: StackLine },
    ],
  };

  const Component = COMPONENTS_MAP[settingsView as keyof typeof COMPONENTS_MAP];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-[70vw] min-w-[50vw] max-h-[70vh] overflow-hidden p-0 bg-background">
        <SidebarProvider className="items-start">
          <Sidebar collapsible="none" className="hidden md:flex w-[180px]">
            <SidebarHeader className="pb-0">
              <h2 className="pt-3"> Settings </h2>
            </SidebarHeader>
            <SidebarContent className="bg-background">
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu className="gap-0.5">
                    {data.nav.map((item) => (
                      <SidebarMenuItem key={item.name}>
                        <Button
                          variant="secondary"
                          isActive={item.name === settingsView}
                          onClick={() => setSettingsView(item.name)}
                          className={cn(
                            'flex gap-1 w-fit min-w-0 justify-start',
                          )}
                        >
                          <item.icon size={18} />
                          <span>{item.name}</span>
                        </Button>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
          <main className="flex flex-1 flex-col p-2 pl-0 h-[70vh] overflow-hidden">
            <div className="bg-background-2 flex h-full flex-1 flex-col rounded-md overflow-y-auto">
              <Component />
            </div>
          </main>
        </SidebarProvider>
      </DialogContent>
    </Dialog>
  );
});
