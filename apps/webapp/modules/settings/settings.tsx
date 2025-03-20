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
} from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';
import React from 'react';

import { Integrations } from './integrations';
import { Workspace } from './workspace';

interface SettingsProps {
  open: boolean;
  setOpen: (value: boolean) => void;
}

const COMPONENTS_MAP = {
  Workspace,
  Integrations,
};

export const Settings = observer(({ open, setOpen }: SettingsProps) => {
  const [settingsView, setSettingsView] = React.useState('Workspace');
  const data = {
    nav: [
      { name: 'Workspace', icon: BuildingLine },
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
                  <SidebarMenu>
                    {data.nav.map((item) => (
                      <SidebarMenuItem key={item.name}>
                        <SidebarMenuButton
                          asChild
                          isActive={item.name === settingsView}
                          onClick={() => setSettingsView(item.name)}
                          className={cn(
                            'h-7 rounded px-2 py-1 flex items-center gap-1 justify-between text-foreground bg-grayAlpha-100 w-fit',
                          )}
                        >
                          <a href="#">
                            <item.icon className="h-4 w-4" />
                            <span>{item.name}</span>
                          </a>
                        </SidebarMenuButton>
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
