import Anthropic from '@anthropic-ai/sdk';
import { MessageParam } from '@anthropic-ai/sdk/resources';
import OpenAI from 'openai';

export async function* generate(
  messages: MessageParam[],
): AsyncGenerator<string> {
  // Check for API keys
  const openaiKey = process.env.OPENAI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (!openaiKey && !anthropicKey) {
    throw new Error(
      'No LLM API key found. Set either OPENAI_API_KEY or ANTHROPIC_API_KEY',
    );
  }

  // OpenAI is preferred if both keys exist
  if (openaiKey) {
    const openai = new OpenAI({
      apiKey: openaiKey,
    });

    const stream = await openai.chat.completions.create({
      messages: messages as any,
      model: 'gpt-4',
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        yield content;
      }
    }
    return;
  }

  // Fallback to Anthropic
  if (anthropicKey) {
    const anthropic = new Anthropic({
      apiKey: anthropicKey,
    });

    const stream = anthropic.messages.stream({
      messages,
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 1024,
    });

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta') {
        const content = chunk.delta?.text || '';
        if (content) {
          yield content;
        }
      } else if (
        chunk.type === 'content_block_start' &&
        chunk.content_block?.text
      ) {
        yield chunk.content_block.text;
      }
    }
    return;
  }

  throw new Error('No valid LLM configuration found');
}
