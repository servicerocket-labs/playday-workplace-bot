import express from 'express';

const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello World - workplace!');
});

app.get('/webhook/page', (req, res) => {
  res.send(req.query['hub.challenge']);
});

app.post('/webhook/page', (req, res) => {
  console.log('Got body:', req);
  res.send('hello workplace');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
