import {
  CanceledLine,
  DoneFill,
  InReviewLine,
  TodoLine,
} from '@redplanethq/ui';

export const STATUS_ICONS = {
  Todo: TodoLine,
  'In Review': InReviewLine,
  Done: DoneFill,
  Canceled: CanceledLine,
};

export function getStatusIcon(status: string) {
  return STATUS_ICONS[status as keyof typeof STATUS_ICONS];
}

export function getStatusColor(status: string) {
  if (status === 'Todo') {
    const cssVar = `var(--status-pill-3)`;

    return {
      background: cssVar,
      color: `var(--status-icon-3)`,
    };
  }

  if (status === 'Done') {
    const cssVar = `var(--status-pill-6)`;

    return {
      background: cssVar,
      color: `var(--status-icon-6)`,
    };
  }

  if (status === 'Canceled') {
    const cssVar = `var(--status-pill-3)`;

    return {
      background: cssVar,
      color: `var(--status-icon-3)`,
    };
  }

  const cssVar = `var(--status-pill-2)`;

  return {
    background: cssVar,
    color: `var(--status-icon-2)`,
  };
}
