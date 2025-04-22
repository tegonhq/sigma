import React from 'react';

import { UserContext } from 'store/user-context';

export const useMCP = () => {
  const user = React.useContext(UserContext);

  return user.mcp;
};

export const getMCPServers = (mcpConfig: string | object) => {
  try {
    // Parse the config if it's a string
    const config =
      typeof mcpConfig === 'string' ? JSON.parse(mcpConfig) : mcpConfig;

    // Check if mcpServers exists in the config
    if (!config.mcpServers) {
      return [];
    }

    // Extract server names and create the array of objects
    return Object.keys(config.mcpServers).map((key) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      // Capitalize the first letter for display
      key,
    }));
  } catch (error) {
    console.error('Error parsing MCP config:', error);
    return [];
  }
};

export const useMCPServers = () => {
  const mcp = useMCP();
  return React.useMemo(() => getMCPServers(mcp), [mcp]);
};
