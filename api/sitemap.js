const SB = 'https://mqassrjwcwpnruyflmpz.supabase.co';
const KEY = 'sb_publishable_2_oaZBr7tu63TC1HMSahMw_PT-H3z3i';
module.exports = async (req, res) => {
  const origin = `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers['x-forwarded-host'] || req.headers.host}`;
  let apps = [];
  try { apps = await (await fetch(`${SB}/rest/v1/ah_apps?is_published=eq.true&select=slug,updated_at`, { headers: { apikey: KEY } })).json(); } catch (e) {}
  const urls = [`<url><loc>${origin}/</loc></url>`, `<url><loc>${origin}/top</loc></url>`, ...apps.map((a) => `<url><loc>${origin}/${a.slug}</loc><lastmod>${new Date(a.updated_at).toISOString()}</lastmod></url>`)];
  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 'public, s-maxage=3600');
  res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}</urlset>`);
};
