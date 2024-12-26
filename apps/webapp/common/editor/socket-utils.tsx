import getConfig from 'next/config';

const { publicRuntimeConfig } = getConfig();

export function getSocketURL() {
  return publicRuntimeConfig.NEXT_PUBLIC_NODE_ENV === 'production'
    ? `wss://${publicRuntimeConfig.NEXT_PUBLIC_CONTENT_HOST}`
    : `ws://${publicRuntimeConfig.NEXT_PUBLIC_CONTENT_HOST}`;
}
