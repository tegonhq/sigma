import { GetUsersDto, PublicUser } from '@sigma/types';
import axios from 'axios';

export async function getUsers(data: GetUsersDto): Promise<PublicUser[]> {
  const response = await axios.post(`/api/v1/users`, data);

  return response.data;
}
