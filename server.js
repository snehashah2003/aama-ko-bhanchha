'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const host = '127.0.0.1';
const port = Number(process.env.PORT || 3000);
const password = process.env.STAFF_PASSWORD || crypto.randomBytes(12).toString('base64url');
const sessions = new Map();
const storePath = path.join(__dirname, 'bookings.json');
const bookings = fs.existsSync(storePath) ? JSON.parse(fs.readFileSync(storePath, 'utf8')) : [];
const files = {
  '/': ['index.html', 'text/html; charset=utf-8'],
  '/index.html': ['index.html', 'text/html; charset=utf-8'],
  '/about.html': ['about.html', 'text/html; charset=utf-8'],
  '/our-story.html': ['our-story.html', 'text/html; charset=utf-8'],
  '/menu.html': ['menu.html', 'text/html; charset=utf-8'],
  '/gallery.html': ['gallery.html', 'text/html; charset=utf-8'],
  '/visit-book.html': ['visit-book.html', 'text/html; charset=utf-8'],
  '/contact.html': ['contact.html', 'text/html; charset=utf-8'],
  '/faq.html': ['faq.html', 'text/html; charset=utf-8'],
  '/staff.html': ['staff.html', 'text/html; charset=utf-8'],
  '/style.css': ['style.css', 'text/css; charset=utf-8'],
  '/site.js': ['site.js', 'text/javascript; charset=utf-8'],
  '/staff.js': ['staff.js', 'text/javascript; charset=utf-8'],
  '/thali.webp': ['thali.webp', 'image/webp'],
  '/services.html': ['services.html', 'text/html; charset=utf-8'],
  '/pricing.html': ['pricing.html', 'text/html; charset=utf-8'],
  '/interface.js': ['interface.js', 'text/javascript; charset=utf-8'],
  '/feast.webp': ['feast.webp', 'image/webp'],
  '/chicken.webp': ['chicken.webp', 'image/webp'],
  '/chiya.webp': ['chiya.webp', 'image/webp'],
  '/clay.webp': ['clay.webp', 'image/webp'],
  '/momo.webp': ['momo.webp', 'image/webp'],
  '/brass.webp': ['brass.webp', 'image/webp'],
  '/room.webp': ['room.webp', 'image/webp']
};

function send(res, code, data) {
  res.writeHead(code, {'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store'});
  res.end(JSON.stringify(data));
}

async function body(req) {
  if (!req.headers['content-type']?.startsWith('application/json')) throw new Error();
  const chunks = [];
  let size = 0;
  for await (const chunk of req.iterator({destroyOnReturn: false})) {
    size += chunk.length;
    if (size > 8192) {
      req.resume();
      throw new Error();
    }
    chunks.push(chunk);
  }
  const parsed = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error();
  return parsed;
}

function save(next) {
  fs.writeFileSync(storePath + '.tmp', JSON.stringify(next, null, 2), {mode: 0o600});
  fs.renameSync(storePath + '.tmp', storePath);
  bookings.splice(0, bookings.length, ...next);
}

function samePassword(candidate) {
  if (typeof candidate !== 'string') return false;
  const digest = (value) => crypto.createHash('sha256').update(value).digest();
  return crypto.timingSafeEqual(digest(candidate), digest(password));
}

function sessionCookie(value, seconds) {
  return `staff=${value}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${seconds}`;
}

const server = http.createServer(async (req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  const route = (req.url || '').split('?')[0];
  const method = req.method;
  const session = /(?:^|; )staff=([a-f0-9]{64})(?:;|$)/.exec(req.headers.cookie || '')?.[1];
  const now = Date.now();
  for (const [token, expires] of sessions) {
    if (expires <= now) sessions.delete(token);
  }

  try {
    if (method === 'GET' && Object.hasOwn(files, route)) {
      const [filename, type] = files[route];
      const bytes = fs.readFileSync(path.join(__dirname, 'public', filename));
      res.writeHead(200, {'Content-Type': type});
      return res.end(bytes);
    }

    if (method === 'POST' && route === '/api/bookings') {
      const {name, email, date, time, guests} = await body(req);
      const today = new Intl.DateTimeFormat('en-CA', {timeZone: 'Asia/Kathmandu'}).format(new Date());
      const validDate = typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)
        && Number.isFinite(Date.parse(date)) && new Date(date).toISOString().slice(0, 10) === date;
      if (typeof name !== 'string' || !name.trim() || name.length > 100 ||
          typeof email !== 'string' || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
          !validDate || date < today || typeof time !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time) ||
          !['number', 'string'].includes(typeof guests) || !/^([1-9]|[12]\d|30)$/.test(String(guests))) {
        return send(res, 400, {error: 'Enter a valid name, email, date, time and guest count from 1 to 30.'});
      }
      const id = crypto.randomBytes(8).toString('hex');
      save([...bookings, {id, name: name.trim(), email: email.trim(), date, time, guests: Number(guests), status: 'Pending'}]);
      return send(res, 201, {id, status: 'Pending'});
    }

    if (method === 'POST' && route === '/api/login') {
      const input = await body(req);
      if (!samePassword(input.password)) return send(res, 401, {error: 'Incorrect password.'});
      sessions.delete(session);
      const token = crypto.randomBytes(32).toString('hex');
      sessions.set(token, now + 8 * 60 * 60 * 1000);
      res.setHeader('Set-Cookie', sessionCookie(token, 8 * 60 * 60));
      return send(res, 200, {ok: true});
    }

    if (method === 'POST' && route === '/api/logout') {
      sessions.delete(session);
      res.setHeader('Set-Cookie', sessionCookie('', 0));
      return send(res, 200, {ok: true});
    }

    const bookingId = /^\/api\/bookings\/([a-f0-9]{16})$/.exec(route)?.[1];
    if ((method === 'GET' && route === '/api/bookings') || (method === 'PATCH' && bookingId)) {
      if (!sessions.has(session)) return send(res, 401, {error: 'Sign in to view booking requests.'});
      if (method === 'GET') return send(res, 200, bookings);
      const {decision} = await body(req);
      if (!['Approve', 'Decline'].includes(decision)) return send(res, 400, {error: 'Choose Approve or Decline.'});
      const booking = bookings.find((item) => item.id === bookingId);
      if (!booking) return send(res, 404, {error: 'Booking not found.'});
      if (booking.status !== 'Pending') return send(res, 409, {error: 'This request has already been reviewed.'});
      const updated = {...booking, status: decision === 'Approve' ? 'Approved' : 'Declined'};
      save(bookings.map((item) => item.id === bookingId ? updated : item));
      return send(res, 200, {status: updated.status});
    }

    return send(res, 404, {error: 'Page not found.'});
  } catch (error) {
    if (error.code) {
      console.error(error);
      return send(res, 500, {error: 'The server could not complete the request.'});
    }
    return send(res, 400, {error: 'Invalid request.'});
  }
});

server.listen(port, host, () => {
  console.log(`Open http://${host}:${server.address().port}`);
  if (!process.env.STAFF_PASSWORD) console.log(`Local staff password: ${password}`);
});
