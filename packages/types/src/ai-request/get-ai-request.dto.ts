import { LLMModelEnum } from '../prompt';

export interface GetAIRequestDTO {
  messages: any[];
  model: string;
  llmModel: LLMModelEnum;
}
