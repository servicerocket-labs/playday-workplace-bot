import {
  getAuthorizeUrl,
  getTodayPrimaryEvents,
  getUserRefreshClient,
} from '../utils/google';
import { getJoke } from '../utils/joke';
import { sendMessage } from '../utils/workplace';

enum MessageKeyWords {
  CalendarEvents = 'events',
  Joke = 'joke',
}

export async function webHookPageHandler(message: string, senderId: string) {
  switch (message) {
    case MessageKeyWords.CalendarEvents:
      await calendarEventsHandler(senderId);
      break;
    case MessageKeyWords.Joke:
      await jokeHandler(senderId);
      break;
    default:
      await notMatchHandler(senderId);
  }
}

export async function notMatchHandler(senderId: string) {
  const resMsg = {
    text: 'How can I help u : )',
    quick_replies: [
      {
        content_type: 'text',
        title: MessageKeyWords.Joke,
        payload: MessageKeyWords.Joke,
        image_url: undefined,
      },
      {
        content_type: 'text',
        title: MessageKeyWords.CalendarEvents,
        payload: MessageKeyWords.CalendarEvents,
        image_url: undefined,
      },
    ],
  };
  sendMessage(senderId, resMsg);
}

async function calendarEventsHandler(senderId: string) {
  const authClient = await getUserRefreshClient();
  if (!authClient) {
    // send authorization url if not authorized
    const resMsg = { text: getAuthorizeUrl() };
    await sendMessage(senderId, resMsg);
    return;
  }
  // send events
  const events = await getTodayPrimaryEvents(authClient);
  const resMsg = { text: JSON.stringify(events) };
  await sendMessage(senderId, resMsg);
}

async function jokeHandler(senderId: string) {
  const joke = await getJoke();
  const resMsg = { text: joke };
  await sendMessage(senderId, resMsg);
}
