import { IsString } from 'class-validator';

export class GetActivityDto {
  @IsString()
  activityId: string;
}

export class GetActivityBySourceDto {
  @IsString()
  sourceId: string;
}
