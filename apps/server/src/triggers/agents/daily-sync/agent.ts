import { PrismaClient } from '@prisma/client';
import { logger } from '@trigger.dev/sdk/v3';
import { CoreMessage, jsonSchema, tool, ToolSet } from 'ai';
import axios from 'axios';
import Handlebars from 'handlebars';

import { generate } from './generate-utils';
import { DAILY_SYNC_SYSTEM_PROMPT, DAILY_SYNC_USER_PROMPT } from './prompt';
import { callSigmaTool, getSigmaTools } from '../sigma-tools/sigma-tools';
import { MCP } from '../utils/mcp';
import {
  ExecutionState,
  GenerateResponse,
  HistoryStep,
  TotalCost,
} from '../utils/types';
import { createMCPConfig, getCreditsForUser } from '../utils/utils';

const prisma = new PrismaClient();

export async function initMcp(agents: string[], workspaceId: string) {
  logger.info('Loading init');

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId as string },
  });

  if (!workspace) {
  }

  const pat = await prisma.personalAccessToken.findFirst({
    where: { userId: workspace.userId as string, name: 'default' },
  });

  const user = await prisma.user.findFirst({
    where: { id: workspace.userId as string },
  });

  const integrationAccounts = await prisma.integrationAccount.findMany({
    where: {
      workspaceId: workspace.id,
      integrationDefinition: { slug: { in: agents } },
    },
    include: { integrationDefinition: true },
  });

  // Create MCP server configurations for each integration account
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const integrationMCPServers: Record<string, any> = {};

  for (const account of integrationAccounts) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const spec = account.integrationDefinition?.spec as any;
      if (spec.mcp) {
        const mcpSpec = spec.mcp;
        const configuredMCP = { ...mcpSpec };

        // Replace config placeholders in environment variables
        if (configuredMCP.env) {
          for (const [key, value] of Object.entries(configuredMCP.env)) {
            if (typeof value === 'string' && value.includes('${config:')) {
              // Extract the config key from the placeholder
              const configKey = value.match(/\$\{config:(.*?)\}/)?.[1];
              if (
                configKey &&
                account.integrationConfiguration &&
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (account.integrationConfiguration as any)[configKey]
              ) {
                configuredMCP.env[key] = value.replace(
                  `\${config:${configKey}}`,
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (account.integrationConfiguration as any)[configKey],
                );
              }
            }
          }
        }

        // Add to the MCP servers collection
        integrationMCPServers[account.integrationDefinition.slug] =
          configuredMCP;
      }
    } catch (error) {
      logger.error(
        `Failed to configure MCP for ${account.integrationDefinition?.slug}:`,
        error,
      );
    }
  }

  axios.interceptors.request.use((config) => {
    // Check if URL starts with /api and doesn't have a full host

    if (config.url?.startsWith('/api')) {
      config.url = `${process.env.BACKEND_HOST}${config.url.replace('/api', '')}`;
      config.headers.Authorization = `Bearer ${pat?.token}`;
    }

    return config;
  });

  const mcp = createMCPConfig(user.mcp);

  logger.info(
    `Found users, workspace, conversation, ${JSON.stringify({ mcpServers: { ...mcp.mcpServers, ...integrationMCPServers } })}`,
  );
  return {
    token: pat?.token,
    userId: workspace.userId,
    mcp: { mcpServers: { ...mcp.mcpServers, ...integrationMCPServers } },
  };
}

function getFixedTools() {
  return {
    final_response: tool({
      description:
        "If you've completed the daily sync when no further actions needed, call this tool.",
      parameters: jsonSchema({
        type: 'object',
        properties: {
          title: {
            type: 'string',
            description:
              'A concise, meaningful title that captures the essence of this specific day',
          },
          sync: {
            type: 'string',
            description: 'HTML content adapted to user preferences',
          },
        },
        required: ['title', 'sync'],
        additionalProperties: false,
      }),
    }),
  };
}
function toolToMessage(history: HistoryStep[], messages: CoreMessage[]) {
  for (let i = 0; i < history.length; i++) {
    const step = history[i];

    // Add assistant message with tool calls
    if (step.observation && step.skillId) {
      messages.push({
        role: 'assistant',
        content: [
          {
            type: 'tool-call',
            toolCallId: step.skillId,
            toolName: step.skill,
            args:
              typeof step.skillInput === 'string'
                ? JSON.parse(step.skillInput)
                : step.skillInput,
          },
        ],
      });

      messages.push({
        role: 'tool',
        content: [
          {
            type: 'tool-result',
            toolName: step.skill,
            toolCallId: step.skillId,
            result: step.observation,
            isError: step.isError,
          },
        ],
      });
    }
  }

  return messages;
}

