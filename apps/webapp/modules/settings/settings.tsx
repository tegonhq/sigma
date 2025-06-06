import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
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
  AI,
} from '@redplanethq/ui';
import { Brain, Workflow } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import React from 'react';

import { Automations } from './automations';
import { Integrations } from './integrations';
import { MCP } from './mcp';
import { Memory } from './memory';
import { Preferences } from './preferences';
import { Workspace } from './workspace';

interface SettingsProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  defaultPage?: string;
}

const COMPONENTS_MAP = {
  Workspace,
  Integrations,
  Preferences,
  MCP,
  Memory,
  Automations,
};

export const Settings = observer(
  ({ open, setOpen, defaultPage }: SettingsProps) => {
    const [settingsView, setSettingsView] = React.useState(
      defaultPage ?? 'Workspace',
    );
    const data = {
      nav: [
        { name: 'Workspace', icon: BuildingLine },
        { name: 'Preferences', icon: SettingsLine },
        { name: 'Integrations', icon: StackLine },
      ],
      ai: [
        { name: 'MCP', icon: AI },
        { name: 'Memory', icon: Brain },
        { name: 'Automations', icon: Workflow },
      ],
    };

    const Component =
      COMPONENTS_MAP[settingsView as keyof typeof COMPONENTS_MAP];

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-full h-full overflow-hidden p-0 bg-background">
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

                <SidebarGroup>
                  <h3 className="text-sm text-muted-foreground mb-1 flex justify-between items-center">
                    <p>AI</p>
                  </h3>
                  <SidebarGroupContent>
                    <SidebarMenu className="gap-0.5">
                      {data.ai.map((item) => (
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
  },
);
