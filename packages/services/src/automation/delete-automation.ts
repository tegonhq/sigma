import axios from 'axios';

export async function deleteAutomation(deleteAutomationDto: {
  automationId: string;
}) {
  const response = await axios.delete(
    `/api/v1/automations/${deleteAutomationDto.automationId}`,
  );

  return response.data;
}
