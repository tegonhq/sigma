import { Template } from '../template';

export class Preferences {
  timezone?: string;
}

export class Workspace {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deleted: Date | null;
  name: string;
  slug: string;
  icon: string | null;
  userId?: string | null;
  template?: Template[];
  preferences?: any;
}
