/* =========================================================
   FEATURES (public): markdown, captcha ad modal, home shelves,
   trending, recently viewed, Q&A, checksum/VirusTotal, donate,
   email + push subscriptions, language switch, analytics
   ========================================================= */

/* ---------- recently viewed ---------- */
const getRecent = () => lsGet('ah_recent', []);
const pushRecent = (slug) => lsSet('ah_recent', [slug, ...getRecent().filter((x) => x !== slug)].slice(0, 15));

/* ---------- tiny safe Markdown (bold, italic, headings, lists, links) ---------- */
function inlineMd(text) {
  const out = []; let rest = text, i = 0;
  const re = /(\*\*[^*]+\*\*|\*[^*\n]+\*|\[[^\]]+\]\([^)\s]+\)|`[^`]+`)/;
  while (rest) {
    const m = re.exec(rest); if (!m) { out.push(rest); break; }
    if (m.index) out.push(rest.slice(0, m.index));
    const tok = m[0];
    if (tok.startsWith('**')) out.push(<strong key={i++}>{tok.slice(2, -2)}</strong>);
    else if (tok.startsWith('`')) out.push(<code key={i++}>{tok.slice(1, -1)}</code>);
    else if (tok.startsWith('*')) out.push(<em key={i++}>{tok.slice(1, -1)}</em>);
    else { const mm = /\[([^\]]+)\]\(([^)\s]+)\)/.exec(tok); const u = safeUrl(mm[2]); out.push(u ? <a key={i++} href={u} target="_blank" rel="noopener noreferrer nofollow">{mm[1]}</a> : mm[1]); }
    rest = rest.slice(m.index + tok.length);
  }
  return out;
}
function Md({ text }) {
  const out = []; let list = null; let para = []; let k = 0;
  const flushPara = () => { if (para.length) { out.push(<p key={k++}>{para.map((l, i) => <React.Fragment key={i}>{i > 0 && <br />}{inlineMd(l)}</React.Fragment>)}</p>); para = []; } };
  const flushList = () => { if (list) { const items = list.items.map((x, i) => <li key={i}>{inlineMd(x)}</li>); out.push(list.type === 'ol' ? <ol key={k++}>{items}</ol> : <ul key={k++}>{items}</ul>); list = null; } };
  String(text || '').replace(/\r/g, '').split('\n').forEach((line) => {
    let m;
    if ((m = /^(#{1,3})\s+(.*)$/.exec(line))) { flushPara(); flushList(); out.push(m[1].length === 3 ? <h4 key={k++}>{inlineMd(m[2])}</h4> : <h3 key={k++}>{inlineMd(m[2])}</h3>); }
    else if ((m = /^\s*[-*•]\s+(.*)$/.exec(line))) { flushPara(); if (!list || list.type !== 'ul') { flushList(); list = { type: 'ul', items: [] }; } list.items.push(m[1]); }
    else if ((m = /^\s*\d+[.)]\s+(.*)$/.exec(line))) { flushPara(); if (!list || list.type !== 'ol') { flushList(); list = { type: 'ol', items: [] }; } list.items.push(m[1]); }
    else if (!line.trim()) { flushPara(); flushList(); }
    else { flushList(); para.push(line); }
  });
  flushPara(); flushList();
  return <div className="md">{out}</div>;
}

/* ---------- language switcher ---------- */
function LangSwitch() {
  return <select className="lang" aria-label={t('Language')} value={LANG} onChange={(e) => { setLang(e.target.value); dispatchEvent(new Event('ah-lang')); }}>{Object.entries(LANGS).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}</select>;
}

/* ---------- ad modal (+ optional human check) & download flow ---------- */
function AdModal({ banner, seconds, message, captcha, onContinue, onClose }) {
  const [ok, setOk] = useState(!captcha); const [left, setLeft] = useState(seconds); const [ans, setAns] = useState(''); const [bad, setBad] = useState(false);
  const q = useMemo(() => ({ a: 2 + Math.floor(Math.random() * 8), b: 2 + Math.floor(Math.random() * 8) }), []);
  useAdTrack(banner?.id);
  useEffect(() => { if (!ok || left <= 0) return; const tm = setTimeout(() => setLeft(left - 1), 1000); return () => clearTimeout(tm); }, [left, ok]);
  const href = safeUrl(banner?.link_url);
  return (<div className="modal-back" role="dialog" aria-modal="true"><div className="modal">
    <button className="icon-btn x" onClick={onClose} aria-label="Close"><Ico n="close" /></button>
    {!ok ? (
      <form className="form" onSubmit={(e) => { e.preventDefault(); if (Number(ans) === q.a + q.b) setOk(true); else { setBad(true); setAns(''); } }}>
        <p className="ad-note">{t('Verify you are human')}</p><h2>{q.a} + {q.b} = ?</h2>
        <input autoFocus inputMode="numeric" value={ans} onChange={(e) => setAns(e.target.value)} />{bad && <div className="alert">{t('Wrong answer, try again')}</div>}
        <button className="btn big">{t('Check')}</button></form>
    ) : (<>
      {banner && <p className="ad-note">{message}</p>}
      {banner && (() => { const inner = (<div className="ad-box">{banner.image_url && <img src={banner.image_url} alt="" />}<h3>{banner.title}</h3><p>{banner.message}</p><span className="ad-tag">Ad</span></div>); return href ? <a href={href} target="_blank" rel="noopener noreferrer sponsored" onClick={() => clickAd(banner.id)}>{inner}</a> : inner; })()}
      <button className="btn big" disabled={left > 0} onClick={onContinue}>{left > 0 ? `${t('Your download will be ready in')} ${left}s…` : t('Continue to download')}</button></>)}
  </div></div>);
}
function useDownload(app) {
  const { banners, settings } = useSite(); const toast = useToast(); const [pending, setPending] = useState(null);
  const popups = banners.filter((b) => b.placement === 'popup'); const captcha = settings.download_captcha === 'on';
  const go = (url, version) => {
    window.open(safeUrl(url), '_blank', 'noopener'); setPending(null); toast('Download started');
    getCountry().then((c) => sb.rpc('ah_track_download', { p_slug: app.slug, p_country: c, p_version: version || app.version })).then(() => {});
  };
  const start = (url, version) => {
    if (!safeUrl(url)) return toast('Download link not available yet');
    if (popups.length || captcha) setPending({ url, version, banner: popups.length ? popups[Math.floor(Math.random() * popups.length)] : null }); else go(url, version);
  };
  const modal = pending && <AdModal banner={pending.banner} seconds={pending.banner ? Number(settings.popup_seconds) || 5 : 0} captcha={captcha} message={settings.popup_message || 'These ads help us pay for this service.'} onContinue={() => go(pending.url, pending.version)} onClose={() => setPending(null)} />;
  return { start, modal };
}

/* ---------- push helpers ---------- */
const pushOK = () => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
const b64u = (b64) => { const s = (b64 + '='.repeat((4 - (b64.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/'); const raw = atob(s); return Uint8Array.from([...raw].map((c) => c.charCodeAt(0))); };
async function enablePush(vapid, slugs, cats) {
  const reg = await navigator.serviceWorker.ready;
  if ((await Notification.requestPermission()) !== 'granted') throw new Error('Notifications are blocked in your browser settings');
  let sub = await reg.pushManager.getSubscription();
  if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64u(vapid) });
  const j = sub.toJSON();
  const { error } = await sb.rpc('ah_push_save', { p_endpoint: j.endpoint, p_p256dh: j.keys.p256dh, p_auth: j.keys.auth, p_slugs: slugs, p_categories: cats });
  if (error) throw error; lsSet('ah_push', { on: true, cats });
}
async function disablePush() {
  try { const reg = await navigator.serviceWorker.ready; const sub = await reg.pushManager.getSubscription(); if (sub) { await sb.rpc('ah_push_remove', { p_endpoint: sub.endpoint }); await sub.unsubscribe(); } } catch {}
  lsSet('ah_push', { on: false, cats: [] });
}
async function syncPush(slugs) {
  const st = lsGet('ah_push', null); if (!st?.on || !pushOK()) return;
  try { const reg = await navigator.serviceWorker.ready; const sub = await reg.pushManager.getSubscription(); if (!sub) return; const j = sub.toJSON(); await sb.rpc('ah_push_save', { p_endpoint: j.endpoint, p_p256dh: j.keys.p256dh, p_auth: j.keys.auth, p_slugs: slugs, p_categories: st.cats || [] }); } catch {}
}

/* ---------- subscribe card (email + push, per category) ---------- */
function SubscribeCard({ cats }) {
  const toast = useToast(); const { saved, settings } = useSite();
  const [email, setEmail] = useState(''); const [sel, setSel] = useState(lsGet('ah_push', {}).cats || []); const [busy, setBusy] = useState(false);
  const [pushOn, setPushOn] = useState(!!lsGet('ah_push', {}).on); const [subbed, setSubbed] = useState(!!lsGet('ah_sub', false));
  const toggle = (c) => setSel(sel.includes(c) ? sel.filter((x) => x !== c) : [...sel, c]);
  const subscribe = async (e) => {
    e.preventDefault(); setBusy(true);
    const { error } = await sb.rpc('ah_subscribe', { p_email: email.trim(), p_categories: sel }); setBusy(false);
    if (error) return toast('Please enter a valid email'); lsSet('ah_sub', true); setSubbed(true); toast('Subscribed! 🎉');
  };
  const push = async () => {
    try { if (pushOn) { await disablePush(); setPushOn(false); toast('Notifications turned off'); } else { await enablePush(settings.vapid_public, saved, sel); setPushOn(true); toast('Notifications enabled 🔔'); } }
    catch (e) { toast(e.message || 'Could not enable notifications'); }
  };
  return (<div className="card pad sub-card"><h3>🔔 {t('Get notified about new apps')}</h3>
    {cats.length > 1 && <div className="chips inline">{cats.map((c) => <button type="button" key={c} className={'chip' + (sel.includes(c) ? ' active' : '')} onClick={() => toggle(c)}>{c}</button>)}</div>}
    <form className="row sub-form" onSubmit={subscribe}>{subbed ? <span className="muted">✓ {email || 'Subscribed'}</span> : <><input className="grow" type="email" required placeholder={t('Your email')} value={email} onChange={(e) => setEmail(e.target.value)} /><button className="btn" disabled={busy}>{t('Subscribe')}</button></>}
      {pushOK() && settings.vapid_public && <button type="button" className="btn ghost" onClick={push}>{pushOn ? '🔕 Off' : t('Enable notifications')}</button>}</form>
    {cats.length > 1 && <p className="muted small">Pick categories above (leave empty for everything).</p>}</div>);
}
function UnsubscribePage() {
  const { loc } = useRouter(); const tk = new URLSearchParams(loc.split('?')[1] || '').get('t'); const [state, setState] = useState('busy');
  useEffect(() => { if (!tk) return setState('bad'); sb.rpc('ah_unsubscribe', { p_token: tk }).then(({ data, error }) => setState(!error && data ? 'ok' : 'bad')); }, [tk]);
  return <div className="wrap page"><div className="card pad narrow center">{state === 'busy' ? <Loader /> : state === 'ok' ? <><h2>Unsubscribed</h2><p className="muted">You won’t get any more emails from us.</p></> : <><h2>Link expired</h2><p className="muted">This unsubscribe link isn’t valid (maybe you already unsubscribed).</p></>}<Link to="/" className="btn">{t('Apps')}</Link></div></div>;
}

/* ---------- donate ---------- */
function DonateCard() {
  const { settings } = useSite(); const url = safeUrl(settings.donate_url); const label = t(settings.donate_label || 'Support us');
  if (!url && !settings.donate_text) return null;
  return (<div className="card pad donate"><h3>♥ {label}</h3>{settings.donate_text && <p className="pre muted">{settings.donate_text}</p>}{url && <a className="btn" href={url} target="_blank" rel="noopener noreferrer">{label}</a>}</div>);
}
const DonatePage = () => <div className="wrap page"><div className="narrow"><DonateCard /></div></div>;

/* ---------- legal pages ---------- */
function LegalPage({ kind }) {
  const { settings } = useSite();
  const title = kind === 'terms' ? 'Terms of Service' : 'Privacy Policy';
  const body = settings[kind + '_content'];
  useEffect(() => { document.title = `${title} — Appshub`; }, []);
  return (<div className="wrap page"><div className="narrow-col"><div className="card pad"><h1>{title}</h1>
    {body ? <Md text={body} /> : <p className="muted">This page hasn’t been written yet.</p>}</div></div></div>);
}

/* ---------- simple word-level diff (for "what changed" between versions) ---------- */
function wordDiff(oldText, newText) {
  const a = String(oldText || '').split(/(\s+)/), b = String(newText || '').split(/(\s+)/);
  const m = a.length, n2 = b.length; const dp = Array.from({ length: m + 1 }, () => new Array(n2 + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) for (let j = n2 - 1; j >= 0; j--) dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const out = []; let i = 0, j = 0;
  while (i < m && j < n2) { if (a[i] === b[j]) { out.push([0, b[j]]); i++; j++; } else if (dp[i + 1][j] >= dp[i][j + 1]) { out.push([-1, a[i]]); i++; } else { out.push([1, b[j]]); j++; } }
  while (i < m) out.push([-1, a[i++]]); while (j < n2) out.push([1, b[j++]]);
  return out;
}
function ChangeDiff({ from, to }) {
  if (!from || !from.trim() || from.trim() === to.trim()) return null;
  const parts = wordDiff(from, to);
  return (<details className="diff"><summary>See what changed</summary><p className="pre">{parts.map(([t2, w], i) => t2 === 0 ? w : t2 === 1 ? <ins key={i}>{w}</ins> : <del key={i}>{w}</del>)}</p></details>);
}

/* ---------- home ---------- */
function Home() {
  const { loc } = useRouter(); const { settings } = useSite();
  const q = (new URLSearchParams(loc.split('?')[1] || '').get('q') || '').trim();
  const { apps, err } = useApps(); const [cat, setCat] = useState('All'); const [trend, setTrend] = useState([]); const [cols, setCols] = useState([]);
  useEffect(() => { sb.rpc('ah_trending', { p_days: 7 }).then(({ data }) => setTrend(data || [])); sb.from('ah_collections').select('*').eq('active', true).order('sort').then(({ data }) => setCols(data || [])); }, []);
  useEffect(() => { document.title = `${settings.site_name || 'Appshub'} — Download apps`; }, [settings]);
  if (!apps) return <Loader />;
  const byId = Object.fromEntries(apps.map((a) => [a.id, a])); const bySlug = Object.fromEntries(apps.map((a) => [a.slug, a]));
  const cats = ['All', ...new Set(apps.map((a) => a.category).filter(Boolean))];
  const featured = apps.filter((a) => a.is_featured);
  const top = [...apps].sort((a, b) => b.downloads - a.downloads).filter((a) => a.downloads > 0).slice(0, 12);
  const rated = [...apps].filter((a) => a.review_count > 0).sort((a, b) => b.avg_rating - a.avg_rating).slice(0, 12);
  const fresh = [...apps].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)).slice(0, 12);
  const trending = trend.map((x) => byId[x.app_id]).filter(Boolean).slice(0, 12);
  const recent = getRecent().map((s) => bySlug[s]).filter(Boolean).slice(0, 12);
  const results = q ? apps.filter((a) => (a.name + a.short_desc + a.category + a.developer + (a.seo_keywords || '')).toLowerCase().includes(q.toLowerCase())) : cat !== 'All' ? apps.filter((a) => a.category === cat) : null;
  return (<div className="page">
    <div className="chips-bar"><div className="wrap chips">{cats.map((c) => <button key={c} className={'chip' + (c === cat && !q ? ' active' : '')} onClick={() => { setCat(c); if (q) { history.pushState({}, '', '/'); dispatchEvent(new PopStateEvent('popstate')); } }}>{c === 'All' ? t('All') : c}</button>)}</div></div>
    <div className="wrap">
      <TopBanners />
      {err && <div className="alert">Could not load apps: {err}</div>}
      {results ? (<section><h2 className="sec-title">{q ? `${t('Results for')} “${q}”` : cat}</h2>
        {results.length ? <div className="list">{results.map((a) => <ListRow key={a.id} app={a} />)}</div> : <Empty>{t('No apps found.')} <Link to="/request-app" className="link">{t('Request an app')} →</Link></Empty>}</section>) : (<>
        {!apps.length && <Empty>No apps published yet.</Empty>}
        <Shelf title={t('Recently viewed')} apps={recent} />
        <Shelf title={t('Featured')} apps={featured} />
        {cols.map((c) => <Shelf key={c.id} title={c.title} apps={(c.app_ids || []).map((id) => byId[id]).filter(Boolean)} />)}
        <Shelf title={t('Trending this week')} to="/top?c=trending" apps={trending} />
        <Shelf title={t('Most downloaded')} to="/top" apps={top} />
        <Shelf title={t('Top rated')} to="/top?c=rated" apps={rated} />
        <Shelf title={t('New & updated')} to="/top?c=new" apps={fresh} />
        {cats.slice(1).map((c) => <Shelf key={c} title={c} apps={apps.filter((a) => a.category === c).slice(0, 12)} />)}
        <SubscribeCard cats={cats.slice(1)} />
        <DonateCard />
        <div className="cta card"><h3>{t('Can’t find an app?')}</h3><p className="muted">{t('Tell us what you need and we’ll try to add it.')}</p><Link to="/request-app" className="btn">{t('Request an app')}</Link></div></>)}
    </div></div>);
}
function TopCharts() {
  const { loc, nav } = useRouter(); const c = new URLSearchParams(loc.split('?')[1] || '').get('c') || 'downloads';
  const { apps } = useApps(); const [trend, setTrend] = useState([]);
  useEffect(() => { document.title = 'Top charts — Appshub'; sb.rpc('ah_trending', { p_days: 7 }).then(({ data }) => setTrend(data || [])); }, []);
  if (!apps) return <Loader />;
  const byId = Object.fromEntries(apps.map((a) => [a.id, a]));
  const sorted = c === 'trending' ? trend.map((x) => byId[x.app_id]).filter(Boolean)
    : c === 'rated' ? [...apps].filter((a) => a.review_count).sort((a, b) => b.avg_rating - a.avg_rating || b.review_count - a.review_count)
    : c === 'new' ? [...apps].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) : [...apps].sort((a, b) => b.downloads - a.downloads);
  return (<div className="wrap page"><h1 className="sec-title big">{t('Top charts')}</h1>
    <div className="chips">{[['downloads', 'Most downloaded'], ['trending', 'Trending this week'], ['rated', 'Top rated'], ['new', 'New & updated']].map(([k, l]) => <button key={k} className={'chip' + (k === c ? ' active' : '')} onClick={() => nav('/top?c=' + k)}>{t(l)}</button>)}</div>
    {sorted.length ? <div className="list">{sorted.map((a, i) => <ListRow key={a.id} app={a} rank={i + 1} />)}</div> : <Empty>Nothing here yet.</Empty>}</div>);
}

/* ---------- reviews (report) + Q&A ---------- */
function ReportBtn({ id, rpc, prefix }) {
  const toast = useToast(); const [done, setDone] = useState(() => !!localStorage.getItem(prefix + id));
  if (done) return <span className="muted small">Reported</span>;
  return <button className="link-btn small" onClick={async () => { await sb.rpc(rpc, { p_id: id }); try { localStorage.setItem(prefix + id, '1'); } catch {} setDone(true); toast('Thanks — we’ll review it'); }}><Ico n="flag" s={13} /> {t('Report')}</button>;
}
function ReviewItem({ r }) {
  return (<div className="review"><div className="rev-h"><span className="avatar">{r.name[0]?.toUpperCase()}</span><b>{r.name}</b></div>
    <div className="rev-m"><Stars value={r.rating} size={13} /> <span className="muted small">{timeAgo(r.created_at)}</span> <ReportBtn id={r.id} rpc="ah_report_review" prefix="rr:" /></div>
    {r.comment && <p className="pre">{r.comment}</p>}
    {r.admin_reply && <div className="reply"><b>{t('Developer response')}</b> <span className="muted small">{r.replied_at && timeAgo(r.replied_at)}</span><p className="pre">{r.admin_reply}</p></div>}</div>);
}
function Questions({ app }) {
  const toast = useToast(); const { settings } = useSite();
  const [rows, setRows] = useState(null); const [name, setName] = useState(localStorage.getItem('reviewer') || ''); const [msg, setMsg] = useState(''); const [hp, setHp] = useState(''); const [busy, setBusy] = useState(false); const [replyTo, setReplyTo] = useState(null); const [rmsg, setRmsg] = useState('');
  const load = () => sb.from('ah_comments').select('*').eq('app_id', app.id).order('created_at', { ascending: true }).then(({ data }) => setRows(data || []));
  useEffect(() => { load(); }, [app.id]);
  const post = async (message, parent) => {
    if (hp || !message.trim() || !name.trim()) return toast(name.trim() ? 'Write something first' : 'Please enter your name');
    setBusy(true); const { error } = await sb.from('ah_comments').insert({ app_id: app.id, parent_id: parent || null, name: name.trim().slice(0, 60), message: message.trim().slice(0, 1000) }); setBusy(false);
    if (error) return toast(error.message); try { localStorage.setItem('reviewer', name.trim()); } catch {}
    setMsg(''); setRmsg(''); setReplyTo(null); toast(settings.review_mode === 'manual' ? 'Thanks! It will appear after approval.' : 'Posted'); load();
  };
  if (!rows) return <Loader />;
  const tops = rows.filter((r) => !r.parent_id).reverse(); const kids = (id) => rows.filter((r) => r.parent_id === id);
  const item = (c, child) => (<div key={c.id} className={'qa' + (child ? ' child' : '')}><div className="rev-h"><span className={'avatar' + (c.is_admin ? ' dev' : '')}>{c.name[0]?.toUpperCase()}</span><b>{c.name}</b>{c.is_admin && <span className="chip sm">Developer</span>}<span className="muted small">{timeAgo(c.created_at)}</span></div>
    <p className="pre">{c.message}</p><div className="row small">{!child && <button className="link-btn small" onClick={() => setReplyTo(replyTo === c.id ? null : c.id)}>{t('Reply')}</button>}{!c.is_admin && <ReportBtn id={c.id} rpc="ah_report_comment" prefix="rc:" />}</div>
    {replyTo === c.id && <div className="form"><textarea rows={2} maxLength={1000} value={rmsg} onChange={(e) => setRmsg(e.target.value)} /><div className="row"><button className="btn sm" disabled={busy} onClick={() => post(rmsg, c.id)}>{t('Send')}</button></div></div>}</div>);
  return (<div className="cols"><div className="card pad"><h2>{t('Questions & answers')}</h2>
    {tops.length ? tops.map((c) => <div key={c.id} className="thread">{item(c)}{kids(c.id).map((k) => item(k, true))}</div>) : <Empty>No questions yet — ask the first one!</Empty>}</div>
    <aside><div className="card pad"><h3>{t('Ask a question')}</h3><div className="form">
      <label>{t('Your name')}<input maxLength={60} value={name} onChange={(e) => setName(e.target.value)} /></label>
      <label>{t('Your question')}<textarea rows={4} maxLength={1000} value={msg} onChange={(e) => setMsg(e.target.value)} /></label>
      <input className="hp" tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} />
      <button className="btn" disabled={busy} onClick={() => post(msg)}>{t('Send')}</button></div></div></aside></div>);
}

/* ---------- download page (checksum, VirusTotal, donate) ---------- */
function Download({ app, dl }) {
  const toast = useToast(); const [reported, setReported] = useState(() => !!localStorage.getItem('rep:' + app.slug));
  const links = [{ label: t('Download') + ' ' + app.name, url: app.download_url }, ...(Array.isArray(app.extra_links) ? app.extra_links : [])].filter((l) => safeUrl(l.url));
  const vt = app.sha256 ? `https://www.virustotal.com/gui/file/${app.sha256}` : safeUrl(app.download_url) ? `https://www.virustotal.com/gui/search/${encodeURIComponent(app.download_url)}` : '';
  const report = async () => {
    const { error } = await sb.from('ah_requests').insert({ kind: 'report', app_slug: app.slug, app_name: app.name, message: `Broken download link reported for ${app.name} v${app.version}` });
    if (error) return toast('Could not send report'); try { localStorage.setItem('rep:' + app.slug, '1'); } catch {} setReported(true); toast('Thanks — we’ll check the link');
  };
  return (<div className="cols"><div><div className="card pad center"><Icon app={app} size={96} /><h2>{app.name} {app.is_verified && <Verified />}</h2>
    <p className="muted">{t('Version')} {app.version}{app.size && ` · ${app.size}`} · {app.platform}</p>
    {app.broken_reports >= 3 && <div className="alert warn"><Ico n="warn" s={18} /> Some users reported this link as broken.</div>}
    {links.length ? <div className="dl-list">{links.map((l, i) => <button key={i} className={'btn big' + (i ? ' ghost' : '')} onClick={() => dl.start(l.url, app.version)}>{l.label}</button>)}</div> : <Empty>Download link is not available yet. Please check back soon.</Empty>}
    {(app.sha256 || vt) && <div className="checksum">{app.sha256 && <><b>{t('Checksum (SHA-256)')}</b><code>{app.sha256}</code><button className="link-btn small" onClick={() => { navigator.clipboard.writeText(app.sha256); toast('Copied'); }}>{t('Copy')}</button></>}{vt && <a className="btn sm ghost" href={vt} target="_blank" rel="noopener noreferrer">🛡 {t('Scan on VirusTotal')}</a>}</div>}
    <p className="muted small">Older versions are on the <Link to={`/${app.slug}/changelog`} className="link">{t('What’s new')}</Link> page.</p>
    <p className="small">{reported ? <span className="muted">Report sent. Thank you!</span> : <button className="link-btn" onClick={report}><Ico n="flag" s={14} /> {t('Report broken link')}</button>}</p></div>
    <DonateCard /></div>
    <aside><div className="card pad"><h3>Share this download</h3><ShareBox app={app} tab="/download" /></div></aside></div>);
}

/* ---------- analytics (Google Analytics or Plausible) ---------- */
function useAnalytics(settings, loc, consent) {
  const p = settings.analytics_provider, id = (settings.analytics_id || '').trim();
  useEffect(() => {
    if (window.__ahAnalytics || !id || !consent) return;
    if (p === 'ga' && /^G-[A-Z0-9]+$/.test(id)) { window.__ahAnalytics = true; window.dataLayer = window.dataLayer || []; window.gtag = function () { dataLayer.push(arguments); }; gtag('js', new Date()); gtag('config', id, { send_page_view: false }); const s = document.createElement('script'); s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + id; document.head.appendChild(s); }
    if (p === 'plausible' && /^[a-z0-9.-]+$/i.test(id)) { window.__ahAnalytics = true; const s = document.createElement('script'); s.defer = true; s.dataset.domain = id; s.src = 'https://plausible.io/js/script.js'; document.head.appendChild(s); }
  }, [p, id]);
  useEffect(() => { if (window.gtag && p === 'ga' && consent) gtag('event', 'page_view', { page_path: loc, page_title: document.title }); }, [loc, p, consent]);
}

/* ---------- cookie consent banner ---------- */
function CookieBanner({ show, onDecide }) {
  if (!show) return null;
  return (<div className="cookie-bar" role="dialog" aria-label="Cookie notice">
    <p>This site uses analytics cookies to understand how visitors use it. <Link to="/privacy">Learn more</Link></p>
    <div className="row"><button className="btn sm ghost" onClick={() => onDecide(false)}>Decline</button><button className="btn sm" onClick={() => onDecide(true)}>Accept</button></div>
  </div>);
}

/* =========================================================
   ROOT
   ========================================================= */
function App() {
  const { loc } = useRouter();
  const [site, setSite] = useState({ settings: {}, banners: [] }); const [saved, setSaved] = useState(() => lsGet('ah_saved', []));
  const [consent, setConsent] = useState(() => lsGet('ah_cookie_consent', null));
  useEffect(() => { Promise.all([sb.from('ah_settings').select('*'), sb.from('ah_banners').select('*').eq('active', true)]).then(([s, b]) => setSite({ settings: Object.fromEntries((s.data || []).map((r) => [r.key, r.value])), banners: (b.data || []).filter(isLive) })); }, []);
  useEffect(() => { syncPush(saved); }, [saved]);
  useAnalytics(site.settings, loc, consent === true);
  const decide = (v) => { setConsent(v); lsSet('ah_cookie_consent', v); };
  const needsConsent = site.settings.cookie_notice !== 'off' && site.settings.analytics_provider && site.settings.analytics_provider !== 'none' && consent === null;
  const toggleSaved = useCallback((slug) => setSaved((cur) => { const n = cur.includes(slug) ? cur.filter((x) => x !== slug) : [...cur, slug]; lsSet('ah_saved', n); return n; }), []);
  const parts = loc.split('?')[0].split('/').filter(Boolean).map(decodeURIComponent);
  let page;
  if (!parts.length) page = <Home />;
  else if (parts[0] === 'admin') page = <Admin />;
  else if (parts[0] === 'top') page = <TopCharts />;
  else if (parts[0] === 'saved') page = <Saved />;
  else if (parts[0] === 'donate') page = <DonatePage />;
  else if (parts[0] === 'terms') page = <LegalPage kind="terms" />;
  else if (parts[0] === 'privacy') page = <LegalPage kind="privacy" />;
  else if (parts[0] === 'compare') page = <ComparePage />;
  else if (parts[0] === 'developer') page = <DeveloperPortal />;
  else if (parts[0] === 'unsubscribe') page = <UnsubscribePage />;
  else if (parts[0] === 'request-app') page = <RequestApp />;
  else if (parts[0] === 'contact') page = <Contact />;
  else if (parts.length > 2 || RESERVED.includes(parts[0])) page = <NotFound />;
  else page = <AppPage slug={parts[0]} tab={parts[1] || 'overview'} key={parts[0]} />;
  return (<SiteCtx.Provider value={{ ...site, saved, toggleSaved }}><a href="#main" className="skip-link">Skip to content</a><Header /><main id="main" tabIndex={-1}>{page}</main><Footer /><BottomNav /><CookieBanner show={needsConsent} onDecide={decide} /></SiteCtx.Provider>);
}

/* ---------- compare two apps ---------- */
function ComparePage() {
  const { loc, nav } = useRouter(); const qs = new URLSearchParams(loc.split('?')[1] || '');
  const { apps } = useApps(); const [a, setA] = useState(qs.get('a') || ''); const [b, setB] = useState(qs.get('b') || '');
  useEffect(() => { document.title = 'Compare apps — Appshub'; }, []);
  if (!apps) return <Loader />;
  const bySlug = Object.fromEntries(apps.map((x) => [x.slug, x])); const appA = bySlug[a], appB = bySlug[b];
  const go = (na, nb) => nav(`/compare${na || nb ? `?a=${na}&b=${nb}` : ''}`);
  const Row = (label, get) => <tr><td>{label}</td><td>{appA ? get(appA) : '–'}</td><td>{appB ? get(appB) : '–'}</td></tr>;
  return (<div className="wrap page"><h1 className="sec-title big">Compare apps</h1>
    <div className="form two"><label>App A<select value={a} onChange={(e) => { setA(e.target.value); go(e.target.value, b); }}><option value="">— choose —</option>{apps.map((x) => <option key={x.slug} value={x.slug}>{x.name}</option>)}</select></label>
      <label>App B<select value={b} onChange={(e) => { setB(e.target.value); go(a, e.target.value); }}><option value="">— choose —</option>{apps.map((x) => <option key={x.slug} value={x.slug}>{x.name}</option>)}</select></label></div>
    {(appA || appB) && <div className="table-wrap" style={{ marginTop: 18 }}><table className="table compare"><thead><tr><th></th><th>{appA ? <Link to={`/${appA.slug}`}><Icon app={appA} size={40} /> {appA.name}</Link> : '—'}</th><th>{appB ? <Link to={`/${appB.slug}`}><Icon app={appB} size={40} /> {appB.name}</Link> : '—'}</th></tr></thead><tbody>
      {Row('Rating', (x) => x.review_count ? <>{x.avg_rating} <Ico n="star" s={12} /> ({x.review_count})</> : '–')}
      {Row('Downloads', (x) => dlBucket(x.downloads))}
      {Row('Size', (x) => x.size || '–')}{Row('Version', (x) => x.version)}{Row('Category', (x) => x.category)}{Row('Developer', (x) => x.developer || '–')}{Row('Rated for', (x) => x.content_rating)}
    </tbody></table></div>}</div>);
}
