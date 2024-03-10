import { Hono } from 'hono';
import { handle } from 'hono/cloudflare-pages';

const app = new Hono();

app.get('/api', (c) => {
  return c.json('Hello World');
});

export const onRequest = handle(app);
