/* =========================================================
   APPSHUB v2 — Play-Store style, React (no build step)
   Backend: Supabase (tables ah_*, bucket "appshub")
   ========================================================= */
const { useState, useEffect, useMemo, useRef, useContext, createContext, useCallback } = React;

const SB_URL = 'https://mqassrjwcwpnruyflmpz.supabase.co';
const SB_KEY = 'sb_publishable_2_oaZBr7tu63TC1HMSahMw_PT-H3z3i';
const sb = supabase.createClient(SB_URL, SB_KEY);
const ADMIN_EMAIL = 'symoh@appshub.app';   // login username "Symoh" -> symoh@appshub.app
const RESERVED = ['admin', 'request-app', 'contact', 'apps', 'saved', 'top', 'donate', 'unsubscribe', 'terms', 'privacy', 'compare', 'assets', 'api', 'icons'];
const TABS = [
  ['overview', 'Overview', ''], ['about', 'About', '/about'], ['screenshots', 'Screenshots', '/screenshots'],
  ['reviews', 'Reviews', '/reviews'], ['questions', 'Q&A', '/questions'], ['changelog', 'What’s new', '/changelog'], ['download', 'Download', '/download'],
  ['request-update', 'Request update', '/request-update'],
];

/* ---------- helpers ---------- */
const safeUrl = (u) => { try { const x = new URL(u); return ['http:', 'https:'].includes(x.protocol) ? x.href : ''; } catch { return ''; } };
const slugify = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const fmtNum = (n) => { n = Number(n || 0); if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M'; if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K'; return String(n); };
const dlBucket = (n) => { n = Number(n || 0); if (n < 10) return String(n); const p = 10 ** Math.floor(Math.log10(n)); const l = n / p; return fmtNum((l >= 5 ? 5 : l >= 2 ? 2 : 1) * p) + '+'; };
const timeAgo = (d) => { const s = (Date.now() - new Date(d)) / 1000; if (s < 60) return 'just now'; if (s < 3600) return Math.floor(s / 60) + 'm ago'; if (s < 86400) return Math.floor(s / 3600) + 'h ago'; if (s < 2592000) return Math.floor(s / 86400) + 'd ago'; return new Date(d).toLocaleDateString(); };
const appUrl = (slug, tab = '') => `${location.origin}/${slug}${tab}`;
const lines = (t) => (t || '').split('\n').map((x) => x.trim()).filter(Boolean);
const isLive = (b) => b.active && (!b.starts_at || new Date(b.starts_at) <= Date.now()) && (!b.ends_at || new Date(b.ends_at) >= Date.now());
const countryName = (c) => { try { return new Intl.DisplayNames(['en'], { type: 'region' }).of(c); } catch { return c; } };
let _country;
const getCountry = async () => { if (_country !== undefined) return _country; try { _country = (await (await fetch('/api/geo')).json()).country || ''; } catch { _country = ''; } return _country; };
const lsGet = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

/* ---------- icons (material-style paths) ---------- */
const PATHS = {
  back: 'M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z', fwd: 'M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z',
  search: 'M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z',
  home: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z', chart: 'M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z', plus: 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z',
  mail: 'M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z',
  heart: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z',
  share: 'M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z',
  ok: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
  flag: 'M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z', dl: 'M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z',
  star: 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z',
  close: 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
  warn: 'M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z',
};
const Ico = ({ n, s = 22, ...p }) => <svg viewBox="0 0 24 24" width={s} height={s} fill="currentColor" aria-hidden="true" {...p}><path d={PATHS[n]} /></svg>;

/* ---------- toast ---------- */
const ToastCtx = createContext(() => {});
function ToastHost({ children }) {
  const [msg, setMsg] = useState(''); const t = useRef();
  const show = useCallback((m) => { setMsg(m); clearTimeout(t.current); t.current = setTimeout(() => setMsg(''), 2600); }, []);
  return (<ToastCtx.Provider value={show}>{children}{msg && <div className="toast">{msg}</div>}</ToastCtx.Provider>);
}
const useToast = () => useContext(ToastCtx);

/* ---------- router (History API, clean URLs) ---------- */
const RouterCtx = createContext({});
function Router({ children }) {
  const [loc, setLoc] = useState(location.pathname + location.search);
  useEffect(() => { const f = () => setLoc(location.pathname + location.search); addEventListener('popstate', f); return () => removeEventListener('popstate', f); }, []);
  const nav = useCallback((to) => { if (to !== location.pathname + location.search) history.pushState({}, '', to); setLoc(location.pathname + location.search); window.scrollTo(0, 0); }, []);
  return <RouterCtx.Provider value={{ loc, nav }}>{children}</RouterCtx.Provider>;
}
const useRouter = () => useContext(RouterCtx);
function Link({ to, children, className, ...p }) {
  const { nav } = useRouter();
  return <a href={to} className={className} {...p} onClick={(e) => { if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return; e.preventDefault(); nav(to); }}>{children}</a>;
}

