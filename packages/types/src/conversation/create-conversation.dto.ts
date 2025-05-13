import { IsObject, IsOptional, IsString } from 'class-validator';

export class CreateConversationDto {
  @IsString()
  message: string;

  @IsObject()
  @IsOptional()
  context?: Record<string, any>;

  @IsString()
  @IsOptional()
  pageId?: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  conversationId?: string;
}
