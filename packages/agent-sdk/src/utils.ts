import Anthropic from '@anthropic-ai/sdk';
import { MessageParam } from '@anthropic-ai/sdk/resources';
import { Content, GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';

import { TokenCount } from './types';

export async function* generate(
  messages: MessageParam[],
  tokenCountState?: TokenCount,
): AsyncGenerator<string> {
  // Check for API keys
  const openaiKey = process.env.OPENAI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;
  const model = process.env.MODEL;

  if (!openaiKey && !anthropicKey && !geminiKey) {
    throw new Error(
      'No LLM API key found. Set either OPENAI_API_KEY, ANTHROPIC_API_KEY, or GEMINI_API_KEY',
    );
  }

  // OpenAI is preferred if key exists
  if (openaiKey) {
    const openai = new OpenAI({
      apiKey: openaiKey,
    });

    const stream = await openai.chat.completions.create({
      messages: messages as any,
      model,
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

  // Try Anthropic next if key exists
  if (anthropicKey) {
    const anthropic = new Anthropic({
      apiKey: anthropicKey,
    });

    const stream = anthropic.messages.stream({
      messages,
      model,
      max_tokens: 5000,
    });

    tokenCountState.inputTokens = Math.ceil(
      messages.reduce((acc, msg) => acc + (msg.content?.length || 0) / 4, 0),
    );

    let outputTokenCount = 0;

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta') {
        const content = chunk.delta?.text || '';
        if (content) {
          if (tokenCountState) {
            // Increment output token count for each chunk
            outputTokenCount += 1; // This is an approximation
            tokenCountState.outputToken = outputTokenCount;
          }
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

  if (geminiKey) {
    // Finally try Gemini if key exists
    const genAI = new GoogleGenerativeAI(geminiKey);
    const aiModel = genAI.getGenerativeModel({ model });

    const formattedMessages = messages.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.content }],
    })) as Content[];

    const chat = aiModel.startChat({
      history: formattedMessages.slice(0, -1),
      generationConfig: {
        maxOutputTokens: 1024,
      },
    });

    const result = await chat.sendMessageStream(
      formattedMessages[formattedMessages.length - 1].parts[0].text,
    );

    for await (const chunk of result.stream) {
      const content = chunk.text();
      if (content) {
        yield content;
      }
    }
    return;
  }

  throw new Error('No valid LLM configuration found');
}

export const formatParam = (
  name: string,
  info: any,
  required: boolean = false,
) => {
  const reqMarker = required ? '*' : '';
  const desc = info.description || 'No description';
  return `${name}${reqMarker}: ${desc}`;
};

export const formatParameter = (
  paramName: string,
  paramInfo: any,
  required: boolean,
  depth: number = 0,
) => {
  // Limit recursion depth to avoid overly complex descriptions
  if (depth > 3) {
    return `${paramName}${required ? '*' : ''}: [complex nested structure]`;
  }

  // Handle array items
  if ('items' in paramInfo) {
    // If items is a dictionary with properties (complex object array)
    if (
      typeof paramInfo.items === 'object' &&
      'properties' in paramInfo.items
    ) {
      const nestedParams: string[] = [];
      for (const [propName, propInfo] of Object.entries(
        paramInfo.items.properties,
      )) {
        if (typeof propInfo !== 'object') {
          continue;
        }
        const propRequired = (propInfo as any).required ?? false;
        nestedParams.push(
          formatParameter(propName, propInfo, propRequired, depth + 1),
        );
      }

      if (nestedParams.length) {
        return `${paramName}${required ? '*' : ''}: [${nestedParams.join(', ')}]`;
      }
    }

    // If items is a dictionary with type definitions (simple object array)
    else if (typeof paramInfo.items === 'object') {
      const itemType = paramInfo.items.type || 'any';
      return `${paramName}${required ? '*' : ''}: [array of ${itemType}]`;
    }
  }

  // Handle objects with properties
  else if ('properties' in paramInfo) {
    const nestedParams: string[] = [];
    for (const [propName, propInfo] of Object.entries(paramInfo.properties)) {
      if (typeof propInfo !== 'object') {
        continue;
      }

      const propRequired = (propInfo as any).required ?? false;
      nestedParams.push(
        formatParameter(propName, propInfo, propRequired, depth + 1),
      );
    }

    if (nestedParams.length) {
      return `${paramName}${required ? '*' : ''}: {${nestedParams.join(', ')}}`;
    }
  }

  // Handle regular parameters
  return formatParam(paramName, paramInfo, required);
};

export const formatTool = (tool: any) => {
  // Start with tool name and description
  let toolStr = `- ${tool.name}: ${tool.description || 'No description'}`;

  // Process parameters if they exist
  if (tool.params && typeof tool.params === 'object') {
    const paramsList: string[] = [];

    for (const [paramName, paramInfo] of Object.entries(tool.params)) {
      if (typeof paramInfo !== 'object') {
        continue;
      }

      const required = (paramInfo as any).required ?? false;
      paramsList.push(formatParameter(paramName, paramInfo, required));
    }

    if (paramsList.length) {
      toolStr += `. Parameters: ${paramsList.join(', ')}`;
    }
  }

  return toolStr;
};

export const formatToolsForPrompt = (tools: any) => {
  if (!tools || tools.length === 0) {
    return '';
  }

  const toolDescriptions: string[] = [];
  for (const tool of tools) {
    toolDescriptions.push(formatTool(tool));
  }

  return toolDescriptions.join('\n');
};

export const formatToolForPrompt = (tools: any, toolName: string) => {
  const tool = tools.find((tl: any) => tl.name === toolName);

  return formatTool(tool);
};

/**
 * Generates a random ID of 6 characters
 * @returns A random string of 6 characters
 */
export const generateRandomId = (): string => {
  // Define characters that can be used in the ID
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  // Generate 6 random characters
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }

  return result.toLowerCase();
};
