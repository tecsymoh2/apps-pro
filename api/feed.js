// RSS 2.0 feed of newly added apps, for blogs / Telegram bots to auto-post.
const SB = 'https://mqassrjwcwpnruyflmpz.supabase.co';
const KEY = 'sb_publishable_2_oaZBr7tu63TC1HMSahMw_PT-H3z3i';
const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

module.exports = async (req, res) => {
  const origin = `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers['x-forwarded-host'] || req.headers.host}`;
  let apps = [];
  try {
    const r = await fetch(`${SB}/rest/v1/ah_apps?is_published=eq.true&select=name,slug,short_desc,about,category,created_at&order=created_at.desc&limit=40`, { headers: { apikey: KEY } });
    apps = await r.json();
  } catch (e) {}
  const items = apps.map((a) => `<item>
    <title>${esc(a.name)}</title>
    <link>${origin}/${esc(a.slug)}</link>
    <guid isPermaLink="true">${origin}/${esc(a.slug)}</guid>
    <description>${esc((a.short_desc || a.about || '').slice(0, 300))}</description>
    <category>${esc(a.category)}</category>
    <pubDate>${new Date(a.created_at).toUTCString()}</pubDate>
  </item>`).join('');
  res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=3600');
  res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel>
    <title>Appshub — New apps</title><link>${origin}</link><description>Newly added apps on Appshub</description>
    ${items}
  </channel></rss>`);
};
