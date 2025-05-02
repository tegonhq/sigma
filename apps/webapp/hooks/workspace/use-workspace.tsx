import * as React from 'react';

import { UserContext } from 'store/user-context';

export function useWorkspace() {
  const user = React.useContext(UserContext);

  return user.workspace;
}