async function makeNextCall(
  executionState: Partial<ExecutionState>,
  TOOLS: ToolSet,
): Promise<GenerateResponse> {
  const { context: rawContext, history, userMemoryContext } = executionState;

  const context = JSON.parse(rawContext);

  const promptInfo = {
    LOCAL_TIME: context.localTime,
    TASK_LIST: context.taskList,
    SYNC_RULES: context.syncRules,
    PREVIOUS_SYNC: context.previousSyncs,
    ACTIVITY: context.activity,
    USER_MEMORY_CONTEXT: userMemoryContext,
  };

  const templateHandler = Handlebars.compile(DAILY_SYNC_USER_PROMPT);
  const prompt = templateHandler(promptInfo);
  let messages: CoreMessage[] = [
    { role: 'system', content: DAILY_SYNC_SYSTEM_PROMPT },
  ];
  messages.push({ role: 'user', content: prompt });

  messages = toolToMessage(history, messages);

  // Get the next action from the LLM
  const response = await generate(messages, TOOLS);

  return response;
}

export async function getDailySync(
  agents: string[],
  workspaceId: string,
  context: string,
  userMemoryContext: string,
): Promise<{ title: string; sync: string; creditForSync: number }> {
  const init = await initMcp(agents, workspaceId);

  const usageCredits = await getCreditsForUser(init.userId);

  const creditForSync = 0;

  if (usageCredits.availableCredits <= 0) {
    logger.error('No credits found for the user');
    return { title: '', sync: '', creditForSync };
  }

  // Initialise mcp
  const mcp = new MCP();
  await mcp.init();
  await mcp.load(agents, init.mcp);

  // Log which agents will be used for this conversation
  logger.info(`Agents passed: ${JSON.stringify(agents)}`);

  const generatedSync = await run(
    mcp,
    context,
    creditForSync,
    userMemoryContext,
  );

  return generatedSync;
}

async function run(
  mcp: MCP,
  context: string,
  creditForSync: number,
  userMemoryContext: string,
): Promise<{ title: string; sync: string; creditForSync: number }> {
  const guardLoop = 0;

  const tools = {
    ...(await mcp.vercelTools()),
    ...getFixedTools(),
    ...(await getSigmaTools()),
  };

  const executionState: Partial<ExecutionState> = {
    context,
    history: [],
    completed: false,
    autoMode: true,
    userMemoryContext,
  };

  logger.info(`Execution state: ${JSON.stringify(executionState)}`);
  let title: string;
  let sync: string;
  const totalCost: TotalCost = {
    inputTokens: 0,
    outputTokens: 0,
    cost: 0,
  };

  while (!executionState.completed && guardLoop < 10) {
    const llmResponse = await makeNextCall(executionState, tools);

    logger.info(`LLM response: ${JSON.stringify(llmResponse)}`);
    await Promise.all(
      llmResponse.toolCalls.map(async (toolCall) => {
        // Record this step in history
        const stepRecord: HistoryStep = {
          thought: '',
          skill: '',
          skillId: '',
          userMessage: '',
          isQuestion: false,
          isFinal: false,
          tokenCount: totalCost,
          skillInput: '',
        };

        if (toolCall.toolName === 'final_response') {
          executionState.completed = true;
          title = toolCall.args.title;
          sync = toolCall.args.sync;
          stepRecord.userMessage = toolCall.args.title;
          stepRecord.skillInput = toolCall.args;
          stepRecord.finalTokenCount = totalCost;
          executionState.history.push(stepRecord);
          return;
        }

        const skillName = toolCall.toolName;
        const skillId = toolCall.toolCallId;
        const skillInput = toolCall.args;

        const agent = skillName.split('--')[0];

        stepRecord.agent = agent;
        stepRecord.skill = skillName;
        stepRecord.skillId = skillId;
        stepRecord.skillInput = JSON.stringify(skillInput);

        let result;
        try {
          if (agent === 'sigma') {
            result = await callSigmaTool(skillName, skillInput);
          } else {
            result = await mcp.callTool(skillName, skillInput);
          }
          stepRecord.skillOutput =
            typeof result === 'object'
              ? JSON.stringify(result, null, 2)
              : result;
          stepRecord.observation = stepRecord.skillOutput;
        } catch (e) {
          logger.error(e);
          stepRecord.skillInput = skillInput;
          stepRecord.observation = JSON.stringify(e);
          stepRecord.isError = true;
        }

        executionState.history.push(stepRecord);
      }),
    );

    creditForSync += 1;
    if (executionState.completed) {
      break;
    }
  }

  return { title, sync, creditForSync };
}
