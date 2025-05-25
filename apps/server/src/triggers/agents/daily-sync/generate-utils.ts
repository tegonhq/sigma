import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import { openai } from '@ai-sdk/openai';
import { logger } from '@trigger.dev/sdk/v3';
import { CoreMessage, generateText, LanguageModelV1, ToolSet } from 'ai';

import { GenerateResponse } from '../utils/types';

export async function generate(
  messages: CoreMessage[],
  tools?: ToolSet,
  system?: string,
  model?: string,
): Promise<GenerateResponse> {
  // Check for API keys

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const googleKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  model = model || process.env.MODEL;

  let modelInstance;
  let modelTemperature = 1;
  switch (model) {
    case 'claude-3-7-sonnet-20250219':
    case 'claude-3-opus-20240229':
    case 'claude-3-5-haiku-20241022':
      if (!anthropicKey) {
        throw new Error('No Anthropic API key found. Set ANTHROPIC_API_KEY');
      }
      modelTemperature = 0.5;
      modelInstance = anthropic(model);
      break;

    case 'gemini-2.5-flash-preview-04-17':
    case 'gemini-2.5-pro-preview-03-25':
    case 'gemini-2.0-flash':
    case 'gemini-2.0-flash-lite':
      if (!googleKey) {
        throw new Error('No Google API key found. Set GOOGLE_API_KEY');
      }
      modelInstance = google(model);
      modelTemperature = 1;
      break;

    case 'gpt-4.1-2025-04-14':
    case 'gpt-4.1-nano-2025-04-14':
    case 'gpt-4.1-mini-2025-04-14':
      if (!openaiKey) {
        throw new Error('No OpenAI API key found. Set OPENAI_API_KEY');
      }
      modelInstance = openai(model);
      break;

    default:
      break;
  }

  logger.info('starting stream');
  // Try Anthropic next if key exists
  if (modelInstance) {
    try {
      const { text, toolCalls } = await generateText({
        model: modelInstance as LanguageModelV1,
        messages,
        temperature: modelTemperature,
        maxSteps: 10,
        tools,
        toolChoice: 'required',
        ...(system ? { system } : {}),
      });

      return {
        text,
        toolCalls,
      };
    } catch (e) {
      logger.error(e);
    }
  }

  throw new Error('No valid LLM configuration found');
}
