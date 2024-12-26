import {
  CanceledLine,
  DoneFill,
  InProgressLine,
  InReviewLine,
  TodoLine,
} from '@tegonhq/ui';

export const STATUS_ICONS = {
  Todo: TodoLine,
  'In Progress': InProgressLine,
  'In Review': InReviewLine,
  Done: DoneFill,
  Canceled: CanceledLine,
};

export function getStatusIcon(status: string) {
  return STATUS_ICONS[status as keyof typeof STATUS_ICONS];
}

export function getStatusColor(status: string) {
  if (status === 'Todo') {
    const cssVar = `var(--status-pill-2)`;

    return {
      background: cssVar,
      color: `var(--status-icon-2)`,
    };
  }

  if (status === 'In Progress') {
    const cssVar = `var(--status-pill-4)`;

    return {
      background: cssVar,
      color: `var(--status-icon-4)`,
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
