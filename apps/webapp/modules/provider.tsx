/* eslint-disable @typescript-eslint/no-explicit-any */
import { TooltipProvider, Toaster } from '@tegonhq/ui';
import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import React from 'react';
import { HotkeysProvider } from 'react-hotkeys-hook';
import { QueryClientProvider } from 'react-query';
import { SuperTokensWrapper } from 'supertokens-auth-react';

import { initPosthog } from 'common/init-config';
import { useGetQueryClient } from 'common/lib';
import { SCOPES } from 'common/shortcut-scopes';
import { ThemeProvider } from 'common/theme-provider';
import { TaskViewProvider } from 'layouts/side-task-view';

import { StoreContext, storeContextStore } from 'store/global-context-provider';

import { DialogViewsProvider } from './dialog-views-provider';

interface ProviderProps {
  children: React.ReactNode;
}

initPosthog();

export function Provider({ children }: ProviderProps) {
  const queryClientRef = useGetQueryClient();

  return (
    <SuperTokensWrapper>
      <PostHogProvider client={posthog}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <HotkeysProvider initiallyActiveScopes={[SCOPES.Global]}>
            <TooltipProvider delayDuration={2000} disableHoverableContent>
              <StoreContext.Provider value={storeContextStore as any}>
                <QueryClientProvider client={queryClientRef.current}>
                  <TaskViewProvider>
                    <DialogViewsProvider>{children}</DialogViewsProvider>
                    <Toaster />
                  </TaskViewProvider>
                </QueryClientProvider>
              </StoreContext.Provider>
            </TooltipProvider>
          </HotkeysProvider>
        </ThemeProvider>
      </PostHogProvider>
    </SuperTokensWrapper>
  );
}
