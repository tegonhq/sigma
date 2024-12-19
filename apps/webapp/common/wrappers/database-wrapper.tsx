import { Loader } from '@tegonhq/ui';
import * as React from 'react';

import { hash } from 'common/common-utils';

import { useWorkspace } from 'hooks/workspace';

import { initDatabase } from 'store/database';
import { UserContext } from 'store/user-context';

interface Props {
  children: React.ReactElement;
}

export function DatabaseWrapper(props: Props): React.ReactElement {
  const { children } = props;
  const workspace = useWorkspace();
  const user = React.useContext(UserContext);
  const [loading, setLoading] = React.useState(true);
  const hashKey = `${workspace.id}__${user.id}`;

  React.useEffect(() => {
    if (workspace) {
      initDatabase(hash(hashKey));
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspace]);

  if (loading) {
    return <Loader text="Starting database..." />;
  }

  return <>{children}</>;
}
