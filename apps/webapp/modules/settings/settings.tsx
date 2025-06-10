import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarProvider,
  cn,
  BuildingLine,
  StackLine,
  SidebarHeader,
  SettingsLine,
  Button,
  AI,
  ArrowLeft,
} from '@redplanethq/ui';
import { Brain, Clock, Workflow } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { useRouter } from 'next/router';
import React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { Key } from 'ts-key-enum';

import { Provider } from 'modules/provider';

import { SCOPES } from 'common/shortcut-scopes';
import { AllProviders } from 'common/wrappers/all-providers';

import { Activities } from './activity';
import { Automations } from './automations';
import { Integrations } from './integrations';
import { MCP } from './mcp';
import { Memory } from './memory';
import { Preferences } from './preferences';
import { Workspace } from './workspace';

const COMPONENTS_MAP = {
  Workspace,
  Integrations,
  Preferences,
  MCP,
  Memory,
  Automations,
  Activities,
};

export const Settings = observer(() => {
  const { query, replace } = useRouter();
  const defaultSettings =
    query?.settings && query.settings !== '' ? query?.settings : 'Workspace';

  const [settingsView, setSettingsView] = React.useState(defaultSettings);
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
      { name: 'Activities', icon: Clock },
    ],
  };

  const Component = COMPONENTS_MAP[settingsView as keyof typeof COMPONENTS_MAP];

  const gotoHome = () => {
    replace('/home');
  };

  useHotkeys(
    Key.Escape,
    () => {
      gotoHome();
    },
    {
      scopes: [SCOPES.Global],
    },
  );

  return (
    <Provider>
      <AllProviders>
        <div className="w-full h-full overflow-hidden p-0 bg-background">
          <SidebarProvider className="items-start">
            <Sidebar collapsible="none" className="hidden md:flex w-[180px]">
              <SidebarHeader className="pb-0 flex justify-start">
                <Button
                  variant="link"
                  className="w-fit flex gap-2"
                  onClick={gotoHome}
                >
                  <ArrowLeft size={14} />
                  Back to app
                </Button>
              </SidebarHeader>
              <SidebarContent className="bg-background mt-2">
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
            <main className="flex flex-1 flex-col p-2 pl-0 h-[100vh] overflow-hidden">
              <div className="bg-background-2 flex h-full flex-1 flex-col rounded-md overflow-y-auto">
                <Component />
              </div>
            </main>
          </SidebarProvider>
        </div>
      </AllProviders>
    </Provider>
  );
});
