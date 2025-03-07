import { Workspace } from '../workspace/workspace.entity';

export enum LLMModelEnum {
  GPT35TURBO = 'GPT35TURBO',
  GPT4TURBO = 'GPT4TURBO',
  GPT4O = 'GPT4O',
  LLAMA3 = 'LLAMA3',
  CLAUDEOPUS = 'CLAUDEOPUS',
  CLAUDESONNET = 'CLAUDESONNET',
  CLAUDEHAIKU = 'CLAUDEHAIKU',
}

export const LLMModelType = {
  GPT35TURBO: 'GPT35TURBO',
  GPT4TURBO: 'GPT4TURBO',
  GPT4O: 'GPT4O',
  LLAMA3: 'LLAMA3',
  CLAUDEOPUS: 'CLAUDEOPUS',
  CLAUDESONNET: 'CLAUDESONNET',
  CLAUDEHAIKU: 'CLAUDEHAIKU',
};

export enum LLMMappings {
  GPT35TURBO = 'gpt-3.5-turbo',
  GPT4TURBO = 'gpt-4-turbo',
  GPT4O = 'gpt-4o',
  LLAMA3 = 'llama3',
  CLAUDEOPUS = 'claude-3-opus-20240229',
  CLAUDESONNET = 'claude-3-7-sonnet-20250219',
  CLAUDEHAIKU = 'claude-3-5-haiku-20241022',
}

export const OpenAIModels = [
  LLMModelEnum.GPT35TURBO,
  LLMModelEnum.GPT4TURBO,
  LLMModelEnum.GPT4O,
];
export const ClaudeModels = [
  LLMModelEnum.CLAUDEOPUS,
  LLMModelEnum.CLAUDESONNET,
  LLMModelEnum.CLAUDEHAIKU,
];

export type LLMModelType = (typeof LLMModelType)[keyof typeof LLMModelType];

export class Prompt {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deleted: Date | null;
  name: string;
  prompt: string;

  model: LLMModelType;
  workspace?: Workspace;
  workspaceId: string;
}
