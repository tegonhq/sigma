'use client';

import { observer } from 'mobx-react-lite';
import React from 'react';

import { CommandComponent } from './command';

export const Search = observer(() => {
  return <CommandComponent />;
});

export const SearchWrapper = () => {
  return <Search />;
};
