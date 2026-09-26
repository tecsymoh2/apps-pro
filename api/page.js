// Serves the SPA with app-specific <title>/Open Graph tags so WhatsApp, Telegram,
// Facebook, X and Google show a proper preview when an app link is shared.
const SB = 'https://mqassrjwcwpnruyflmpz.supabase.co';
const KEY = 'sb_publishable_2_oaZBr7tu63TC1HMSahMw_PT-H3z3i';
const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const LABELS = { about: 'About', screenshots: 'Screenshots', reviews: 'Reviews', questions: 'Q&A', download: 'Download', changelog: 'What’s new', 'request-update': 'Request update' };

module.exports = async (req, res) => {
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const origin = `${proto}://${host}`;
  const slug = String(req.query.slug || '').toLowerCase();
  const RESERVED = ['admin', 'contact', 'request-app', 'saved', 'top', 'donate', 'unsubscribe', 'api', 'icons'];
  let html = '';
  try { html = await (await fetch(`${origin}/index.html`)).text(); } catch (e) {}
  if (!html) { res.status(500).send('Appshub'); return; }
  if (/^[a-z0-9-]+$/.test(slug) && !RESERVED.includes(slug)) {
    try {
      const r = await fetch(`${SB}/rest/v1/ah_apps?slug=eq.${slug}&is_published=eq.true&select=id,name,short_desc,about,icon_url,category,developer,version,seo_keywords,seo_description&limit=1`, { headers: { apikey: KEY } });
      const app = (await r.json())[0];
      let stats = null;
      if (app) { try { const sr = await fetch(`${SB}/rest/v1/ah_app_stats?app_id=eq.${app.id}&select=review_count,avg_rating&limit=1`, { headers: { apikey: KEY } }); stats = (await sr.json())[0]; } catch (e) {} }
      if (app) {
        const path = String(req.url || '').split('?')[0];
        const tab = (req.query.tab && LABELS[req.query.tab]) ? ` · ${LABELS[req.query.tab]}` : '';
        const title = `${app.name}${tab} — Appshub`;
        const desc = (app.seo_description || app.short_desc || app.about || `Download ${app.name} on Appshub`).replace(/[*#_`\[\]]/g, '').slice(0, 200);
        const url = `${origin}/${slug}${req.query.tab ? '/' + req.query.tab : ''}`;
        const img = app.icon_url || `${origin}/icons/icon-512.png`;
        const tags = `
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}" />
  ${app.seo_keywords ? `<meta name="keywords" content="${esc(app.seo_keywords)}" />` : ''}
  <link rel="canonical" href="${esc(url)}" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Appshub" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(desc)}" />
  <meta property="og:image" content="${esc(img)}" />
  <meta property="og:url" content="${esc(url)}" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="${esc(title)}" />
  <meta name="twitter:description" content="${esc(desc)}" />
  <meta name="twitter:image" content="${esc(img)}" />
  <script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: app.name, description: desc, applicationCategory: app.category, softwareVersion: app.version, image: img, url,
          ...(stats && stats.review_count > 0 ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: stats.avg_rating, reviewCount: stats.review_count } } : {}) }).replace(/</g, '\\u003c')}</script>`;
        html = html.replace(/<title>[\s\S]*?<\/title>/, '').replace(/<meta name="description"[^>]*>/, '').replace('</head>', tags + '\n</head>');
      }
    } catch (e) {}
  }
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=600');
  res.status(200).send(html);
};
