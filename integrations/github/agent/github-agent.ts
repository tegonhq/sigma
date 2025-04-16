import { ReactBaseAgent } from '@tegonhq/agent-sdk';

import { GithubSkills } from './github-skills';
import { TERMS } from './terms';

export class GithubAgent extends ReactBaseAgent {
  // eslint-disable-next-line @typescript-eslint/array-type, @typescript-eslint/no-explicit-any
  skills(): Array<any> {
    const githubSkills = new GithubSkills({});
    const skills = githubSkills.skills();
    return Object.keys(skills).map((key) => ({ ...skills[key], name: key }));
  }

  terms(): string {
    return TERMS;
  }

  about(): string {
    return 'GitHub is a web-based platform for version control and collaboration that allows developers to store, manage, and track changes to their code. It provides features like repositories, pull requests, issues, and actions to facilitate software development workflows. GitHub enables teams to work together on projects from anywhere, review code, manage projects, and build software alongside millions of developers worldwide.';
  }

  async runSkill(
    skillName: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    parameters: any,
    intergrationConfig: Record<string, string>,
  ): Promise<string> {
    const githubTools = new GithubSkills(intergrationConfig);

    return githubTools.runSkill(skillName, parameters);
  }
}
