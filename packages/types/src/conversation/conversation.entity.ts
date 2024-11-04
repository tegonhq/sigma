import { JsonValue } from '../common';
import { ConversationHistory } from '../conversation-history';
import { User } from '../user';
import { Workspace } from '../workspace';

export class Conversation {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deleted: Date | null;

  context: JsonValue;

  user: User;
  userId: string;

  workspace: Workspace;
  workspaceId: string;

  conversationHistory?: ConversationHistory[];
}