/* ---------- site context: settings, live banners, saved apps ---------- */
const SiteCtx = createContext({ settings: {}, banners: [], saved: [], toggleSaved() {} });
const useSite = () => useContext(SiteCtx);

/* PWA install prompt */
let deferredPrompt = null;
addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredPrompt = e; dispatchEvent(new Event('ah-install')); });

/* ---------- UI pieces ---------- */
function Icon({ app, size = 64, decorative = false }) {
  const [bad, setBad] = useState(false);
  if (app.icon_url && !bad) return <img className="icon" style={{ width: size, height: size }} src={app.icon_url} alt={decorative ? '' : app.name} onError={() => setBad(true)} loading="lazy" />;
  const hue = [...app.name].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return <div className="icon fallback" role={decorative ? undefined : 'img'} aria-label={decorative ? undefined : app.name} style={{ width: size, height: size, background: `hsl(${hue} 55% 45%)`, fontSize: size * 0.45 }}>{app.name[0]?.toUpperCase()}</div>;
}
const Stars = ({ value = 0, size = 16 }) => (
  <span className="stars" style={{ fontSize: size }} title={`${value} / 5`}>
    {[1, 2, 3, 4, 5].map((i) => <span key={i} className={value >= i - 0.25 ? 'on' : value >= i - 0.75 ? 'half' : ''}>★</span>)}
  </span>
);
function StarInput({ value, onChange }) {
  return <span className="stars input">{[1, 2, 3, 4, 5].map((i) => <button type="button" key={i} className={value >= i ? 'on' : ''} onClick={() => onChange(i)} aria-label={`${i} stars`}>★</button>)}</span>;
}
const Loader = () => <div className="loader"><div className="spin" /></div>;
const Empty = ({ children }) => <div className="empty">{children}</div>;
const Verified = () => <span className="verified" title="Verified by Appshub"><Ico n="ok" s={16} /></span>;
const Rate = ({ app }) => app.review_count > 0 ? <span className="rate">{app.avg_rating} <Ico n="star" s={11} /></span> : <span className="rate muted">New</span>;

function SaveBtn({ app, label }) {
  const { saved, toggleSaved } = useSite(); const toast = useToast();
  const on = saved.includes(app.slug);
  return <button className={'icon-btn heart' + (on ? ' on' : '')} aria-label={on ? 'Remove from saved' : 'Save for later'} onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleSaved(app.slug); toast(on ? 'Removed from saved' : 'Saved for later'); }}><Ico n="heart" />{label && <span>{on ? t('Saved') : t('Save')}</span>}</button>;
}

/* carousel card (Play Store shelf item) */
function MiniCard({ app }) {
  return (<Link to={`/${app.slug}`} className="mini"><Icon app={app} size={104} /><div className="mini-name">{app.name}</div>
    <div className="mini-sub">{app.size || app.category}</div><Rate app={app} /></Link>);
}
function Shelf({ title, to, apps }) {
  if (!apps.length) return null;
  return (<section className="shelf"><div className="shelf-h"><h2>{title}</h2>{to && <Link to={to} className="round-arrow" aria-label={`See all ${title}`}><Ico n="fwd" s={20} /></Link>}</div>
    <div className="shelf-row">{apps.map((a) => <MiniCard key={a.id} app={a} />)}</div></section>);
}
function ListRow({ app, rank, action = true }) {
  return (<Link to={`/${app.slug}`} className="row-card">{rank && <span className="rank">{rank}</span>}<Icon app={app} size={56} />
    <div className="row-body"><b>{app.name} {app.is_verified && <Verified />}</b><span className="muted small">{app.category}{app.size && ` · ${app.size}`} · {dlBucket(app.downloads)} downloads</span><Rate app={app} /></div>
    {action && <SaveBtn app={app} />}</Link>);
}

