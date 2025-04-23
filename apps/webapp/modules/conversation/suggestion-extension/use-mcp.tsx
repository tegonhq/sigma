import React from 'react';

import { UserContext } from 'store/user-context';

export const useMCP = () => {
  const user = React.useContext(UserContext);

  return user.mcp;
};

export const getMCPServers = (mcpConfig: string | object) => {
  const defaultServer = { key: 'sigma', name: 'Sigma' };

  try {
    // Handle string or object config
    const config =
      typeof mcpConfig === 'string' ? JSON.parse(mcpConfig) : mcpConfig;

    // Return default if no mcpServers configuration exists
    if (!config?.mcpServers) {
      return [defaultServer];
    }

    // Transform server keys to server objects with capitalized names
    const userServers = Object.keys(config.mcpServers).map((key) => ({
      key,
      name: key.charAt(0).toUpperCase() + key.slice(1), // Capitalize first letter
    }));

    // Always include the default Sigma server
    return [...userServers, defaultServer];
  } catch (error) {
    console.error('Error parsing MCP config:', error);
    return [defaultServer];
  }
};

export const useMCPServers = () => {
  const mcp = useMCP();
  return React.useMemo(() => getMCPServers(mcp), [mcp]);
};
