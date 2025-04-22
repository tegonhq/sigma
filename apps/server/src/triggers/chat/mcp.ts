/* eslint-disable @typescript-eslint/no-explicit-any */

export class MCP {
  private Client: any;
  private clients: Record<string, any> = {};
  private StdioTransport: any;

  constructor() {}

  public async init() {
    this.Client = await MCP.importClient();
    this.StdioTransport = await MCP.importStdioTransport();
  }

  private static async importClient() {
    const { Client } = await import(
      '@modelcontextprotocol/sdk/client/index.js'
    );
    return Client;
  }

  private static async importStdioTransport() {
    const { StdioClientTransport } = await import('./stdio');
    return StdioClientTransport;
  }

  async tools() {
    const { tools } = await this.clients['Hevy'].listTools();
    const allTools = tools.map((tool: any) => {
      tool.name = `Hevy--${tool.name}`;
      return tool;
    });

    return allTools;
  }

  async connectToServer() {
    try {
      const client = new this.Client(
        {
          name: 'Hevy',
          version: '1.0.0',
        },
        {
          capabilities: {},
        },
      );

      // Conf
      // igure the transport for Hevy MCP server
      const transport = new this.StdioTransport({
        command: 'uvx',
        args: [
          'mcp-server-sentry',
          '--auth-token',
          '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',
        ],
      });

      console.log(transport);

      // Connect to the MCP server
      await client.connect(transport, { timeout: 60 * 1000 * 5 });
      this.clients['Hevy'] = client;

      console.log('Connected to Hevy MCP server with tools:');
    } catch (e) {
      console.log('Failed to connect to Hevy MCP server: ', e);
      throw e;
    }
  }
}
