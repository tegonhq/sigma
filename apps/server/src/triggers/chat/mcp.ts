/* eslint-disable @typescript-eslint/no-explicit-any */

import { logger } from '@trigger.dev/sdk/v3';

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

  async load(agents: string[], mcpConfig: any) {
    for (const agent of agents) {
      const mcp = mcpConfig.mcpServers[agent];
      await this.connectToServer(agent, mcp.command, mcp.args, mcp.env);
    }
  }

  private static async importStdioTransport() {
    const { StdioClientTransport } = await import('./stdio');
    return StdioClientTransport;
  }

  async tools() {
    let tools = '';

    for (const clientKey in this.clients) {
      const client = this.clients[clientKey];
      tools += `${clientKey} \n`;
      const { tools: clientTools } = await client.listTools();
      const toolDescriptions: string[] = [];

      for (const tool of clientTools) {
        tool.name = `${clientKey}--${tool.name}`;
        toolDescriptions.push(JSON.stringify(tool));
      }

      tools += toolDescriptions;
    }

    return tools;
  }

  async getTool(name: string) {
    try {
      const clientKey = name.split('--')[0];
      const toolName = name.split('--')[1];
      const client = this.clients[clientKey];
      const { tools: clientTools } = await client.listTools();
      const clientTool = clientTools.find((to: any) => to.name === toolName);

      return JSON.stringify(clientTool);
    } catch (e) {
      logger.error(e);
      throw new Error('Getting tool failed');
    }
  }

  async callTool(name: string, parameters: any) {
    const clientKey = name.split('--')[0];
    const toolName = name.split('--')[1];

    const client = this.clients[clientKey];

    const response = await client.callTool({
      name: toolName,
      arguments: parameters,
    });

    return response;
  }

  async connectToServer(
    name: string,
    command: string,
    args: string[],
    env: any,
  ) {
    try {
      const client = new this.Client(
        {
          name,
          version: '1.0.0',
        },
        {
          capabilities: {},
        },
      );

      // Conf
      // igure the transport for MCP server
      const transport = new this.StdioTransport({
        command,
        args,
        env,
      });

      // Connect to the MCP server
      await client.connect(transport, { timeout: 60 * 1000 * 5 });
      this.clients[name] = client;

      logger.info(`Connected to ${name} MCP server`);
    } catch (e) {
      logger.error(`Failed to connect to ${name} MCP server: `, e);
      throw e;
    }
  }
}
