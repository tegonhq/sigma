import { exec } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import util from 'util';

import { query } from '@anthropic-ai/claude-code';
import axios from 'axios';
import {
  getGithubIntegrationToken,
  CheckErrors,
  checkUserSessions,
} from 'triggers/agents/chat/code-tools';

const execAsync = util.promisify(exec);

interface ClaudeCodeParams {
  workspaceId: string;
  userId: string;
  repo_url: string;
  query: string;
  session_id?: string;
  branch_name?: string;
}

async function* generateClaudeMessages(
  repoPath: string,
  enhancedPrompt: string,
) {
  let sessionId: string | undefined;

  try {
    for await (const message of query({
      prompt: enhancedPrompt,
      abortController: new AbortController(),

      options: {
        cwd: repoPath,
        // model: LLMMappings.CLAUDESONNET,
        permissionMode: 'bypassPermissions',
        // pathToClaudeCodeExecutable: '/usr/local/bin/claude',
        pathToClaudeCodeExecutable:
          '/Users/harshithmullapudi/.nvm/versions/node/v20.18.3/bin/claude',
      },
    })) {
      if (message.type === 'system' && message.subtype === 'init') {
        sessionId = message.session_id;
        yield { type: 'init', sessionId };
      } else if (message.type === 'assistant') {
        if (
          message.message.content[0] &&
          message.message.content[0].type === 'text'
        ) {
          yield { type: 'message', content: message.message.content };
        }
      } else if (message.type === 'result') {
        yield {
          type: 'complete',
          success: message.subtype === 'success',
          error: message.is_error,
        };
      }
    }
  } catch (error) {
    yield { type: 'complete', success: false, error: true };
  }
}

export async function* claudeCode(payload: ClaudeCodeParams) {
  const githubIntegrationToken = await getGithubIntegrationToken(
    payload.workspaceId,
  );

  if ((githubIntegrationToken as CheckErrors).error) {
    throw new Error(JSON.stringify(githubIntegrationToken));
  }

  const GITHUB_API_KEY = githubIntegrationToken;

  const sessions = await checkUserSessions(payload.userId);

  if ((sessions as CheckErrors).error) {
    throw new Error(JSON.stringify(sessions));
  }

  // Create temp directory
  const tempDir = path.join(os.tmpdir(), `repo-${Date.now()}`);
  const branchName = payload.branch_name ?? 'main';
  await fs.promises.mkdir(tempDir, { recursive: true });

  try {
    // Extract owner and repo from repo_url
    const urlParts = payload.repo_url.split('/');
    const owner = urlParts[urlParts.length - 2];
    const repo = urlParts[urlParts.length - 1];

    // Get GitHub user info
    const { data: githubUser } = await axios.get(
      'https://api.github.com/user',
      {
        headers: {
          Authorization: `token ${GITHUB_API_KEY}`,
        },
      },
    );

    // Clone repository using token
    const remoteUrl = `https://${GITHUB_API_KEY}:x-oauth-basic@github.com/${owner}/${repo}.git`;
    await execAsync(`git clone --branch ${branchName} ${remoteUrl}`, {
      cwd: tempDir,
    });

    const repoPath = path.join(tempDir, repo);

    // Configure git user
    await execAsync(
      `git config user.name "${githubUser.name || githubUser.login}"`,
      {
        cwd: repoPath,
      },
    );
    await execAsync(`git config user.email "${githubUser.email}"`, {
      cwd: repoPath,
    });

    // Construct enhanced prompt
    const enhancedPrompt = `
        Please analyze and modify the code following these guidelines:

        1. Best Practices Summary:
        - Follow language-specific conventions and style guides
        - Write clean, maintainable, and well-documented code
        - Consider performance implications
        - Add appropriate error handling
        - Follow SOLID principles where applicable
        - Use appropriate design patterns
        - Write testable code
        - Follow security best practices
        - Optimize for readability and maintainability
        - Use meaningful variable/function names
        - Add comments for complex logic
        - Keep functions small and focused
        - Avoid code duplication
        - Handle edge cases appropriately

        2. Repository Context:
        - Repository: ${payload.repo_url}
        - Branch: ${branchName}

        3. Code Quality:
        - Ensure proper error handling and logging
        - Add input validation where needed
        - Follow async/await best practices
        - Use TypeScript types/interfaces appropriately
        - Add JSDoc comments for public APIs
        - Consider backwards compatibility
        - Follow semantic versioning
        - Add unit tests for new functionality

        4. User Query:
        ${payload.query}

        Important: If you make ANY changes to files, even minor ones:
        1. Stage and commit the changes with clear commit messages
        2. Push to the branch
        3. Explain what was changed and why, including:
           - Specific files modified
           - Nature of changes
           - Reasoning behind changes
           - Any potential impacts
        4. If you need additional input:
           - Push current changes
           - Clearly state what information is needed
           - Explain why it's needed
           - Suggest possible options
      `;

    const messageStream = generateClaudeMessages(repoPath, enhancedPrompt);

    for await (const step of messageStream) {
      yield step;
    }
  } catch (error) {
    throw new Error(error);
  }
}
