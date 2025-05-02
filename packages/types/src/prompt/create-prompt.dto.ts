import { IsEnum, IsOptional, IsString } from 'class-validator';

import { LLMModelEnum, LLMModelType } from './prompt.entity';

export class PromptInput {
  @IsString()
  name: string;

  @IsString()
  prompt: string;

  @IsOptional()
  @IsEnum(LLMModelEnum)
  model: LLMModelType;
}
