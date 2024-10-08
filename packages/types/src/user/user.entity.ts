import { Attachment } from '../attachment';
import { Workspace } from '../workspace';

export class User {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  email: string;
  fullname: string | null;
  username: string;
  initialSetupComplete: boolean;
  workspace?: Workspace;
  anonymousDataCollection: boolean;
  attachment?: Attachment[];
}

export class PublicUser {
  id: string;
  username: string;
  fullname: string;
  email: string;
}
