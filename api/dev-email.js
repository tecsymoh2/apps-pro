// Owner/editor only: emails a freshly-issued developer key to that developer's
// email address (opt-in, stored on their profile). Uses the same Resend key
// already configured in Settings -> Alerts & notifications.
const SB = 'https://mqassrjwcwpnruyflmpz.supabase.co';
const KEY = 'sb_publishable_2_oaZBr7tu63TC1HMSahMw_PT-H3z3i';

const rest = async (path, jwt) => {
  const r = await fetch(`${SB}/rest/v1/${path}`, { headers: { apikey: KEY, Authorization: `Bearer ${jwt}` } });
  if (!r.ok) throw new Error(`${path}: ${r.status} ${await r.text()}`);
  return r.json();
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const jwt = String(req.headers.authorization || '').replace(/^Bearer /, '');
  if (!jwt) return res.status(401).json({ error: 'Not logged in' });
  try {
    const role = await fetch(`${SB}/rest/v1/rpc/ah_my_role`, { method: 'POST', headers: { apikey: KEY, Authorization: `Bearer ${jwt}`, 'Content-Type': 'application/json' }, body: '{}' }).then((r) => r.json());
    if (!role) return res.status(403).json({ error: 'Admin accounts only' });

    const { email, name, key } = req.body || {};
    if (!email || !key) return res.status(400).json({ error: 'Email and key are required' });
    const sec = Object.fromEntries((await rest('ah_secrets?select=key,value', jwt)).map((r) => [r.key, r.value]));
    if (!sec.resend_api_key) return res.status(400).json({ error: 'Add a Resend API key in Settings -> Alerts & notifications first' });
    const from = sec.notify_email_from || 'Appshub <onboarding@resend.dev>';
    const origin = `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers['x-forwarded-host'] || req.headers.host}`;
    const text = `Hi ${name || 'there'},\n\nHere is your new Appshub developer key. Keep it safe — it's the only way back into your apps:\n\n${key}\n\nUse it at ${origin}/developer under "I have a key".\n\n— Appshub`;
    const r = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${sec.resend_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from, to: [email], subject: 'Your new Appshub developer key', text }) });
    if (!r.ok) return res.status(500).json({ error: 'Resend rejected the email: ' + (await r.text()).slice(0, 200) });
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: String(e.message || e).slice(0, 300) });
  }
};