/* ---------- data ---------- */
async function fetchApps() {
  const [{ data: apps, error }, { data: stats }] = await Promise.all([
    sb.from('ah_apps').select('*').eq('is_published', true).order('created_at', { ascending: false }),
    sb.from('ah_app_stats').select('*'),
  ]);
  if (error) throw error;
  const m = Object.fromEntries((stats || []).map((s) => [s.app_id, s]));
  return (apps || []).map((a) => ({ ...a, review_count: m[a.id]?.review_count || 0, avg_rating: m[a.id]?.avg_rating || 0 }));
}
function useApps() {
  const [apps, setApps] = useState(null); const [err, setErr] = useState('');
  useEffect(() => { fetchApps().then(setApps).catch((e) => { setErr(e.message); setApps([]); }); }, []);
  return { apps, err };
}

/* ---------- share ---------- */
function ShareBox({ app, tab = '' }) {
  const toast = useToast(); const url = appUrl(app.slug, tab); const text = `Download ${app.name} on Appshub`; const e = encodeURIComponent;
  const copy = async () => { try { await navigator.clipboard.writeText(url); toast('Link copied!'); } catch { prompt('Copy this link:', url); } };
  const targets = [['WhatsApp', `https://wa.me/?text=${e(text + ' ' + url)}`], ['Telegram', `https://t.me/share/url?url=${e(url)}&text=${e(text)}`], ['X', `https://twitter.com/intent/tweet?text=${e(text)}&url=${e(url)}`], ['Facebook', `https://www.facebook.com/sharer/sharer.php?u=${e(url)}`], ['Email', `mailto:?subject=${e(text)}&body=${e(url)}`]];
  return (<div className="share">
    <div className="share-link"><input readOnly value={url} onFocus={(x) => x.target.select()} /><button className="btn" onClick={copy}>Copy link</button></div>
    <div className="share-apps">{navigator.share && <button className="chip" onClick={() => navigator.share({ title: app.name, text, url }).catch(() => {})}>Share…</button>}
      {targets.map(([n, h]) => <a key={n} className="chip" href={h} target="_blank" rel="noopener noreferrer">{n}</a>)}</div></div>);
}

/* ---------- ads ---------- */
function useAdTrack(id) { useEffect(() => { if (id) sb.rpc('ah_track_ad', { p_id: id, p_kind: 'view' }).then(() => {}); }, [id]); }
const clickAd = (id) => sb.rpc('ah_track_ad', { p_id: id, p_kind: 'click' }).then(() => {});
function BannerAd({ b }) {
  useAdTrack(b.id); const href = safeUrl(b.link_url);
  const inner = <div className="banner">{b.image_url && <img src={b.image_url} alt="" />}<div><b>{b.title}</b><p>{b.message}</p></div><span className="ad-tag">Ad</span></div>;
  return href ? <a href={href} target="_blank" rel="noopener noreferrer sponsored" onClick={() => clickAd(b.id)}>{inner}</a> : inner;
}
/* =========================================================
   LAYOUT
   ========================================================= */
