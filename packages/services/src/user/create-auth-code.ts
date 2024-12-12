import axios from 'axios';

export async function createAuthCode() {
  const response = await axios.get('/api/v1/users/authorization');

  const code = response.data.code;

  return {
    code,
  };
}
