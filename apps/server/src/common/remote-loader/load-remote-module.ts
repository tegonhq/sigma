/**
 * src/lib/loadRemoteModule.js
 */

import createLoadRemoteModule from '@paciolan/remote-module-loader';
import axios from 'axios';

const fetcher = (url: string) => axios.get(url).then((request) => request.data);

export default createLoadRemoteModule({ fetcher });
