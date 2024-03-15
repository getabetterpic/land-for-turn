import { Hono } from 'hono';
import { handle } from 'hono/cloudflare-pages';
import { poweredBy } from 'hono/powered-by';
import { secureHeaders } from 'hono/secure-headers';
import { etag } from 'hono/etag';
import { Bindings } from '../utils/bindings';
import users from './users';

const app = new Hono<{ Bindings: Bindings }>();
app.use(poweredBy());
app.use(secureHeaders());
app.use(etag());

app.get('/api', (c) => {
  return c.json('Hello World');
});
app.route('/api/users', users);

export const onRequest = handle(app);
