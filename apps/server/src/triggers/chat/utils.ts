import {
  Conversation,
  ConversationHistory,
  PrismaClient,
  UserType,
} from '@prisma/client';
import { logger } from '@trigger.dev/sdk/v3';
import axios from 'axios';

import { HistoryStep } from './types';

const prisma = new PrismaClient();

export interface InitChatPayload {
  conversationId: string;
  conversationHistoryId: string;
  autoMode: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any;
}

export interface RunChatPayload {
  conversationId: string;
  conversationHistoryId: string;
  autoMode: string;
  activity?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any;
  conversation: Conversation;
  conversationHistory: ConversationHistory;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createMCPConfig(userMCP: any, pat: string) {
  const sigmaMCP = {
    command: 'npx',
    args: ['-y', '@tegonhq/sigma-mcp-server'],
    env: {
      API_BASE_URL: process.env.BACKEND_HOST,
      API_TOKEN: pat,
    },
  };

  if (userMCP && userMCP.mcpServers) {
    return {
      mcpServers: {
        ...userMCP.mcpServers,
        sigma: sigmaMCP,
      },
    };
  }

  return {
    mcpServers: {
      sigma: sigmaMCP,
    },
  };
}

export const init = async (payload: InitChatPayload) => {
  const agents = payload.context.agents;
  logger.info('Loading init');
  const conversationHistory = await prisma.conversationHistory.findUnique({
    where: { id: payload.conversationHistoryId },
    include: { conversation: true },
  });

  const conversation = conversationHistory?.conversation as Conversation;

  const workspace = await prisma.workspace.findUnique({
    where: { id: conversation.workspaceId as string },
  });

  if (!workspace) {
    return { conversation, conversationHistory };
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

  const mcp = createMCPConfig(user.mcp, pat?.token);

  logger.info(`Found users, workspace, conversation, ${JSON.stringify(mcp)}`);

  return {
    conversation,
    conversationHistory,
    token: pat?.token,
    userId: workspace.userId,
    mcp: { mcpServers: { ...mcp.mcpServers, ...integrationMCPServers } },
  };
};

export const createConversationHistoryForAgent = async (
  conversationId: string,
) => {
  return await prisma.conversationHistory.create({
    data: {
      conversationId,
      message: 'Generating...',
      userType: 'Agent',
      thoughts: {},
    },
  });
};

export const getConversationHistoryFormat = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  previousHistory: any[],
): string => {
  if (previousHistory) {
    const historyText = previousHistory
      .map((history) => `${history.userType}: \n ${history.message}`)
      .join('\n------------\n');

    return historyText;
  }

  return '';
};

export const getPreviousExecutionHistory = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  previousHistory: any[],
): Promise<Array<{ agent: string; history: string }> | null> => {
  // Find the last agent message ID from conversation history
  // Note: previousHistory is in ascending order
  let lastAgentHistoryID: string | undefined;

  if (previousHistory) {
    // Iterate in reverse to find the last agent message
    for (let i = previousHistory.length - 1; i >= 0; i--) {
      const history = previousHistory[i];
      if (history.userType === 'Agent') {
        lastAgentHistoryID = history.id as string;

        break;
      }
    }
  }

  const previousExecutionHistory: Array<{ agent: string; history: string }> =
    [];

  // If we found any agent history, retrieve the most recent one's data
  if (lastAgentHistoryID) {
    const executionSteps =
      await getExecutionStepsForConversation(lastAgentHistoryID);

    if (!executionSteps || executionSteps.length === 0) {
      return null;
    }

    executionSteps.forEach((agentData, index: number) => {
      if (agentData.thought) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const metadata = agentData.metadata as any;
        const agent = metadata?.name;

        // Format history in the requested structure
        let formattedHistory = `${agent}\n`;

        formattedHistory += `Step ${index + 1}\n`;

        // Add thought if available
        if (agentData.thought) {
          formattedHistory += `Thought: ${agentData.thought}\n`;
        }

        // Add user message if available
        if (agentData.message) {
          formattedHistory += `UserMessage: ${agentData.message}\n`;
        }

        // Add action if available
        if (metadata.skill) {
          formattedHistory += `Action: ${metadata.skill}\n`;
        }

        // Add action input if available
        if (metadata.skillInput) {
          formattedHistory += `Action Input: ${metadata.skillInput}\n`;
        }

        // Add observation if available
        if (metadata.observation) {
          formattedHistory += `Observation: ${metadata.observation}\n`;
        }

        // Add final answer if available
        if (metadata.isFinal) {
          formattedHistory += `Is Final Answer: ${metadata.isFinal}\n`;
        }

        // Add final answer if available
        if (metadata.isQuestion) {
          formattedHistory += `is Question: ${metadata.isQuestion}\n`;
        }

        formattedHistory += '\n';

        previousExecutionHistory.push({
          agent,
          history: formattedHistory,
        });
      }
    });
  }

  return previousExecutionHistory;
};

export const getIntegrationDefinitionsForAgents = (agents: string[]) => {
  return prisma.integrationDefinitionV2.findMany({
    where: {
      slug: {
        in: agents,
      },
    },
  });
};

export const getIntegrationConfigForIntegrationDefinition = (
  integrationDefinitionId: string,
) => {
  return prisma.integrationAccount.findFirst({
    where: {
      integrationDefinitionId,
    },
  });
};

export const updateExecutionStep = async (
  step: HistoryStep,
  conversationHistoryId: string,
) => {
  const { thought, userMessage, ...metadata } = step;

  await prisma.conversationExecutionStep.create({
    data: {
      thought: thought ?? '',
      message: userMessage ?? '',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      metadata: metadata as any,
      conversationHistoryId,
    },
  });
};

export const updateConversationHistoryMessage = async (
  userMessage: string,
  thought: string,
  conversationHistoryId: string,
) => {
  await prisma.conversationHistory.update({
    where: {
      id: conversationHistoryId,
    },
    data: {
      message: userMessage,
      thought,
      userType: UserType.Agent,
    },
  });
};

export const getExecutionStepsForConversation = async (
  conversationHistoryId: string,
) => {
  const lastExecutionSteps = await prisma.conversationExecutionStep.findMany({
    where: {
      conversationHistoryId,
    },
  });

  return lastExecutionSteps;
};

export const createNotificationForActivity = async (
  activityId: string,
  workspaceId: string,
) => {
  await prisma.notification.create({
    data: {
      type: 'NewActivity',
      modelName: 'Activity',
      modelId: activityId,
      workspaceId,
    },
  });
};

export const getContextPage = async (workspaceId: string) => {
  return await prisma.page.findFirst({
    where: {
      workspaceId,
      type: 'Context',
    },
  });
};

export const getCreditsForUser = async (userId: string) => {
  return await prisma.userUsage.findUnique({
    where: {
      userId,
    },
  });
};

export const updateUserCredits = async (
  userUsageId: string,
  finalCredits: number,
) => {
  return await prisma.userUsage.update({
    where: {
      id: userUsageId,
    },
    data: {
      availableCredits: finalCredits,
    },
  });
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function flattenObject(obj: Record<string, any>, prefix = ''): string[] {
  return Object.entries(obj).reduce<string[]>((result, [key, value]) => {
    const entryKey = prefix ? `${prefix}_${key}` : key;

    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      // For nested objects, flatten them and add to results
      return [...result, ...flattenObject(value, entryKey)];
    }

    // For primitive values or arrays, add directly
    return [...result, `- ${entryKey}: ${value}`];
  }, []);
}
