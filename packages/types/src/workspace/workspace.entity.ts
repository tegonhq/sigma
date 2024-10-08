import { Label } from '../label';
import { Template } from '../template';

export class Workspace {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deleted: Date | null;
  name: string;
  slug: string;
  icon: string | null;
  userId?: string | null;
  label?: Label[];
  template?: Template[];
}
