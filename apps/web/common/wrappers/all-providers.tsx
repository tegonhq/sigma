import { SessionAuth } from 'supertokens-auth-react/recipe/session';

import { UserDataWrapper } from 'common/wrappers/user-data-wrapper';

import { BootstrapWrapper } from './bootstrap-data';
import { DatabaseWrapper } from './database-wrapper';
import { SocketDataSyncWrapper } from './socket-data-sync';
import { WorkspaceStoreInit } from './workspace-store-provider';

export const AllProviders = ({
  children,
}: {
  children: React.ReactElement;
}) => {
  return (
    <SessionAuth>
      <UserDataWrapper>
        <DatabaseWrapper>
          <BootstrapWrapper>
            <WorkspaceStoreInit>
              <SocketDataSyncWrapper>{children}</SocketDataSyncWrapper>
            </WorkspaceStoreInit>
          </BootstrapWrapper>
        </DatabaseWrapper>
      </UserDataWrapper>
    </SessionAuth>
  );
};
