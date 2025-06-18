import type { ReactElement } from 'react';

import { Logo } from 'common/logo';

interface Props {
  children: React.ReactNode;
}

export function AuthLayout(props: Props): ReactElement {
  const { children } = props;

  return (
    <div className="flex h-screen w-screen flex-col justify-center items-center">
      <div className="pt-8 flex flex-col items-center">
        <Logo width={60} height={50} />
        <div className="font-mono">SOL</div>
      </div>

      <div className="flex-grow flex justify-center items-center h-full">
        {children}
      </div>
    </div>
  );
}
