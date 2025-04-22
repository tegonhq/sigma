import {
  Conversation,
  ConversationHistory,
  PrismaClient,
  UserType,
} from '@prisma/client';
import axios from 'axios';

import { HistoryStep } from './types';

const prisma = new PrismaClient();

export interface InitChatPayload {
  conversationId: string;
  conversationHistoryId: string;
  autoMode: string;
}

export interface RunChatPayload {
  conversationId: string;
  conversationHistoryId: string;
  autoMode: string;
  conversation: Conversation;
  conversationHistory: ConversationHistory;
}

export const init = async (payload: InitChatPayload) => {
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

  axios.interceptors.request.use((config) => {
    // Check if URL starts with /api and doesn't have a full host
    if (config.url?.startsWith('/api')) {
      config.url = `${process.env.BACKEND_HOST}${config.url.replace('/api', '')}`;
      config.headers.Authorization = `Bearer ${pat?.token}`;
    }

    return config;
  });

  return {
    conversation,
    conversationHistory,
    token: pat?.token,
    userId: workspace.userId,
    mcp: user.mcp,
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
