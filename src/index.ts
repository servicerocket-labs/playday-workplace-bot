import express from 'express';
import bodyParser from 'body-parser';
import { configDotenv } from 'dotenv';
import {
  getAuthenticatedClient,
  getRedirectPath,
  saveCredentials,
} from './utils/google.js';
import { webHookPageHandler } from './handler/index.js';
import fs from 'fs';

configDotenv();
const app = express();
const port = 3000;

app.use(bodyParser.json());

app.get('/', (_req, res) => {
  return res.send('App is live');
});

app.get('/webhook/page', (req, res) => {
  return res.send(req.query['hub.challenge']);
});

app.post('/webhook/page', async (req, res) => {
  // extract info from payload
  const entry = req.body.entry;
  const messaging = entry[0].messaging[0];
  const senderId = messaging.sender.id;
  const message = messaging.message.text;

  // handle request
  await webHookPageHandler(message, senderId);
  return res.sendStatus(200);
});

app.get(getRedirectPath(), async (req, res) => {
  const query = req.query;
  const { code } = query;
  if (typeof code !== 'string') {
    return res.sendStatus(400);
  }
  const response = await getAuthenticatedClient().getToken(code);
  const refreshToken = response.tokens.refresh_token;
  if (!refreshToken) {
    return res.sendStatus(500);
  }
  await saveCredentials(refreshToken);
  return res.status(200).send('successfully authorize with Google');
});

app.get('/assets/google-calendar', async (_req, res) => {
  // Assuming your PNG file is named "icon.png" and located in the same directory as your server script
  const filePath = __dirname + '/assets/google-calendar.png';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      res.status(500).send('Internal Server Error');
      return;
    }

    // Set content type to image/png
    res.contentType('image/png');
    res.send(data);
  });
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
