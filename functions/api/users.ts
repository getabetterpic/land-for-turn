import { Hono } from 'hono';
import { Bindings } from '../utils/bindings';
import { drizzle } from 'drizzle-orm/d1';
import * as bcrypt from 'bcryptjs';
import { users } from '../db/schema';
import { eq, or } from 'drizzle-orm';
import { getCookie, setCookie } from 'hono/cookie';
import { sendConfirmationEmail } from '../utils/send-confirmation-email';

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

const cookieExpiration = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365);
const app = new Hono<{ Bindings: Bindings }>();

app.post('/register', async (c) => {
  const { email, username, password, passwordConfirm } = await c.req.json();
  const cleanEmail = normalizeEmail(email);
  if (password !== passwordConfirm) {
    return c.json({ error: 'Passwords do not match' }, 400);
  }
  if (password.length < 8) {
    return c.json({ error: 'Password must be at least 8 characters' }, 400);
  }
  if (password.length > 255) {
    return c.json({ error: 'Password must be at most 255 characters' }, 400);
  }
  if (username && username.length < 3) {
    return c.json({ error: 'Username must be at least 3 characters' }, 400);
  }
  if (username && username.length > 100) {
    return c.json({ error: 'Username must be at most 100 characters' }, 400);
  }
  if (cleanEmail.length > 255) {
    return c.json({ error: 'Email must be at most 255 characters' }, 400);
  }

  const db = drizzle(c.env.DB);
  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, cleanEmail))
    .all();
  if (user.length) {
    return c.json({ error: 'Email already taken' }, 400);
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    const [user] = await db
      .insert(users)
      .values({
        email: cleanEmail,
        username,
        password_hash: hash,
        confirmation_token: Math.random().toString(36).substring(2),
      })
      .returning({
        email: users.email,
        username: users.username,
        confirmation_token: users.confirmation_token,
      })
      .all();
    const host = c.req.header('Host') || 'land-for-turn.pages.dev';
    await sendConfirmationEmail(user, host);
    return c.json({
      success: true,
      confirmation_token: user.confirmation_token,
    });
  } catch (error) {
    return c.json({ error: 'An error occurred' }, 500);
  }
});

app.post('/login', async (c) => {
  // Find the user and ensure there's a hash
  const { email, password } = await c.req.json();
  const cleanEmail = normalizeEmail(email);
  const db = drizzle(c.env.DB);
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, cleanEmail))
    .all();
  if (!user) {
    return c.json({ error: 'Invalid email or password' }, 400);
  }

  const { password_hash, username, confirmed_at } = user;
  const valid = await bcrypt.compare(password, password_hash);
  if (!valid) {
    return c.json({ error: 'Invalid email or password' }, 400);
  }
  if (!confirmed_at) {
    return c.json({ error: 'Please confirm your email' }, 400);
  }

  const token = Math.random().toString(36).slice(2);
  try {
    await c.env.KV.put(
      `token:${token}`,
      JSON.stringify({ cleanEmail, username }),
    );
    setCookie(c, 'token', token, {
      httpOnly: true,
      path: '/',
      sameSite: 'Lax',
      expires: cookieExpiration,
    });

    return c.json({ success: true, email: cleanEmail, username });
  } catch (error) {
    return c.json({ success: false }, 500);
  }
});

app.get('/me', async (c) => {
  const token = getCookie(c, 'token');
  if (!token) {
    return c.json({ email: null });
  }

  try {
    const user = await c.env.KV.get<{ email: string }>(
      `token:${token}`,
      'json',
    );
    return c.json({ email: user?.email });
  } catch (error) {
    return c.json({ email: null });
  }
});

app.get('/confirm', async (c) => {
  const { confirmation_token } = c.req.query();
  const db = drizzle(c.env.DB);
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.confirmation_token, confirmation_token))
    .all();
  if (!user) {
    return c.redirect('/register');
  }
  try {
    await db
      .update(users)
      .set({ confirmed_at: new Date().toISOString() })
      .where(eq(users.confirmation_token, confirmation_token))
      .run();
    return c.redirect('/login');
  } catch (error) {
    return c.redirect('/register');
  }
});

export default app;
