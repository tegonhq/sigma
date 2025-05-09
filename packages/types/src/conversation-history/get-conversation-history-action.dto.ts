import { IsString } from 'class-validator';

export class GetConversationHistoryActionDto {
  @IsString()
  conversationHistoryId: string;

  @IsString()
  actionId: string;
}
