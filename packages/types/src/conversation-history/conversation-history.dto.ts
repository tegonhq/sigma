import { IsString } from 'class-validator';

import { Page } from '../page';
import { Task } from '../task';

export class ConversationHistoryParamsDto {
  @IsString()
  conversationHistoryId: string;
}

export class ConversationContextData {
  pages?: string[];
  tasks?: string[];
  agents?: string[];
  repository?: string;
}

export class PreviousHistory {
  message: string;
}

export class ConversationContext {
  page: Array<Partial<Page>>;
  task: Array<Partial<Task>>;
  previousHistory: PreviousHistory[];
}
