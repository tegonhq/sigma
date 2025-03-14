import { IsString } from 'class-validator';

export class UpdateListDto {
  @IsString()
  icon: string;
}
