import React from 'react';

import type { User } from 'common/types';

export const UserContext = React.createContext<User>(undefined);
