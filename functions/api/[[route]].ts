import { Hono } from 'hono';
import { handle } from 'hono/cloudflare-pages';
import { Bindings } from '../utils/bindings';
import * as bcrypt from 'bcryptjs';

const app = new Hono<{ Bindings: Bindings }>();

app.get('/api', (c) => {
  return c.json('Hello World');
});
app.post('/api/register', async (c) => {
  const { email, username, password, passwordConfirm } = await c.req.json();
  if (password !== passwordConfirm) {
    return c.json({ error: 'Passwords do not match' }, 400);
  }
  if (password.length < 8) {
    return c.json({ error: 'Password must be at least 8 characters' }, 400);
  }
  if (password.length > 255) {
    return c.json({ error: 'Password must be at most 255 characters' }, 400);
  }
  if (username.length < 3) {
    return c.json({ error: 'Username must be at least 3 characters' }, 400);
  }
  if (username.length > 100) {
    return c.json({ error: 'Username must be at most 100 characters' }, 400);
  }
  if (email.length > 255) {
    return c.json({ error: 'Email must be at most 255 characters' }, 400);
  }

  const user = await c.env.KV.get('user:' + username);
  if (user) {
    return c.json({ error: 'Username already taken' }, 400);
  }

  const emailUser = await c.env.KV.get('email:' + email.toLowerCase());
  if (emailUser) {
    return c.json({ error: 'Email already taken' }, 400);
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    await c.env.KV.put(
      `user:${email.toLowerCase()}`,
      JSON.stringify({ hash, username }),
    );
    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: 'An error occurred' }, 500);
  }
});

export const onRequest = handle(app);
