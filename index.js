import express from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';
import { configDotenv } from 'dotenv';

configDotenv();
const app = express();
const port = 3000;

app.use(bodyParser.json());

app.get('/', (_req, res) => {
  res.send('App is live');
});

app.get('/webhook/page', (req, res) => {
  res.send(req.query['hub.challenge']);
});

app.post('/webhook/page', async (req, res) => {
  const entry = req.body.entry;

  const sender_id = entry[0].messaging[0].sender.id;

  send_joke(sender_id);
  res.status(200);
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});

async function send_joke(sender_id) {
  const res = await axios.get('https://icanhazdadjoke.com/', {
    headers: { Accept: 'application/json' },
  });
  const joke = res.data.joke;
  const message = {
    text: joke,
    quick_replies: [
      {
        content_type: 'text',
        title: 'More joke',
        payload: 'send_joke',
        image_url: undefined,
      },
    ],
  };
  send_message(sender_id, message);
  return;
}

function send_message(recipient_id, message) {
  console.log(`sending message to ${recipient_id}: ${message}`);

  const params = {
    access_token: process.env.WORKPLACE_TOKEN,
  };

  const headers = {
    'Content-Type': 'application/json',
  };

  const data = {
    recipient: {
      id: recipient_id,
    },
    message,
  };

  axios
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
      console.error(error);
    });
}
