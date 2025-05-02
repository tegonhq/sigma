import { IsArray, IsOptional, IsString } from 'class-validator';

export class UserIdParams {
  @IsString()
  userId: string;
}

export class UpdateUserBody {
  @IsString()
  @IsOptional()
  fullname?: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  mcp: string;
}

export class UserIdsBody {
  @IsArray()
  userIds: string[];
}

export interface PublicUser {
  id: string;
  username: string;
  fullname: string;
  email: string;
}

// TODO: fix it
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function userSerializer(user: any) {
  return {
    id: user.id,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    email: user.email,
    fullname: user.fullname,
    username: user.username,
    preferences: user.preferences,
    mcp: user.mcp,
    initialSetupComplete: user.initialSetupComplete,
    anonymousDataCollection: user.anonymousDataCollection,
    workspace: user.workspace,
  };
}
