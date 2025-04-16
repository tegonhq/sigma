import { ReactBaseAgent } from '@tegonhq/agent-sdk';

import { SigmaSkills } from './sigma-skills';
import { TERMS } from './terms';

export class SigmaAgent extends ReactBaseAgent {
  // eslint-disable-next-line @typescript-eslint/array-type, @typescript-eslint/no-explicit-any
  skills(): Array<any> {
    const sigmaSkills = new SigmaSkills({});
    const skills = sigmaSkills.skills();
    return Object.keys(skills).map((key) => ({ ...skills[key], name: key }));
  }

  terms(): string {
    return TERMS;
  }

  about(): string {
    return 'Sigma is a personal task management system. Each day has its own page that contains tasks, activities, which are events aggregated from various third-party services, as well as research notes, personal notes, or any other content the user wants to capture. The system helps users track and manage their daily activities by collecting and organizing events from external integrations while providing a flexible space for documentation and note-taking.';
  }

  async runSkill(
    skillName: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    parameters: any,
    intergrationConfig: Record<string, string>,
  ): Promise<string> {
    const sigmaTools = new SigmaSkills(intergrationConfig);

    return sigmaTools.runSkill(skillName, parameters);
  }
}