function Header() {
  const { settings } = useSite(); const { nav, loc } = useRouter();
  const [q, setQ] = useState(''); const [canInstall, setCanInstall] = useState(!!deferredPrompt);
  const [sugg, setSugg] = useState([]); const [open, setOpen] = useState(false); const boxRef = useRef();
  useEffect(() => { const f = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false); }; addEventListener('mousedown', f); return () => removeEventListener('mousedown', f); }, []);
  const onQ = (e) => { const v = e.target.value; setQ(v); if (v.trim().length < 2) return setSugg([]); sb.from('ah_apps').select('name,slug,icon_url,category').eq('is_published', true).ilike('name', `%${v.trim()}%`).limit(6).then(({ data }) => { setSugg(data || []); setOpen(true); }); };
  const [dark, setDark] = useState(() => lsGet('theme', 'light') === 'dark');
  useEffect(() => { document.documentElement.dataset.theme = dark ? 'dark' : 'light'; lsSet('theme', dark ? 'dark' : 'light'); }, [dark]);
  useEffect(() => { const f = () => setCanInstall(true); addEventListener('ah-install', f); return () => removeEventListener('ah-install', f); }, []);
  const install = async () => { if (!deferredPrompt) return; deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt = null; setCanInstall(false); };
  const path = loc.split('?')[0];
  return (<header className="header"><div className="wrap header-in">
    <Link to="/" className="logo"><span className="logo-mark">▶</span><span>{settings.site_name || 'Appshub'}</span></Link>
    <nav className="nav desk"><Link to="/" className={path === '/' ? 'on' : ''}>{t('Apps')}</Link><Link to="/top" className={path === '/top' ? 'on' : ''}>{t('Top charts')}</Link><Link to="/saved" className={path === '/saved' ? 'on' : ''}>{t('Saved')}</Link></nav>
    <div className="search-wrap" ref={boxRef}><form className="search" onSubmit={(e) => { e.preventDefault(); setOpen(false); nav(`/?q=${encodeURIComponent(q)}`); }}><Ico n="search" s={20} /><input value={q} onChange={onQ} onFocus={() => sugg.length && setOpen(true)} placeholder={t('Search for apps')} aria-label="Search apps" /></form>
      {open && sugg.length > 0 && <div className="suggest">{sugg.map((a) => <a key={a.slug} href={`/${a.slug}`} onClick={(e) => { e.preventDefault(); setOpen(false); setQ(''); nav(`/${a.slug}`); }}><Icon app={a} size={32} /><div><b>{a.name}</b><span className="muted small">{a.category}</span></div></a>)}</div>}</div>
    <div className="hdr-actions">{canInstall && <button className="btn sm ghost" onClick={install}>{t('Install app')}</button>}<LangSwitch /><button className="icon-btn" onClick={() => setDark(!dark)} aria-label="Toggle theme">{dark ? '☀️' : '🌙'}</button></div>
  </div></header>);
}
function BottomNav() {
  const { loc } = useRouter(); const path = loc.split('?')[0]; const { saved } = useSite();
  const items = [['/', 'home', 'Apps'], ['/top', 'chart', 'Top charts'], ['/saved', 'heart', 'Saved'], ['/request-app', 'plus', 'Request'], ['/contact', 'mail', 'Contact']];
  if (path.startsWith('/admin')) return null;
  return <nav className="bottom-nav">{items.map(([to, ic, l]) => <Link key={to} to={to} className={path === to ? 'on' : ''}><span className="pill"><Ico n={ic} />{to === '/saved' && saved.length > 0 && <i className="badge">{saved.length}</i>}</span><span>{t(l)}</span></Link>)}</nav>;
}
function Footer() {
  const { settings } = useSite();
  return (<footer className="footer"><div className="wrap"><b>{settings.site_name || 'Appshub'}</b> — {settings.tagline}
    <div className="muted small">© {new Date().getFullYear()} · <Link to="/request-app">{t('Request an app')}</Link> · <Link to="/contact">{t('Contact admin')}</Link> · <Link to="/top">{t('Top charts')}</Link>{settings.donate_url || settings.donate_text ? <> · <Link to="/donate">♥ {t(settings.donate_label || 'Support us')}</Link></> : null} · <Link to="/terms">Terms</Link> · <Link to="/privacy">Privacy</Link> · <a href="/feed.xml">RSS</a></div></div></footer>);
}
function TopBanners() {
  const { banners, settings } = useSite(); const list = banners.filter((b) => b.placement === 'banner');
  return (<>{settings.announcement && <div className="announce">{settings.announcement}</div>}
    {list.length > 0 && <div className="banners">{list.map((b) => <BannerAd key={b.id} b={b} />)}</div>}</>);
}

/* =========================================================
   PUBLIC PAGES
   ========================================================= */
function Saved() {
  const { saved } = useSite(); const { apps } = useApps();
  useEffect(() => { document.title = 'Saved apps — Appshub'; }, []);
  if (!apps) return <Loader />;
  const list = apps.filter((a) => saved.includes(a.slug));
  return (<div className="wrap page"><h1 className="sec-title big">{t('Saved for later')}</h1>{list.length ? <div className="list">{list.map((a) => <ListRow key={a.id} app={a} />)}</div> : <Empty>{t('Nothing saved yet. Tap the ♡ on any app to save it here.')}</Empty>}</div>);
}

