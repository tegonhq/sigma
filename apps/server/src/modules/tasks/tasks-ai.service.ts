import { Injectable } from '@nestjs/common';
import { LLMModelEnum, ReccurenceInput, recurrencePrompt } from '@sigma/types';

import AIRequestsService from 'modules/ai-requests/ai-requests.services';
import { LoggerService } from 'modules/logger/logger.service';

@Injectable()
export default class TasksAIService {
  private readonly logger: LoggerService = new LoggerService('TasksAIService');

  constructor(private aiRequestsService: AIRequestsService) {}

  async recurrence(reccurenceInput: ReccurenceInput, workspaceId: string) {
    const recurrenceOutput = await this.aiRequestsService.getLLMRequest(
      {
        messages: [
          {
            role: 'user',
            content: recurrencePrompt
              .replace('{{text}}', reccurenceInput.text)
              .replace('{{currentTime}}', reccurenceInput.currentTime),
          },
        ],
        llmModel: LLMModelEnum.CLAUDESONNET,
        model: 'recurrence',
      },
      workspaceId,
    );
    const outputMatch = recurrenceOutput.match(/<output>(.*?)<\/output>/s);
    if (!outputMatch) {
      this.logger.error({
        message: 'No output found in recurrence response',
        where: `TasksAIService.recurrence`,
      });
      throw new Error('Invalid response format from AI');
    }

    try {
      const jsonStr = outputMatch[1].trim();
      const parsedOutput = JSON.parse(jsonStr);
      return parsedOutput;
    } catch (error) {
      this.logger.error({
        message: 'Failed to parse recurrence JSON output',
        payload: error,
        where: `TasksAIService.recurrence`,
      });
      throw new Error('Invalid JSON in AI response');
    }
  }
}
