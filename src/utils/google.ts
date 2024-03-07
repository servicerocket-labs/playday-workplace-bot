import keys from '../../credentials.json';

import { Auth, calendar_v3, google } from 'googleapis';

import { UserRefreshClient } from 'google-auth-library/build/src/auth/refreshclient';
import { promises as fs } from 'fs';
import path from 'path';

const TOKEN_PATH = path.join(process.cwd(), 'token.json');

export function getAuthenticatedClient() {
  // create an oAuth client to authorize the API call.  Secrets are kept in a `keys.json` file,
  // which should be downloaded from the Google Developers Console.
  const oAuth2Client = new Auth.OAuth2Client(
    keys.web.client_id,
    keys.web.client_secret,
    keys.web.redirect_uris[0]
  );
  return oAuth2Client;
}

export function getAuthorizeUrl() {
  // Generate the url that will be used for the consent dialog.
  const authorizeUrl = getAuthenticatedClient().generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/calendar',
    ],
  });
  return authorizeUrl;
}

/**
 * return google oauth redirect path
 *
 * @export
 * @return {*}  {string}
 */
export function getRedirectPath(): string {
  const redirectUrl = keys.web.redirect_uris[0];
  const path = new URL(redirectUrl).pathname;
  return path;
}

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<UserRefreshClient|null>}
 */
export async function getUserRefreshClient(): Promise<UserRefreshClient | null> {
  try {
    const content = await fs.readFile(TOKEN_PATH, 'utf8');
    const credentials = JSON.parse(content);
    const jsonClient = Auth.auth.fromJSON(credentials);
    if (jsonClient instanceof UserRefreshClient) {
      return jsonClient;
    }
    return null;
  } catch (err) {
    return null;
  }
}

/**
 *  * Serializes credentials to a file compatible with GoogleAUth.fromJSON. (UserRefreshClient)
 *
 * @param {string} refreshToken
 * @return {*}  {Promise<void>}
 */
export async function saveCredentials(refreshToken: string): Promise<void> {
  const key = keys.web;
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: refreshToken,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

export async function getTodayPrimaryEvents(
  auth: UserRefreshClient
): Promise<calendar_v3.Schema$Event[]> {
  const calendar = google.calendar({ version: 'v3', auth });
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const res = await calendar.events.list({
    calendarId: 'primary',
    timeMin: todayStart.toISOString(),
    timeMax: todayEnd.toISOString(),
    maxResults: 50,
    singleEvents: true,
    orderBy: 'startTime',
  });
  const events = res.data.items;
  if (!events || events.length === 0) {
    console.log('No upcoming events found.');
    return [];
  }
  return events;
}