/* ----- app page ----- */
function AppPage({ slug, tab }) {
  const [app, setApp] = useState(undefined); const [shots, setShots] = useState([]); const [reviews, setReviews] = useState([]);
  const [versions, setVersions] = useState([]); const [related, setRelated] = useState([]); const [share, setShare] = useState(false);
  const dl = useDownload(app || { slug });
  const load = useCallback(async () => {
    const { data } = await sb.from('ah_apps').select('*').eq('slug', slug).maybeSingle();
    if (!data) { setApp(null); return; }
    setApp(data); pushRecent(slug);
    if (!sessionStorage.getItem('v:' + slug)) { sessionStorage.setItem('v:' + slug, '1'); sb.rpc('ah_track_view', { p_slug: slug }).then(() => {}); }
    const [s, r, v, rel, st] = await Promise.all([
      sb.from('ah_screenshots').select('*').eq('app_id', data.id).order('sort'),
      sb.from('ah_reviews').select('*').eq('app_id', data.id).order('created_at', { ascending: false }),
      sb.from('ah_versions').select('*').eq('app_id', data.id).order('created_at', { ascending: false }),
      sb.from('ah_apps').select('*').eq('is_published', true).eq('category', data.category).neq('id', data.id).limit(12),
      sb.from('ah_app_stats').select('*'),
    ]);
    const m = Object.fromEntries((st.data || []).map((x) => [x.app_id, x]));
    setShots(s.data || []); setReviews(r.data || []); setVersions(v.data || []);
    setRelated((rel.data || []).map((a) => ({ ...a, review_count: m[a.id]?.review_count || 0, avg_rating: m[a.id]?.avg_rating || 0 })));
  }, [slug]);
  useEffect(() => { setApp(undefined); load(); }, [load]);
  useEffect(() => { if (app) document.title = `${app.name}${tab !== 'overview' ? ' · ' + (TABS.find((t) => t[0] === tab)?.[1] || '') : ''} — Appshub`; }, [app, tab]);
  if (app === undefined) return <Loader />;
  if (!app || !TABS.some((t) => t[0] === tab)) return <NotFound />;
  const avg = reviews.length ? +(reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1) : 0;
  const P = { app, shots, reviews, versions, avg, related, reload: load, dl };
  const subTitle = TABS.find((t) => t[0] === tab)?.[1];
  return (<div className="page">
    {tab !== 'overview' && <div className="subbar"><div className="wrap"><Link to={`/${app.slug}`} className="back-link"><Ico n="back" /><Icon app={app} size={32} /><b>{app.name}</b></Link><span className="sub-title">{t(subTitle)}</span></div></div>}
    <div className="wrap app-wrap">
      {tab === 'overview' && (<>
        <div className="ap-head"><Icon app={app} size={112} />
          <div className="ap-title"><h1>{app.name}</h1><div className="dev">{app.developer || 'Unknown developer'} {app.is_verified && <Verified />}</div><div className="muted small">{app.category} · {app.platform}</div></div></div>
        <div className="stats-row">
          <div><b>{reviews.length ? <>{avg} <Ico n="star" s={13} /></> : '–'}</b><span>{reviews.length ? `${fmtNum(reviews.length)} ${t('reviews')}` : t('No reviews')}</span></div>
          <div><b>{app.size || '–'}</b><span>{t('Size')}</span></div>
          <div><b>{app.content_rating || 'Everyone'}</b><span>{t('Rated for')}</span></div>
          <div><b>{dlBucket(app.downloads)}</b><span>{t('Downloads')}</span></div></div>
        <div className="ap-actions"><Link to={`/${app.slug}/download`} className="btn big grow">{t('Download')}</Link>
          <SaveBtn app={app} label /><button className="icon-btn" onClick={() => setShare(!share)}><Ico n="share" /><span>{t('Share')}</span></button></div>
        {share && <div className="card pad"><ShareBox app={app} /></div>}
        {app.broken_reports >= 3 && <div className="alert warn"><Ico n="warn" s={18} /> Some users reported problems with the download link. We’re checking it.</div>}
      </>)}
      <nav className="tabs">{TABS.map(([k, label, p]) => <Link key={k} to={`/${app.slug}${p}`} className={'tab' + (k === tab ? ' active' : '')}>{t(label)}{k === 'reviews' && reviews.length ? ` (${reviews.length})` : ''}{k === 'screenshots' && shots.length ? ` (${shots.length})` : ''}</Link>)}</nav>
      {tab === 'overview' && <Overview {...P} />}{tab === 'about' && <About {...P} />}{tab === 'screenshots' && <Screenshots {...P} />}
      {tab === 'reviews' && <Reviews {...P} />}{tab === 'questions' && <Questions {...P} />}{tab === 'changelog' && <Changelog {...P} />}{tab === 'download' && <Download {...P} />}{tab === 'request-update' && <RequestUpdate {...P} />}
      {tab !== 'overview' && <div className="center"><Link to={`/${app.slug}`} className="btn ghost back">← {t('Back to')} {app.name}</Link></div>}
    </div>
    {tab === 'overview' && <div className="wrap"><DevShelf app={app} />{related.length > 0 && <Shelf title={t('Similar apps')} apps={related} />}</div>}
    {dl.modal}
  </div>);
}
const Sec = ({ title, to, children }) => (<section className="app-sec"><div className="shelf-h">{to ? <Link to={to} className="sec-link"><h2>{title}</h2></Link> : <h2>{title}</h2>}{to && <Link to={to} className="round-arrow"><Ico n="fwd" s={20} /></Link>}</div>{children}</section>);
const InfoTable = ({ app }) => (<table className="info"><tbody>{[['Version', app.version], ['Updated on', new Date(app.updated_at).toLocaleDateString()], ['Size', app.size], ['Requires', app.platform], ['Category', app.category], ['Content rating', app.content_rating], ['Offered by', app.developer], ['Released on', new Date(app.created_at).toLocaleDateString()], ['Downloads', dlBucket(app.downloads)]].filter((r) => r[1]).map(([k, v]) => <tr key={k}><td>{k}</td><td>{v}</td></tr>)}</tbody></table>);

