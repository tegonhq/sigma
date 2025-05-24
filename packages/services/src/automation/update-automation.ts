import axios from 'axios';

export async function updateAutomation({
  automationId,
  ...updateAutomationDto
}: {
  automationId: string;
  text: string;
  mcps: string[];
}) {
  const response = await axios.post(
    `/api/v1/automations/${automationId}`,
    updateAutomationDto,
  );

  return response.data;
}
