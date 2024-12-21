import { IsString } from 'class-validator';

import { Activity } from '../activity';
import { Page } from '../page';

export class ConversationHistoryParamsDto {
  @IsString()
  conversationHistoryId: string;
}

export class pageContext {
  id: string;
  location: string[];
}
export class ConversationContextData {
  pages?: pageContext[];
  activityIds?: string[];
  agents?: string[];
  repository?: string;
}

export class PreviousHistory {
  message: string;
}

export class ConversationContext {
  page: Page[];
  activity: Activity[];
  previousHistory: PreviousHistory[];
}
