import fs from 'fs';
import path from 'path';

import { Command } from 'commander';

import { AgentMessage } from './message';

// Abstract class for BaseAgent
export abstract class BaseAgent {
  protected program: Command;

  constructor() {
    this.program = new Command();
    this.registerCommands();
  }

  /**
   * Register CLI commands
   */
  private registerCommands(): void {
    this.program
      .name('agent')
      .description('CLI for Sigma Agent')
      .version(this.version(), '-v, --version', 'Display the version number');

    this.program
      .command('get-tools')
      .description('Get available tools/capabilities from tools.json')
      .action(() => {
        console.log(this.getTools());
      });

    this.program
      .command('get-jargon')
      .description('Get domain-specific terminology from jargon.md')
      .action(() => {
        console.log(this.getJargon());
      });

    this.program
      .command('run')
      .description('Run the agent with a message and stream JSON responses')
      .argument('<message>', 'Message to send to the agent')
      .argument('<context>', 'Context to send to the agent')
      .argument('<auth>', 'Authentication dictionary')
      .option('--auto-mode', 'Enable automatic mode', false)
      .action(async (message, context, auth, options) => {
        try {
          const autoMode = options.autoMode || false;
          const responses = this.run(message, context, auth, autoMode);

          for await (const response of responses) {
            // Ensure response is serializable and output it
            const jsonResponse = JSON.stringify(response);
            console.log(jsonResponse);
          }
        } catch (e) {
          // Handle errors by outputting as JSON
          const errorResponse = JSON.stringify({ error: (e as Error).message });
          console.error(errorResponse);
        }
      });
  }

  /**
   * Show version information
   */
  version(): string {
    try {
      // Read package.json to get version
      const packageJsonPath = path.resolve(__dirname, '../../package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      return packageJson.version;
    } catch (error) {
      return '0.1.0';
    }
  }

  /**
   * Get tools information
   */
  // eslint-disable-next-line @typescript-eslint/array-type
  getTools(): Array<any> {
    return [];
  }

  /**
   * Abstract method to get jargon information
   */
  getJargon(): string {
    return '';
  }

  /**
   * Parse and execute CLI commands
   */
  async parseAndRun(argv: string[] = process.argv): Promise<void> {
    await this.program.parseAsync(argv);
  }

  /**
   * Abstract method to run the agent
   * @param message Message to send to the agent
   * @param context Context to send to the agent
   * @param auth Authentication dictionary
   * @param autoMode Enable automatic mode
   */
  abstract run(
    message: string,
    context: string,
    auth: string,
    autoMode?: boolean,
  ): AsyncGenerator<AgentMessage, void, unknown>;
}
