import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';

import { UserTypeEnum } from '../conversation-history';

export class CreateConversationDto {
  @IsString()
  message: string;

  @IsEnum(UserTypeEnum)
  userType: UserTypeEnum;

  @IsObject()
  @IsOptional()
  context?: Record<string, any>;

  @IsObject()
  @IsOptional()
  thoughts?: Record<string, any>;

  @IsString()
  @IsOptional()
  pageId?: string;

  @IsString()
  @IsOptional()
  taskId?: string;
}
