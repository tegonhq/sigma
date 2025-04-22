import fs from 'fs';
import path from 'path';

import { IntegrationDefinitionV2 } from '@prisma/client';
import axios from 'axios';

import {
  getIntegrationConfigForIntegrationDefinition,
  getIntegrationDefinitionsForAgents,
} from './utils';

export const downloadAgentFiles = async (agents: string[]) => {
  const integrationDefinitions =
    await getIntegrationDefinitionsForAgents(agents);

  await Promise.all(
    integrationDefinitions.map(async (integrationDefinition) => {
      const version = integrationDefinition.version;
      const slug = integrationDefinition.slug;

      // Create directory if it doesn't exist
      const dirPath = path.join('agents', slug);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      // Download agent index.js file
      const agentUrl = `https://integrations.mysigma.ai/${slug}/${version}/agent/index.js`;
      const agentFilePath = path.join(dirPath, 'index.js');

      // Download spec.json file
      const specUrl = `https://integrations.mysigma.ai/${slug}/${version}/spec.json`;
      const specFilePath = path.join(dirPath, 'spec.json');

      try {
        // Download and save agent index.js
        const agentResponse = await axios.get(agentUrl);
        fs.writeFileSync(agentFilePath, agentResponse.data);

        // Download and save spec.json
        const specResponse = await axios.get(specUrl);
        fs.writeFileSync(
          specFilePath,
          JSON.stringify(specResponse.data, null, 2),
        );
      } catch (error) {
        throw new Error(`Error downloading files for ${slug}: ${error}`);
      }
    }),
  );

  // Download sigma agent files
  const sigmaDir = path.join('agents', 'sigma');
  if (!fs.existsSync(sigmaDir)) {
    fs.mkdirSync(sigmaDir, { recursive: true });
  }

  try {
    // // Download and save sigma agent index.js
    // const sigmaAgentUrl =
    //   "https://integrations.mysigma.ai/sigma/0.1.0/agent/index.js";
    // const sigmaAgentResponse = await axios.get(sigmaAgentUrl);
    // fs.writeFileSync(path.join(sigmaDir, "index.js"), sigmaAgentResponse.data);

    // Download and save sigma spec.json
    const sigmaSpecUrl =
      'https://integrations.mysigma.ai/sigma/0.1.0/spec.json';
    const sigmaSpecResponse = await axios.get(sigmaSpecUrl);
    fs.writeFileSync(
      path.join(sigmaDir, 'spec.json'),
      JSON.stringify(sigmaSpecResponse.data, null, 2),
    );
  } catch (error) {
    console.log(error);
    throw new Error(`Error downloading sigma agent files: ${error}`);
  }

  return { integrationDefinitions };
};

export const getDescriptionsForAgents = (agents: string[]) => {
  let agentDescriptionsText = '';

  for (const agent of [...agents, 'sigma']) {
    try {
      const specFilePath = path.join('agents', agent, 'spec.json');

      let description = 'No description available';

      if (fs.existsSync(specFilePath)) {
        const specContent = fs.readFileSync(specFilePath, 'utf8');
        const spec = JSON.parse(specContent);

        if (spec.description) {
          description = spec.description;
        }
      } else {
        description = 'Spec file not found';
      }

      agentDescriptionsText += `${agent}: ${description}\n`;
    } catch (error) {
      console.error(`Error reading spec file for ${agent}:`, error);
      agentDescriptionsText += `${agent}: Error reading description\n`;
    }
  }

  return agentDescriptionsText;
};

export const getIntegrationAccountConfig = async (
  agent: string,
  integrationDefinitions: IntegrationDefinitionV2[],
  token: string,
) => {
  if (agent === 'sigma') {
    return { accessToken: token };
  }

  const integrationDefinition = integrationDefinitions.find(
    (id) => id.slug === agent,
  );

  if (!integrationDefinition) {
    throw new Error(
      `Integration Definition is not found for the agent: ${agent}`,
    );
  }

  const integrationAccount = await getIntegrationConfigForIntegrationDefinition(
    integrationDefinition.id,
  );

  return integrationAccount?.integrationConfiguration;
};
