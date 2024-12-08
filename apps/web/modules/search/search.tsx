'use client';

import { observer } from 'mobx-react-lite';
import React from 'react';

import { SearchEditor } from './editor';

export const Search = observer(() => {
  return <SearchEditor />;
});

export const SearchWrapper = () => {
  return <Search />;
};
