/**
 * Dependencies for Remote Components
 */

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as TegonUI from '@tegonhq/ui';
import * as ReactQuery from 'react-query';
import axios from 'axios';

const resolve = {
  react: React,
  'react-dom': ReactDOM,
  '@tegonhq/ui': TegonUI,
  axios,
  'react-query': ReactQuery,
};

export { resolve };
