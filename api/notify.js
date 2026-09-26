// Owner-only: sends web-push, email and Telegram-channel announcements.
const webpush = require('web-push');
const SB = 'https://mqassrjwcwpnruyflmpz.supabase.co';
const KEY = 'sb_publishable_2_oaZBr7tu63TC1HMSahMw_PT-H3z3i';

const rest = async (path, jwt, opts = {}) => {
  const r = await fetch(`${SB}/rest/v1/${path}`, { ...opts, headers: { apikey: KEY, Authorization: `Bearer ${jwt}`, 'Content-Type': 'application/json', ...(opts.headers || {}) } });
  if (!r.ok) throw new Error(`${path}: ${r.status} ${await r.text()}`);
  const t = await r.text(); return t ? JSON.parse(t) : null;
};
const chunk = (a, n) => { const o = []; for (let i = 0; i < a.length; i += n) o.push(a.slice(i, i + n)); return o; };

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const jwt = String(req.headers.authorization || '').replace(/^Bearer /, '');
  if (!jwt) return res.status(401).json({ error: 'Not logged in' });
  try {
    const role = await rest('rpc/ah_my_role', jwt, { method: 'POST', body: '{}' });
    if (role !== 'owner') return res.status(403).json({ error: 'Only the owner can send announcements' });

    const { title, body, url, slug, category, audience = 'followers', channels = {} } = req.body || {};
    if (!title || !body) return res.status(400).json({ error: 'Title and message are required' });
    const origin = `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers['x-forwarded-host'] || req.headers.host}`;
    const link = url ? (url.startsWith('http') ? url : origin + url) : origin;

    const sec = Object.fromEntries((await rest('ah_secrets?select=key,value', jwt)).map((r) => [r.key, r.value]));
    const set = Object.fromEntries((await rest('ah_settings?select=key,value&key=eq.vapid_public', jwt)).map((r) => [r.key, r.value]));
    const out = { push: null, email: null, telegram: null };

    /* ---- web push ---- */
    if (channels.push) {
      if (!sec.vapid_private_key || !set.vapid_public) throw new Error('Push keys are missing');
      webpush.setVapidDetails(sec.notify_email_to ? `mailto:${sec.notify_email_to}` : origin, set.vapid_public, sec.vapid_private_key);
      let subs = await rest('ah_push_subs?select=*&limit=10000', jwt);
      if (audience !== 'everyone') subs = subs.filter((s) => (slug && s.slugs.includes(slug)) || (category && s.categories.includes(category)));
      const payload = JSON.stringify({ title, body, url: link });
      let sent = 0, failed = 0, removed = 0;
      for (const grp of chunk(subs, 40)) {
        const rs = await Promise.allSettled(grp.map((s) => webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload)));
        for (let i = 0; i < rs.length; i++) {
          if (rs[i].status === 'fulfilled') sent++;
          else { failed++; const c = rs[i].reason && rs[i].reason.statusCode; if (c === 404 || c === 410) { removed++; await rest(`ah_push_subs?endpoint=eq.${encodeURIComponent(grp[i].endpoint)}`, jwt, { method: 'DELETE' }).catch(() => {}); } }
        }
      }
      out.push = { audience: subs.length, sent, failed, removed };
    }

    /* ---- email (Resend) ---- */
    if (channels.email) {
      if (!sec.resend_api_key) throw new Error('Add your Resend API key in Settings → Instant alerts first');
      let subs = await rest('ah_subscribers?select=*&limit=10000', jwt);
      if (audience !== 'everyone') subs = subs.filter((s) => !s.categories.length || (category && s.categories.includes(category)));
      const from = sec.notify_email_from || 'Appshub <onboarding@resend.dev>';
      let sent = 0, failed = 0;
      for (const grp of chunk(subs, 100)) {
        const mails = grp.map((s) => ({ from, to: [s.email], subject: title, text: `${body}\n\n${link}\n\n—\nUnsubscribe: ${origin}/unsubscribe?t=${s.token}`, html: `<p>${String(body).replace(/</g, '&lt;').replace(/\n/g, '<br>')}</p><p><a href="${link}">${link}</a></p><hr><p style="font-size:12px;color:#888"><a href="${origin}/unsubscribe?t=${s.token}">Unsubscribe</a></p>` }));
        const r = await fetch('https://api.resend.com/emails/batch', { method: 'POST', headers: { Authorization: `Bearer ${sec.resend_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify(mails) });
        if (r.ok) sent += grp.length; else failed += grp.length;
      }
      out.email = { audience: subs.length, sent, failed };
    }

    /* ---- Telegram channel ---- */
    if (channels.telegram) {
      if (!sec.telegram_bot_token || !sec.telegram_channel_id) throw new Error('Add the Telegram bot token and channel ID in Settings first');
      const r = await fetch(`https://api.telegram.org/bot${sec.telegram_bot_token}/sendMessage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: sec.telegram_channel_id, text: `${title}\n\n${body}\n\n${link}` }) });
      out.telegram = { ok: r.ok };
    }
    res.status(200).json(out);
  } catch (e) {
    res.status(500).json({ error: String(e.message || e).slice(0, 300) });
  }
};
