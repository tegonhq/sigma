import dynamic from 'next/dynamic';

export * from './side-task-view';
export * from './side-task-view-context';

export const TaskViewProvider = dynamic(
  () => import('./side-task-view-context').then((mod) => mod.TaskViewProvider),
  {
    ssr: false,
  },
);
