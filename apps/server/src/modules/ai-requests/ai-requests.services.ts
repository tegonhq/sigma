import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import { openai } from '@ai-sdk/openai';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AIStreamResponse,
  ClaudeModels,
  GetAIRequestDTO,
  LLMMappings,
  LLMModelEnum,
  OpenAIModels,
} from '@tegonhq/sigma-sdk';
import {
  CoreMessage,
  CoreUserMessage,
  generateText,
  LanguageModelV1,
  streamText,
} from 'ai';
import { PrismaService } from 'nestjs-prisma';

import { LoggerService } from 'modules/logger/logger.service';

@Injectable()
export default class AIRequestsService {
  private readonly logger: LoggerService = new LoggerService('RequestsService');
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async getLLMRequest(
    reqBody: GetAIRequestDTO,
    workspaceId: string,
  ): Promise<string> {
    return (await this.LLMRequestStream(reqBody, workspaceId, false)) as string;
  }

  async getLLMRequestStream(
    reqBody: GetAIRequestDTO,
    workspaceId: string,
  ): Promise<AIStreamResponse> {
    return (await this.LLMRequestStream(
      reqBody,
      workspaceId,
      true,
    )) as AIStreamResponse;
  }

  async LLMRequestStream(
    reqBody: GetAIRequestDTO,
    workspaceId: string,
    stream: boolean = true,
  ) {
    const messages = reqBody.messages;
    const userMessages = reqBody.messages.filter(
      (message: CoreMessage) => message.role === 'user',
    );
    const model = reqBody.llmModel;
    this.logger.info({
      message: `Received request with model: ${model}`,

      where: `AIRequestsService.LLMRequestStream`,
    });

    try {
      return await this.makeModelCall(
        stream,
        model as LLMModelEnum,
        messages,
        (text: string, model: string) => {
          this.createRecord(
            text,
            userMessages,
            model,
            reqBody.model,
            workspaceId,
          );
        },
      );
    } catch (error) {
      this.logger.error({
        message: `Error in LLMRequestStream: ${error.message}`,
        where: `AIRequestsService.LLMRequestStream`,
        error,
      });
      throw error;
    }
  }

  async makeModelCall(
    stream: boolean,
    model: LLMModelEnum,
    messages: CoreMessage[],
    onFinish: (text: string, model: string) => void,
  ) {
    let modelInstance;
    let finalModel: string;

    if (
      (OpenAIModels.includes(model) &&
        !this.configService.get('OPENAI_API_KEY')) ||
      (ClaudeModels.includes(model) &&
        !this.configService.get('ANTHROPIC_API_KEY'))
    ) {
      model = null;
    }

    switch (model) {
      case LLMModelEnum.GPT35TURBO:
      case LLMModelEnum.GPT4TURBO:
      case LLMModelEnum.GPT4O:
        finalModel = LLMMappings[model];
        this.logger.info({
          message: `Sending request to OpenAI with model: ${finalModel}`,
          where: `AIRequestsService.makeModelCall`,
        });
        modelInstance = openai(finalModel);
        break;

      case LLMModelEnum.CLAUDEOPUS:
      case LLMModelEnum.CLAUDESONNET:
      case LLMModelEnum.CLAUDEHAIKU:
        finalModel = LLMMappings[model];
        this.logger.info({
          message: `Sending request to Claude with model: ${finalModel}`,
          where: `AIRequestsService.makeModelCall`,
        });
        modelInstance = anthropic(finalModel);
        break;

      case LLMModelEnum.GEMINI25FLASH:
      case LLMModelEnum.GEMINI25PRO:
      case LLMModelEnum.GEMINI20FLASH:
      case LLMModelEnum.GEMINI20FLASHLITE:
        finalModel = LLMMappings[model];
        this.logger.info({
          message: `Sending request to Gemini with model: ${finalModel}`,
          where: `AIRequestsService.makeModelCall`,
        });
        modelInstance = google(finalModel);
        break;

      default:
        this.logger.error({
          message: `No model choosen`,
          where: `AIRequestsService.makeModelCall`,
        });
    }

    if (stream) {
      return await streamText({
        model: modelInstance as LanguageModelV1,
        messages,
        onFinish: async ({ text }) => {
          onFinish(text, finalModel);
        },
      });
    }

    const { text } = await generateText({
      model: modelInstance as LanguageModelV1,
      messages,
    });

    onFinish(text, finalModel);

    return text;
  }

  async createRecord(
    message: string,
    userMessages: CoreUserMessage[],
    model: string,
    serviceModel: string,
    workspaceId: string,
  ) {
    this.logger.info({
      message: `Saving request and response to database`,
      where: `AIRequestsService.createRecord`,
    });
    await this.prisma.aIRequest.create({
      data: {
        data: JSON.stringify(userMessages),
        modelName: serviceModel,
        workspaceId,
        response: message,
        successful: true,
        llmModel: model,
      },
    });
  }
}
