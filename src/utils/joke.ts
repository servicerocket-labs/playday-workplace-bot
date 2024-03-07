import axios from 'axios';

export async function getJoke(): Promise<string> {
  const res = await axios.get('https://icanhazdadjoke.com/', {
    headers: { Accept: 'application/json' },
  });
  const joke = res.data.joke;
  return joke;
}
