import { HocuspocusProviderWebsocket } from '@hocuspocus/provider';
import { Loader } from '@redplanethq/ui';
import posthog from 'posthog-js';
import * as React from 'react';

import { getSocketURL } from 'common/editor';

import { useGetUserQuery } from 'services/users';

import { UserContext } from 'store/user-context';

// Create a context for the socket provider
export const SocketContext =
  React.createContext<HocuspocusProviderWebsocket | null>(null);

interface Props {
  children: React.ReactElement;
}

export function UserDataWrapper(props: Props): React.ReactElement {
  const { children } = props;
  const { data, error: isError, isLoading } = useGetUserQuery();
  const [socketProvider, setSocketProvider] =
    React.useState<HocuspocusProviderWebsocket | null>(null);

  React.useEffect(() => {
    if (!isLoading && !isError) {
      posthog.identify(
        data.id, // Replace 'distinct_id' with your user's unique identifier
        { email: data.email, name: data.fullname }, // optional: set additional person properties
      );

      // Initialize the socket provider
      const socket = new HocuspocusProviderWebsocket({ url: getSocketURL() });

      setSocketProvider(socket);
    }

    return () => {
      // Clean up the provider when component unmounts
      if (socketProvider) {
        socketProvider.destroy();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!isLoading, !isError]);

  if (!isLoading && !isError) {
    return (
      <UserContext.Provider value={data}>
        <SocketContext.Provider value={socketProvider}>
          {children}
        </SocketContext.Provider>
      </UserContext.Provider>
    );
  }

  return <Loader text="Loading user data" />;
}
