export abstract class BaseTools {
  protected headers: Record<string, string>;

  constructor(headers: Record<string, string | number | boolean>) {
    this.headers = this.getHeaders(headers);
  }

  static getInstance(
    integrationConfiguration: Record<string, string | number | boolean>,
  ): BaseTools {
    return new (this as any)(integrationConfiguration);
  }

  /**
   * This function should return the tools for the agent being used
   */
  // eslint-disable-next-line @typescript-eslint/array-type
  abstract getTools(): Record<string, any>;

  /**
   * Get headers for API calls using the integration configuration
   * @param integrationConfiguration Configuration containing auth tokens and other settings
   */
  abstract getHeaders(
    integrationConfiguration: Record<string, string | number | boolean>,
  ): Record<string, string>;

  /**
   * Execute the specified action with the given parameters
   * @param actionName Name of the action to execute
   * @param parameters Parameters to pass to the action
   */
  abstract runAction(actionName: string, parameters: any): any;
}
