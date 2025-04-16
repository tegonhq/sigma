export abstract class BaseSkills {
  constructor(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _integrationConfiguration: Record<string, string | number | boolean>,
  ) {}

  /**
   * This function should return the tools for the agent being used
   */
  // eslint-disable-next-line @typescript-eslint/array-type
  abstract skills(): Record<string, any>;

  /**
   * Execute the specified action with the given parameters
   * @param skillName Name of the action to execute
   * @param parameters Parameters to pass to the action
   */
  abstract runSkill(actionName: string, parameters: any): any;
}
