import { IsOptional, IsString } from 'class-validator';

export class CreateActivityDto {
  @IsString()
  type: string;

  eventData: any;

  @IsString()
  name: string;

  @IsString()
  integrationAccountId: string;

  @IsString()
  @IsOptional()
  taskId: string;
}
