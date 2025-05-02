import { IsObject, IsString } from 'class-validator';

export class CreateSummaryDto {
  @IsString()
  content: string;

  @IsString()
  taskId: string;
}

export class GenerateSummaryDto {
  @IsObject()
  summaryData: Record<string, any>;

  @IsString()
  taskId: string;
}
