import { Hono } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';
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

  const user = await c.env.KV.get('user:' + email.toLowerCase());
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
    await c.env.KV.put(`email:${email.toLowerCase()}`, username);
    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: 'An error occurred' }, 500);
  }
});

app.post('/api/login', async (c) => {
  // Find the user and ensure there's a hash
  const { email, password } = await c.req.json();
  const user = await c.env.KV.get<{ hash: string; username: string }>(
    `user:${email.toLowerCase()}`,
    'json',
  );
  if (!user || !user.hash) {
    return c.json({ error: 'Invalid email or password' }, 400);
  }

  const { hash, username } = user;
  const valid = await bcrypt.compare(password, hash);
  if (!valid) {
    return c.json({ error: 'Invalid email or password' }, 400);
  }

  const token = Math.random().toString(36).slice(2);
  await c.env.KV.put(`token:${token}`, JSON.stringify({ email, username }));
  setCookie(c, 'token', token, { httpOnly: true, path: '/', sameSite: 'Lax' });

  return c.json({ success: true, username });
});

app.get('/api/me', async (c) => {
  const token = getCookie(c, 'token');
  if (!token) {
    return c.json({ username: null }, 200);
  }

  const user = await c.env.KV.get<{ email: string; username: string }>(
    `token:${token}`,
    'json',
  );
  if (!user) {
    return c.json({ username: null }, 200);
  }

  return c.json({ username: user.username });
});

export const onRequest = handle(app);
