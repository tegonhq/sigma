import { IsObject, IsOptional, IsString } from 'class-validator';

export class CreateWorkspaceInput {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  icon: string;
}

export class CreateInitialResourcesDto {
  @IsString()
  workspaceName: string;

  @IsString()
  fullname: string;

  @IsString()
  timezone: string;

  @IsString()
  inviteCode: string;
}

export class UpdateWorkspaceInput {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsString()
  @IsOptional()
  timezone?: string;

  @IsOptional()
  @IsObject()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  preferences?: Record<string, any> | null;
}

export class UserBody {
  @IsString()
  userId: string;
}
