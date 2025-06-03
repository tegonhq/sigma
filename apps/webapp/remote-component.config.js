/**
 * Dependencies for Remote Components
 */

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as TegonUI from '@redplanethq/ui';
import * as ReactQuery from 'react-query';
import axios from 'axios';

const resolve = {
  react: React,
  'react-dom': ReactDOM,
  '@redplanethq/ui': TegonUI,
  axios,
  'react-query': ReactQuery,
};

export { resolve };
