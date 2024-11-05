import {
  AssigneeLine,
  InProgressLine,
  LabelLine,
  PriorityHigh,
  SubIssue,
} from '@sigma/ui/icons';

export const allCommands = [
  {
    name: 'Status',
    id: 'status',
    Icon: InProgressLine,
  },
  {
    name: 'Label',
    id: 'labelIds',
    Icon: LabelLine,
  },
  {
    name: 'Priority',
    id: 'priority',
    Icon: PriorityHigh,
  },
  {
    name: 'Create sub-issue',
    id: 'create-sub-issue',
    Icon: SubIssue,
  },
];
