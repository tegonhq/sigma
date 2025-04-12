import { ReactBaseAgent } from '@tegonhq/agent-sdk';

import { GithubTools } from './github-tools';
import { JARGON } from './jargon';

export class GithubAgent extends ReactBaseAgent {
  // eslint-disable-next-line @typescript-eslint/array-type, @typescript-eslint/no-explicit-any
  getTools(): Array<any> {
    const githubTools = GithubTools.getInstance({});
    const tools = githubTools.getTools();
    return Object.keys(tools).map((key) => ({ ...tools[key], name: key }));
  }

  getJargon(): string {
    return JARGON;
  }

  async runAction(
    actionName: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    parameters: any,
    intergrationConfig: Record<string, string>,
  ): Promise<string> {
    const githubTools = GithubTools.getInstance(intergrationConfig);

    return githubTools.runAction(actionName, parameters);
  }
}
