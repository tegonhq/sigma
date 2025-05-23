import axios from 'axios';

export async function createAutomation(createAutomationDto: {
  text: string;
  mcps: string[];
}) {
  const response = await axios.post(`/api/v1/automations`, createAutomationDto);

  return response.data;
}
