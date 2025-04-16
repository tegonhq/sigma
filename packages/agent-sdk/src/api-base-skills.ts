import { BaseSkills } from './base-skills';

export abstract class APIBaseSkills extends BaseSkills {
  protected headers: Record<string, string>;
  protected baseURL: string;

  constructor(
    integrationConfiguration: Record<string, string | number | boolean>,
  ) {
    super(integrationConfiguration);
    this.headers = this.getHeaders(integrationConfiguration);
    this.baseURL = this.getBaseURL(integrationConfiguration);
  }

  /**
   * This function should set the baseUrl of the class
   */
  // eslint-disable-next-line @typescript-eslint/array-type
  abstract getBaseURL(
    integrationConfiguration: Record<string, string | number | boolean>,
  ): string;

  /**
   * Get headers for API calls using the integration configuration
   * @param integrationConfiguration Configuration containing auth tokens and other settings
   */
  abstract getHeaders(
    integrationConfiguration: Record<string, string | number | boolean>,
  ): Record<string, string>;

  /**
   * Returns a map of tools (API operations)
   */
  skills(): Record<string, any> {
    return [];
  }
}
