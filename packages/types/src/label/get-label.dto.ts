import { IsString } from 'class-validator';

export class GetLabelsDTO {
  @IsString()
  workspaceId: string;
}
