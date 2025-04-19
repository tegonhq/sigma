import fs from 'fs';
import path from 'path';

import { Command } from 'commander';
import pino, { Logger } from 'pino';

import { AgentMessage, AgentMessageType } from './message';

// Abstract class for BaseAgent
export abstract class BaseAgent {
  protected program: Command;
  logger: Logger;

  constructor() {
    this.program = new Command();
    this.registerCommands();

    const transport = this.program.opts().pretty
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        }
      : undefined;

    this.logger = pino(
      {
        level: this.program.opts().logLevel || 'info',
        transport,
      },
      process.stderr,
    );
  }

  /**
   * Register CLI commands
   */
  private registerCommands(): void {
    this.program
      .name('agent')
      .description('CLI for Sigma Agent')
      .version(this.version(), '-v, --version', 'Display the version number')
      .option('--log-level <level>', 'Set logging level', 'info')
      .option('--pretty', 'Enable pretty printing of logs', false);

    this.program
      .command('skills')
      .description('Lists agent capabilities and available skills')
      .action(() => {
        console.log(this.skills());
      });

    this.program
      .command('about')
      .description('Provides information about what the agent does')
      .action(() => {
        console.log(this.about());
      });

    this.program
      .command('terms')
      .description('Shows domain-specific terminology the agent understands')
      .action(() => {
        console.log(this.terms());
      });

    this.program
      .command('ask')
      .description(
        'Executes the agent with a user message and streams responses',
      )
      .argument('<message>', 'Message to send to the agent')
      .argument(
        '<auth>',
        'Authentication details for API integration (JSON string)',
      )
      .argument(
        '[context]',
        'Context to send to the agent (JSON string or path to .json file)',
        'context.json',
      )
      .option('--auto-mode', 'Enable automatic mode', false)
      .action(async (message, context, auth, options) => {
        try {
          const autoMode = options.autoMode || false;
          const responses = this.ask(message, context, auth, autoMode);

          for await (const response of responses) {
            console.log(JSON.stringify(response));
          }
        } catch (e) {
          // Handle errors by outputting as JSON
          const errorResponse = JSON.stringify({ error: (e as Error).message });
          console.log(
            JSON.stringify({
              message: errorResponse,
              type: AgentMessageType.ERROR,
            }),
          );
        }
      });
  }

  /**
   * Show version information
   */
  version(): string {
    // Define a version constant that will be replaced during build
    // This approach doesn't rely on accessing package.json at runtime
    const VERSION = '0.1.0'; // This will be updated by build tools

    try {
      // First try to get version from environment if available
      if (process.env.AGENT_SDK_VERSION) {
        return process.env.AGENT_SDK_VERSION;
      }

      // If running in development with package.json available
      try {
        const packageJsonPath = path.resolve(__dirname, '../../package.json');
        const packageJson = JSON.parse(
          fs.readFileSync(packageJsonPath, 'utf8'),
        );
        return packageJson.version;
      } catch {
        // Fallback to the version constant
        return VERSION;
      }
    } catch (error) {
      return VERSION;
    }
  }

  /**
   * Get tools information
   */
  // eslint-disable-next-line @typescript-eslint/array-type
  skills(): Array<any> {
    return [];
  }

  /**
   * Abstract method to get jargon information
   */
  terms(): string {
    return '';
  }

  /**
   * Abstract method to get jargon information
   */
  about(): string {
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
  abstract ask(
    message: string,
    context: string,
    auth: string,
    autoMode?: boolean,
  ): AsyncGenerator<AgentMessage, void, unknown>;
}
