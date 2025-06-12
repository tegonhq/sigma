import axios from 'axios';

import {
  AddReminderParams,
  RemoveReminderParams,
  UpdateReminderParams,
} from '../types/reminder';

export const addReminder = async (params: AddReminderParams) => {
  const response = await axios.post(`/api/v1/tasks`, {
    ...params,
    type: 'assistant',
  });
  return response.data;
};

export const removeReminder = async (params: RemoveReminderParams) => {
  const response = await axios.delete(`/api/v1/tasks/${params.reminderId}`);
  return response.data;
};

export const listReminders = async () => {
  const response = await axios.get(`/api/v1/tasks`);
  return response.data;
};

export const updateReminder = async (params: UpdateReminderParams) => {
  const response = await axios.put(`/api/v1/tasks/${params.reminderId}`, {
    ...params,
    type: 'assistant',
  });
  return response.data;
};
