import {
  createRemoteComponent,
  createRequires,
  createUseRemoteComponent,
} from '@paciolan/remote-component';

import { resolve } from '../remote-component.config.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const requires = createRequires(resolve as any);

export const RemoteComponent = createRemoteComponent({ requires });

export const useRemoteComponent = createUseRemoteComponent({ requires });
