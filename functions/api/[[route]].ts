import { Hono } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';
import { handle } from 'hono/cloudflare-pages';
import { Bindings } from '../utils/bindings';
import * as bcrypt from 'bcryptjs';
import users from './users';

const app = new Hono<{ Bindings: Bindings }>();

app.get('/api', (c) => {
  return c.json('Hello World');
});
app.route('/api/users', users);

export const onRequest = handle(app);
