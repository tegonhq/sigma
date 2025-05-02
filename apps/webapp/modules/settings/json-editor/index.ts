import dynamic from 'next/dynamic';

export const JSONEditor = dynamic(
  () => import('./json-editor').then((mod) => ({ default: mod.JSONEditor })),
  {
    ssr: false,
  },
);
