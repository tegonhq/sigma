import { ConversationHistory } from '../conversation-history';
import { Page } from '../page';
import { Task } from '../task';
import { User } from '../user';
import { Workspace } from '../workspace';

export class Conversation {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deleted: Date | null;

  user?: User | null;
  userId: string;

  workspace?: Workspace | null;
  workspaceId: string;

  page?: Page | null;
  pageId?: string;

  task?: Task | null;
  taskId?: string;

  conversationHistory?: ConversationHistory[];
}