function Overview({ app, shots, reviews, avg }) {
  return (<>
    {shots.length > 0 && <Sec title={t('Screenshots')} to={`/${app.slug}/screenshots`}><div className="shots-row">{shots.slice(0, 8).map((s) => <img key={s.id} src={s.url} alt="" loading="lazy" />)}</div></Sec>}
    <Sec title={t('About this app')} to={`/${app.slug}/about`}><p className="pre clamp3">{app.short_desc || app.about || 'No description yet.'}</p></Sec>
    <Sec title={t('What’s new')} to={`/${app.slug}/changelog`}><p className="muted small">Version {app.version} · updated {new Date(app.updated_at).toLocaleDateString()}</p><p className="pre clamp3">{app.whats_new || 'Bug fixes and improvements.'}</p></Sec>
    <Sec title={t('Ratings and reviews')} to={`/${app.slug}/reviews`}>{reviews.length ? <><div className="big-rate"><b>{avg}</b><div><Stars value={avg} size={18} /><div className="muted small">{reviews.length} reviews</div></div></div>{reviews.slice(0, 3).map((r) => <ReviewItem key={r.id} r={r} />)}</> : <p className="muted">No reviews yet — be the first.</p>}
      <Link to={`/${app.slug}/reviews`} className="btn ghost sm">{t('Write a review')}</Link></Sec>
    <Sec title={t('App info')}><InfoTable app={app} /></Sec>
    <div className="row"><Link to={`/${app.slug}/request-update`} className="link"><Ico n="flag" s={16} /> {t('Request an update')}</Link> <span className="dot">•</span> <Link to={`/compare?a=${app.slug}`} className="link"><Ico n="chart" s={16} /> Compare with another app</Link></div>
  </>);
}
function DevShelf({ app }) {
  const [rows, setRows] = useState([]);
  useEffect(() => { if (!app.developer?.trim()) return; sb.from('ah_apps').select('*').eq('is_published', true).eq('developer', app.developer).neq('id', app.id).limit(12).then(({ data }) => setRows((data || []).map((a) => ({ ...a, review_count: 0, avg_rating: 0 })))); }, [app.id]);
  if (!rows.length) return null;
  return <Shelf title={`More from ${app.developer}`} apps={rows} />;
}
function About({ app }) {
  const feats = app.features || [];
  return (<div className="narrow-col"><div className="card pad"><h2>{t('About')} {app.name}</h2><Md text={app.about || app.short_desc || 'No description yet.'} /></div>
    {feats.length > 0 && <div className="card pad"><h2>Features</h2><ul className="feat">{feats.map((f, i) => <li key={i}>{f}</li>)}</ul></div>}
    <div className="card pad"><h2>{t('App info')}</h2><InfoTable app={app} /></div>
    <div className="card pad"><h3>Share this app</h3><ShareBox app={app} tab="/about" /></div></div>);
}
function Screenshots({ app, shots }) {
  const [open, setOpen] = useState(-1);
  useEffect(() => { const k = (e) => { if (e.key === 'Escape') setOpen(-1); if (e.key === 'ArrowRight') setOpen((i) => (i < 0 ? i : (i + 1) % shots.length)); if (e.key === 'ArrowLeft') setOpen((i) => (i < 0 ? i : (i - 1 + shots.length) % shots.length)); }; addEventListener('keydown', k); return () => removeEventListener('keydown', k); }, [shots.length]);
  return (<div className="card pad"><h2>Screenshots</h2>
    {shots.length ? <div className="shots-grid">{shots.map((s, i) => <img key={s.id} src={s.url} alt={`${app.name} screenshot ${i + 1}`} loading="lazy" onClick={() => setOpen(i)} />)}</div> : <Empty>No screenshots yet.</Empty>}
    {open >= 0 && <div className="lightbox" onClick={() => setOpen(-1)}><button className="lb-nav l" onClick={(e) => { e.stopPropagation(); setOpen((open - 1 + shots.length) % shots.length); }}>‹</button><img src={shots[open].url} alt="" onClick={(e) => e.stopPropagation()} /><button className="lb-nav r" onClick={(e) => { e.stopPropagation(); setOpen((open + 1) % shots.length); }}>›</button><button className="lb-x" onClick={() => setOpen(-1)}><Ico n="close" /></button></div>}
  </div>);
}
function Reviews({ app, reviews, avg, reload }) {
  const toast = useToast(); const { settings } = useSite(); const key = 'reviewed:' + app.slug;
  const [done, setDone] = useState(() => !!localStorage.getItem(key)); const [name, setName] = useState(localStorage.getItem('reviewer') || '');
  const [rating, setRating] = useState(0); const [comment, setComment] = useState(''); const [hp, setHp] = useState(''); const [busy, setBusy] = useState(false);
  const dist = [5, 4, 3, 2, 1].map((n) => [n, reviews.filter((r) => r.rating === n).length]);
  const submit = async (e) => {
    e.preventDefault(); if (hp) return; if (!rating) return toast('Please pick a star rating');
    setBusy(true);
    const { error } = await sb.from('ah_reviews').insert({ app_id: app.id, name: name.trim().slice(0, 60), rating, comment: comment.trim().slice(0, 1000) });
    setBusy(false); if (error) return toast('Could not post review: ' + error.message);
    try { localStorage.setItem(key, '1'); localStorage.setItem('reviewer', name.trim()); } catch {}
    setDone(true); setComment(''); toast(settings.review_mode === 'manual' ? 'Thanks! Your review will appear after approval.' : 'Thanks for your review!'); reload();
  };
  return (<div className="cols"><div className="card pad"><h2>{t('Ratings and reviews')}</h2>
    <div className="big-rate"><b>{avg || '–'}</b><div><Stars value={avg} size={18} /><div className="muted small">{reviews.length} reviews</div></div>
      <div className="dist">{dist.map(([n, c]) => <div key={n} className="bar-row"><span>{n}</span><div className="bar"><i style={{ width: reviews.length ? (c / reviews.length) * 100 + '%' : 0 }} /></div></div>)}</div></div>
    {reviews.length ? reviews.map((r) => <ReviewItem key={r.id} r={r} />) : <Empty>No reviews yet — be the first!</Empty>}</div>
    <aside><div className="card pad"><h3>{t('Rate this app')}</h3>
      {done ? <p className="muted">You’ve already reviewed this app on this device. Thank you!</p> :
        <form onSubmit={submit} className="form">
          <StarInput value={rating} onChange={setRating} />
          <label>{t('Your name')}<input required maxLength={60} value={name} onChange={(e) => setName(e.target.value)} /></label>
          <label>{t('Review')}<textarea rows={4} maxLength={1000} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Describe your experience" /></label>
          <input className="hp" tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} />
          <button className="btn" disabled={busy}>{busy ? 'Posting…' : t('Post')}</button></form>}</div></aside></div>);
}
function Changelog({ app, versions, dl }) {
  return (<div className="narrow-col"><div className="card pad"><div className="row between"><div><h2>{t('Version')} {app.version} <span className="chip sm">{t('Latest')}</span></h2><div className="muted small">{new Date(app.updated_at).toLocaleDateString()}{app.size && ` · ${app.size}`}</div></div>
    <button className="btn sm" onClick={() => dl.start(app.download_url, app.version)}>{t('Download')}</button></div><Md text={app.whats_new || 'Bug fixes and improvements.'} />
    {versions[0] && <ChangeDiff from={versions[0].notes} to={app.whats_new} />}</div>
    <h3 className="sec-title">{t('Older versions')}</h3>
    {versions.length ? versions.map((v) => (<div key={v.id} className="card pad"><div className="row between"><div><h3>Version {v.version}</h3><div className="muted small">{new Date(v.created_at).toLocaleDateString()}{v.size && ` · ${v.size}`}</div></div>
      <button className="btn sm ghost" onClick={() => dl.start(v.download_url, v.version)}>{t('Download')}</button></div>{v.notes && <Md text={v.notes} />}</div>)) : <Empty>No older versions available.</Empty>}</div>);
}
/* ----- forms ----- */
function useSubmit(kind) {
  const toast = useToast(); const [busy, setBusy] = useState(false); const [sent, setSent] = useState(false);
  const send = async (row) => { setBusy(true); const { error } = await sb.from('ah_requests').insert({ kind, ...row }); setBusy(false); if (error) return toast('Could not send: ' + error.message); setSent(true); toast('Sent! Thank you.'); };
  return { busy, sent, send };
}
function RequestUpdate({ app }) {
  const { busy, sent, send } = useSubmit('update'); const [f, setF] = useState({ name: '', email: '', message: '', hp: '' }); const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  if (sent) return <div className="card pad center"><h2>Update request sent</h2><p className="muted">The admin will look into updating {app.name}.</p></div>;
  return (<div className="card pad narrow"><h2>Request an update for {app.name}</h2><p className="muted">Outdated version or a new feature? Tell us.</p>
    <form className="form" onSubmit={(e) => { e.preventDefault(); if (f.hp) return; send({ app_slug: app.slug, app_name: app.name, name: f.name.trim(), email: f.email.trim(), message: f.message.trim() }); }}>
      <label>Your name<input value={f.name} onChange={set('name')} maxLength={100} /></label><label>Email (optional)<input type="email" value={f.email} onChange={set('email')} maxLength={200} /></label>
      <label>What should be updated?<textarea required rows={5} maxLength={2000} value={f.message} onChange={set('message')} /></label>
      <input className="hp" tabIndex={-1} autoComplete="off" value={f.hp} onChange={set('hp')} /><button className="btn" disabled={busy}>{busy ? 'Sending…' : 'Send request'}</button></form></div>);
}
function RequestApp() {
  useEffect(() => { document.title = 'Request an app — Appshub'; }, []);
  const { busy, sent, send } = useSubmit('app'); const [f, setF] = useState({ app: '', link: '', name: '', email: '', message: '', hp: '' }); const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  if (sent) return <div className="wrap page"><div className="card pad center"><h2>Request received</h2><p className="muted">We’ll try to add it soon.</p><Link to="/" className="btn">Back home</Link></div></div>;
  return (<div className="wrap page"><div className="card pad narrow"><h2>{t('Request an app')}</h2><p className="muted">Can’t find what you’re looking for? Tell us which app you want.</p>
    <form className="form" onSubmit={(e) => { e.preventDefault(); if (f.hp) return; send({ app_name: f.app.trim(), name: f.name.trim(), email: f.email.trim(), message: `${f.link ? 'Link: ' + f.link + '\n' : ''}${f.message}`.trim() || f.app.trim() }); }}>
      <label>App name<input required value={f.app} onChange={set('app')} maxLength={100} /></label><label>Link (optional)<input value={f.link} onChange={set('link')} maxLength={300} placeholder="https://…" /></label>
      <label>Your name<input value={f.name} onChange={set('name')} maxLength={100} /></label><label>Email (optional)<input type="email" value={f.email} onChange={set('email')} maxLength={200} /></label>
      <label>Anything else?<textarea rows={4} value={f.message} onChange={set('message')} maxLength={1500} /></label>
      <input className="hp" tabIndex={-1} autoComplete="off" value={f.hp} onChange={set('hp')} /><button className="btn" disabled={busy}>{busy ? 'Sending…' : 'Submit request'}</button></form></div></div>);
}
function Contact() {
  useEffect(() => { document.title = 'Contact admin — Appshub'; }, []);
  const { busy, sent, send } = useSubmit('contact'); const [f, setF] = useState({ name: '', email: '', message: '', hp: '' }); const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  if (sent) return <div className="wrap page"><div className="card pad center"><h2>Message sent</h2><p className="muted">The admin will get back to you if needed.</p><Link to="/" className="btn">Back home</Link></div></div>;
  return (<div className="wrap page"><div className="card pad narrow"><h2>{t('Contact admin')}</h2>
    <form className="form" onSubmit={(e) => { e.preventDefault(); if (f.hp) return; send({ name: f.name.trim(), email: f.email.trim(), message: f.message.trim() }); }}>
      <label>Your name<input required value={f.name} onChange={set('name')} maxLength={100} /></label><label>Email<input required type="email" value={f.email} onChange={set('email')} maxLength={200} /></label>
      <label>Message<textarea required rows={6} value={f.message} onChange={set('message')} maxLength={2000} /></label>
      <input className="hp" tabIndex={-1} autoComplete="off" value={f.hp} onChange={set('hp')} /><button className="btn" disabled={busy}>{busy ? 'Sending…' : t('Send message')}</button></form></div></div>);
}
const NotFound = () => <div className="wrap page"><div className="card pad center"><h1>404</h1><p className="muted">That page or app doesn’t exist.</p><Link to="/" className="btn">Go home</Link></div></div>;

