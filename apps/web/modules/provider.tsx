'use client';

import { ThemeProvider } from '@sigma/ui/components/theme-provider';
import { Toaster } from '@sigma/ui/components/toaster';
import { TooltipProvider } from '@sigma/ui/components/tooltip';
import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import { HotkeysProvider } from 'react-hotkeys-hook';
import { QueryClientProvider } from 'react-query';
import { SuperTokensWrapper } from 'supertokens-auth-react';

import { useGetQueryClient } from 'common/lib';
import { SCOPES } from 'common/shortcut-scopes';

import { StoreContext, storeContextStore } from 'store/global-context-provider';

interface ProviderProps {
  children: React.ReactNode;
}

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
            <TooltipProvider delayDuration={500}>
              <StoreContext.Provider value={storeContextStore}>
                <QueryClientProvider client={queryClientRef.current}>
                  {children}

                  <Toaster />
                </QueryClientProvider>
              </StoreContext.Provider>
            </TooltipProvider>
          </HotkeysProvider>
        </ThemeProvider>
      </PostHogProvider>
    </SuperTokensWrapper>
  );
}
