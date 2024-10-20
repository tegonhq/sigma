import { IsOptional, IsString } from 'class-validator';

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
}

export class UpdateWorkspaceInput {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  icon: string;
}

export class UserBody {
  @IsString()
  userId: string;
}

export const workflowSeedData = [
  {
    name: 'Todo',
    color: '3',
    position: 0,
  },
  {
    name: 'In Progress',
    color: '4',
    position: 0,
  },
  {
    name: 'In Review',
    color: '5',
    position: 1,
  },
  {
    name: 'Done',
    color: '6',
    position: 0,
  },
];
