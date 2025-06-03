import { Loader } from '@redplanethq/ui';
import { useRouter } from 'next/router';
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
  const router = useRouter();
  const user = React.useContext(UserContext);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (workspace) {
      const hashKey = `${workspace.id}__${user.id}`;
      initDatabase(hash(hashKey));
      setLoading(false);
    } else {
      router.replace('/onboarding');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspace]);

  if (loading) {
    return <Loader text="Starting database..." />;
  }

  return <>{children}</>;
}
