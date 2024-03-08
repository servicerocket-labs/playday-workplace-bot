import axios, { AxiosError } from 'axios';
export async function sendMessage(recipientId: string, message: any) {
  console.log(`sending message to ${recipientId}`);

  const params = {
    access_token: process.env.WORKPLACE_TOKEN,
  };

  const headers = {
    'Content-Type': 'application/json',
  };

  const data = {
    recipient: {
      id: recipientId,
    },
    message,
  };

  await axios
    .post('https://graph.facebook.com/v13.0/me/messages', data, {
      params,
      headers,
    })
    .then((response) => {
      if (response.status !== 200) {
        console.error(response.status);
        console.error(response.data);
      }
    })
    .catch((error) => {
      if (error instanceof AxiosError) {
        const message = { code: error.code, data: error.response?.data };
        console.error(message);
        return;
      }
      console.error(error);
    });
}
