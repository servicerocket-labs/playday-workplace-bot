import {
  convertToReadableDateTime,
  getAuthorizeUrl,
  getTodayEvents,
  getUserRefreshClient,
} from '../utils/google';
import { getJoke } from '../utils/joke';
import { sendMessage } from '../utils/workplace';

enum MessageKeyWords {
  CalendarEvents = 'google events',
  TeamAvailability = 'team availability',
  Joke = 'joke',
}

export async function webHookPageHandler(message: string, senderId: string) {
  let matched = false;
  if (message.includes(MessageKeyWords.CalendarEvents)) {
    matched = true;
    await calendarEventsHandler(senderId);
  }
  if (message.includes(MessageKeyWords.TeamAvailability)) {
    matched = true;
    await teamAvailabilityHandler(senderId);
  }
  if (message.includes(MessageKeyWords.Joke)) {
    matched = true;
    await jokeHandler(senderId);
  }
  if (matched === false) {
    await notMatchHandler(senderId);
  }
}

async function notMatchHandler(senderId: string) {
  const quickReplies = Object.values(MessageKeyWords).map((keyword) => {
    const quickReply = {
      content_type: 'text',
      title: keyword,
      payload: keyword,
      image_url: undefined,
    };
    return quickReply;
  });

  const resMsg = {
    text: 'How can I help u : )',
    quick_replies: [...quickReplies],
  };
  sendMessage(senderId, resMsg);
}

async function calendarEventsHandler(senderId: string) {
  const authClient = await getUserRefreshClient();
  if (!authClient) {
    // send authorization url if not authorized
    const resMsg = {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'button',
          text: "Looks like you haven' authorize the app to access your Google data",
          buttons: [
            {
              type: 'web_url',
              url: getAuthorizeUrl(),
              title: 'Authorize with Google',
            },
          ],
        },
      },
    };
    await sendMessage(senderId, resMsg);
    return;
  }
  // send events
  const events = await getTodayEvents(authClient);
  const eventsElements = events.map((event) => {
    const { summary, start, end } = event;
    const readableStart = convertToReadableDateTime(start ?? {});
    const readableEnd = convertToReadableDateTime(end ?? {});
    return {
      title: summary,
      subtitle: `start: ${readableStart}\nend : ${readableEnd}`,
      image_url: `${process.env.BASE_URL}/assets/google-calendar`,
    };
  });

  const ptos = await getTodayEvents(
    authClient,
    'c_nn7hr3k6fa20erniclt1jf8u5g@group.calendar.google.com'
  );

  // const resMsg = { text: JSON.stringify(eventsInfo) };
  const resMsg = {
    attachment: {
      type: 'template',
      payload: {
        template_type: 'generic',
        elements: [...eventsElements],
      },
    },
  };
  await sendMessage(senderId, resMsg);
}

async function teamAvailabilityHandler(senderId: string) {
  const authClient = await getUserRefreshClient();
  if (!authClient) {
    // send authorization url if not authorized
    const resMsg = {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'button',
          text: "Looks like you haven' authorize the app to access your Google data",
          buttons: [
            {
              type: 'web_url',
              url: getAuthorizeUrl(),
              title: 'Authorize with Google',
            },
          ],
        },
      },
    };
    await sendMessage(senderId, resMsg);
    return;
  }
  // send events
  const ptoEvents = await getTodayEvents(
    authClient,
    'c_nn7hr3k6fa20erniclt1jf8u5g@group.calendar.google.com'
  );
  const onLeaveList = ptoEvents.map((pto) => {
    return pto.summary;
  });

  // const resMsg = { text: JSON.stringify(eventsInfo) };
  const resMsg = { text: onLeaveList.join(',\n') };
  await sendMessage(senderId, resMsg);
}

async function jokeHandler(senderId: string) {
  const joke = await getJoke();
  const resMsg = { text: joke };
  await sendMessage(senderId, resMsg);
}
