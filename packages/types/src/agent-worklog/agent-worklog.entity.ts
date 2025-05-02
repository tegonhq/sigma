import { ModelName } from '../sync-action';
import { Workspace } from '../workspace';

export enum AgentWorklogStateEnum {
  Thinking = 'Thinking',
  Failed = 'Failed',
  Done = 'Done',
}

export const AgentWorklogState = {
  Thinking: 'Thinking',
  Failed: 'Failed',
  Done: 'Done',
};

export type AgentWorklogState =
  (typeof AgentWorklogState)[keyof typeof AgentWorklogState];

export class AgentWorklog {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deleted?: Date;

  modelName: ModelName;
  modelId: string;
  state: AgentWorklogState;
  type: string;

  workspaceId: string;
  workspace: Workspace;
}
