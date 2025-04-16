import axios from 'axios';

export async function integrationCreate(
  userId: string,
  workspaceId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any,
) {
  const { config, integrationDefinition } = data;
  const integrationConfiguration = {
    apiKey: config.apiKey,
  };

  // Validate the API key by making a test call to Hevy API
  try {
    await axios.get('https://api.hevyapp.com/v1/workouts', {
      headers: {
        'api-key': config.apiKey,
      },
    });

    // If we get here, the API call was successful
    console.log('Hevy API validation successful');
  } catch (error) {
    console.error('Failed to validate Hevy API key:', error);
    throw new Error('Invalid Hevy API key. Please check your credentials and try again.');
  }

  const payload = {
    userId,
    accountId: Math.floor(10000 + Math.random() * 90000).toString(),
    config: integrationConfiguration,
    workspaceId,
    integrationDefinitionId: integrationDefinition.id,
  };

  const integrationAccount = (await axios.post(`/api/v1/integration_account`, payload)).data;

  return integrationAccount;
}
