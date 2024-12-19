import type { IntegrationDefinition } from '@sigma/types';

import type { IPCRenderer } from 'hooks/ipc';

// Add this helper function above the TaskCategory component
export const getStatusPriority = (status: string) => {
  switch (status) {
    case 'Done':
      return 1;
    case 'In Progress':
      return 3;
    case 'Todo':
      return 2;
    default:
      return 0;
  }
};

export const getIntegrationURL = async (
  ipc: IPCRenderer,
  integration: IntegrationDefinition,
) => {
  if (!ipc) {
    return `${integration.url}/frontend/index.js`;
  }

  const integrationsURL = await ipc.getIntegrationsFolder();

  const url = `http://localhost:8000/local/${integrationsURL}/${integration.name}/${integration.version}/frontend/index.js`;

  return url;
};
