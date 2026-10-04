/* =========================================================
   ADMIN (roles: owner = everything, editor = content only)
   ========================================================= */
const SAFE = (n) => n.toLowerCase().replace(/[^a-z0-9._-]+/g, '-');
const MAX_UPLOAD = 100 * 1024 * 1024; // 100 MB
const IMG_TYPES = ['icons', 'screenshots', 'banners'];
async function optimizeImage(file, maxDim) {
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml' || file.type === 'image/gif') return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale), h = Math.round(bitmap.height * scale);
    const canvas = document.createElement('canvas'); canvas.width = w; canvas.height = h;
    canvas.getContext('2d').drawImage(bitmap, 0, 0, w, h);
    const blob = await new Promise((res) => canvas.toBlob(res, 'image/webp', 0.85));
    if (!blob || blob.size >= file.size) return file; // keep original if webp didn't help (e.g. unsupported)
    return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.webp', { type: 'image/webp' });
  } catch { return file; } // unsupported browser — fall back to the original file
}
async function uploadFile(file, folder) {
  if (IMG_TYPES.includes(folder)) file = await optimizeImage(file, folder === 'icons' ? 512 : 1600);
  if (file.size > MAX_UPLOAD) throw new Error(`File is ${(file.size / 1024 / 1024).toFixed(1)} MB — the limit is 100 MB.`);
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 6)}-${SAFE(file.name)}`;
  const { error } = await sb.storage.from('appshub').upload(path, file, { cacheControl: '31536000', upsert: false });
  if (error) throw error; return sb.storage.from('appshub').getPublicUrl(path).data.publicUrl;
}
async function uploadToCatbox(file, userhash) {
  const form = new FormData();
  form.append('reqtype', 'fileupload');
  if (userhash) form.append('userhash', userhash);
  form.append('fileToUpload', file);
  let res;
  try { res = await fetch('https://catbox.moe/user/api.php', { method: 'POST', body: form }); }
  catch { throw new Error('Catbox could not be reached from the browser (it may be blocking cross-site uploads). Switch back to Supabase in Settings.'); }
  const text = (await res.text()).trim();
  if (!res.ok || !/^https?:\/\//.test(text)) throw new Error('Catbox rejected the upload: ' + text.slice(0, 200));
  return text;
}
// This branch — and the Catbox userhash it can send — is only ever reached from this
// admin.jsx module's OWN upload call sites (AppForm, AdminBanners), never from the shared
// uploadFile() above that /developer accounts also call, so a developer's browser never
// sees this admin's Catbox secret even if they share a device with an admin session.
let ADMIN_UPLOAD_CFG = null;
async function loadAdminUploadCfg() {
  const [{ data: s }, { data: sec }] = await Promise.all([
    sb.from('ah_settings').select('value').eq('key', 'file_host').maybeSingle(),
    sb.from('ah_secrets').select('value').eq('key', 'catbox_userhash').maybeSingle(),
  ]);
  ADMIN_UPLOAD_CFG = { host: s?.value === 'catbox' ? 'catbox' : 'supabase', catboxHash: sec?.value || '' };
}
sb.auth.onAuthStateChange((event) => { if (event === 'SIGNED_OUT') ADMIN_UPLOAD_CFG = null; });
async function adminUploadFile(file, folder) {
  if (IMG_TYPES.includes(folder)) file = await optimizeImage(file, folder === 'icons' ? 512 : 1600);
  const limit = ADMIN_UPLOAD_CFG?.host === 'catbox' ? 200 * 1024 * 1024 : MAX_UPLOAD;
  if (file.size > limit) throw new Error(`File is ${(file.size / 1024 / 1024).toFixed(1)} MB — the limit is ${Math.round(limit / 1024 / 1024)} MB.`);
  if (ADMIN_UPLOAD_CFG?.host === 'catbox') return uploadToCatbox(file, ADMIN_UPLOAD_CFG.catboxHash);
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 6)}-${SAFE(file.name)}`;
  const { error } = await sb.storage.from('appshub').upload(path, file, { cacheControl: '31536000', upsert: false });
  if (error) throw error; return sb.storage.from('appshub').getPublicUrl(path).data.publicUrl;
}
async function sha256File(file) { const h = await crypto.subtle.digest('SHA-256', await file.arrayBuffer()); return [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, '0')).join(''); }
const toCSV = (rows) => { if (!rows.length) return ''; const cols = [...new Set(rows.flatMap((r) => Object.keys(r)))]; const esc = (v) => { if (v == null) return ''; v = typeof v === 'object' ? JSON.stringify(v) : String(v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }; return [cols.join(','), ...rows.map((r) => cols.map((c) => esc(r[c])).join(','))].join('\n'); };
const saveFile = (name, text, type = 'text/csv') => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); };
async function fetchAll(table) { let all = [], from = 0; for (;;) { const { data, error } = await sb.from(table).select('*').range(from, from + 999); if (error) throw error; all = all.concat(data); if (data.length < 1000) break; from += 1000; } return all; }
const toLocalInput = (d) => (d ? new Date(new Date(d).getTime() - new Date(d).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '');

/* ---------- simple rich-text (Markdown) editor ---------- */
function MdEditor({ value, onChange, rows = 6 }) {
  const ref = useRef(); const [preview, setPreview] = useState(false); value = value || '';
  const wrap = (a, b = a, ph = 'text') => { const el = ref.current, s = el.selectionStart, e = el.selectionEnd, sel = value.slice(s, e) || ph; onChange(value.slice(0, s) + a + sel + b + value.slice(e)); setTimeout(() => { el.focus(); el.setSelectionRange(s + a.length, s + a.length + sel.length); }, 0); };
  const prefix = (p) => { const el = ref.current, s = el.selectionStart, e = el.selectionEnd; const ls = value.lastIndexOf('\n', s - 1) + 1; const block = value.slice(ls, e || s).split('\n').map((l, i) => (typeof p === 'function' ? p(i) : p) + l).join('\n'); onChange(value.slice(0, ls) + block + value.slice(e || s)); setTimeout(() => el.focus(), 0); };
  return (<div className="mdeditor"><div className="md-tools">
    <button type="button" onClick={() => wrap('**')}><b>B</b></button><button type="button" onClick={() => wrap('*')}><i>I</i></button>
    <button type="button" onClick={() => prefix('## ')}>H</button><button type="button" onClick={() => prefix('- ')}>• List</button><button type="button" onClick={() => prefix((i) => `${i + 1}. `)}>1. List</button>
    <button type="button" onClick={() => { const u = prompt('Link address (https://…)'); if (u) wrap('[', `](${u})`, 'link text'); }}>🔗 Link</button>
    <button type="button" className={preview ? 'on' : ''} onClick={() => setPreview(!preview)}>{preview ? 'Edit' : 'Preview'}</button></div>
    {preview ? <div className="md-preview card"><Md text={value} /></div> : <textarea ref={ref} rows={rows} value={value} onChange={(e) => onChange(e.target.value)} />}</div>);
}

/* ---------- auth / shell ---------- */
function Admin() {
  const [session, setSession] = useState(undefined); const [role, setRole] = useState(undefined); const [aal, setAal] = useState(undefined);
  useEffect(() => { sb.auth.getSession().then(({ data }) => setSession(data.session)); const { data } = sb.auth.onAuthStateChange((_e, s) => setSession(s)); return () => data.subscription.unsubscribe(); }, []);
  useEffect(() => { document.title = 'Admin — Appshub'; }, []);
  useEffect(() => { if (session === undefined) return; if (!session) { setRole(null); setAal(null); return; } setRole(undefined); setAal(undefined);
    sb.auth.mfa.getAuthenticatorAssuranceLevel().then(({ data }) => setAal(data)); sb.rpc('ah_my_role').then(({ data }) => setRole(data || null)); }, [session]);
  if (session === undefined || (session && (role === undefined || aal === undefined))) return <Loader />;
  if (session && aal && aal.nextLevel === 'aal2' && aal.currentLevel !== 'aal2') return <MfaChallenge onDone={() => sb.auth.mfa.getAuthenticatorAssuranceLevel().then(({ data }) => setAal(data))} />;
  return role ? <AdminPanel role={role} session={session} /> : <AdminLogin denied={!!session} />;
}
function AdminLogin({ denied }) {
  const [u, setU] = useState(''); const [p, setP] = useState(''); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setErr('');
    const { data: lock } = await sb.rpc('ah_login_precheck', { p_username: u.trim() });
    if (lock) { setBusy(false); return setErr(`Too many attempts. Try again after ${new Date(lock).toLocaleTimeString()}.`); }
    const { error } = await sb.auth.signInWithPassword({ email: u.trim().toLowerCase() + '@appshub.app', password: p });
    setBusy(false);
    if (error) { sb.rpc('ah_login_fail', { p_username: u.trim() }).then(() => {}); setErr('Wrong username or password.'); }
    else sb.rpc('ah_login_success', { p_username: u.trim() }).then(() => {});
  };
  return (<div className="wrap page"><div className="card pad narrow"><h2>Admin login</h2>{denied && <div className="alert">This account is not an admin. <button className="link-btn" onClick={() => sb.auth.signOut()}>Log out</button></div>}
    <form className="form" onSubmit={submit}><label>Username<input required autoComplete="username" value={u} onChange={(e) => setU(e.target.value)} /></label>
      <label>Password<input required type="password" autoComplete="current-password" value={p} onChange={(e) => setP(e.target.value)} /></label>{err && <div className="alert">{err}</div>}
      <button className="btn" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button></form></div></div>);
}
function MfaChallenge({ onDone }) {
  const [code, setCode] = useState(''); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setErr('');
    const { data: factors } = await sb.auth.mfa.listFactors(); const factor = factors?.totp?.[0];
    if (!factor) { setBusy(false); return setErr('No authenticator found.'); }
    const { data: ch, error: e1 } = await sb.auth.mfa.challenge({ factorId: factor.id });
    if (e1) { setBusy(false); return setErr(e1.message); }
    const { error: e2 } = await sb.auth.mfa.verify({ factorId: factor.id, challengeId: ch.id, code: code.trim() });
    setBusy(false); if (e2) return setErr('Wrong code, try again.'); onDone();
  };
  return (<div className="wrap page"><div className="card pad narrow"><h2>🔐 Two-factor code</h2><p className="muted">Enter the 6-digit code from your authenticator app.</p>
    <form className="form" onSubmit={submit}><input required autoFocus inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value)} />{err && <div className="alert">{err}</div>}
      <button className="btn" disabled={busy}>{busy ? 'Checking…' : 'Verify'}</button><button type="button" className="btn ghost" onClick={() => sb.auth.signOut()}>Log out</button></form></div></div>);
}
const ALL_TABS = [['dash', '📊 Dashboard', 0], ['apps', '📦 Apps', 0], ['developers', '👩‍💻 Developers', 0], ['collections', '🗂 Collections', 0], ['categories', '🏷 Categories', 0], ['reviews', '⭐ Reviews', 0], ['comments', '💬 Q&A', 0], ['requests', '📨 Requests', 0], ['banners', '📢 Ads & banners', 1], ['notify', '📣 Announce', 1], ['team', '👥 Team', 1], ['blocklist', '🚫 Blocklist', 1], ['activity', '📜 Activity log', 1], ['settings', '⚙️ Settings', 1], ['backup', '💾 Backup', 1], ['account', '🔑 My account', 0]];
function AdminPanel({ role, session }) {
  const [tab, setTab] = useState('dash'); const owner = role === 'owner';
  const tabs = ALL_TABS.filter((t) => owner || !t[2]);
  useEffect(() => { loadAdminUploadCfg(); }, []);
  return (<div className="wrap page"><div className="row between"><h1>Admin <span className="chip sm">{role}</span></h1><button className="btn ghost" onClick={() => sb.auth.signOut()}>Log out</button></div>
    <nav className="tabs">{tabs.map(([k, l]) => <button key={k} className={'tab' + (k === tab ? ' active' : '')} onClick={() => setTab(k)}>{l}</button>)}</nav>
    {tab === 'dash' && <AdminDash />}{tab === 'apps' && <AdminApps owner={owner} />}{tab === 'collections' && <AdminCollections />}{tab === 'reviews' && <AdminReviews />}{tab === 'comments' && <AdminComments />}
    {tab === 'requests' && <AdminRequests />}{tab === 'banners' && owner && <AdminBanners />}{tab === 'notify' && owner && <AdminNotify />}{tab === 'team' && owner && <AdminTeam session={session} />}
    {tab === 'developers' && <AdminDevelopers />}
    {tab === 'categories' && <AdminCategories />}
    {tab === 'blocklist' && owner && <AdminBlocklist />}{tab === 'activity' && owner && <AdminActivity />}
    {tab === 'settings' && owner && <AdminSettings />}{tab === 'backup' && owner && <AdminBackup />}{tab === 'account' && <AdminAccount session={session} role={role} />}</div>);
}

/* ---------- dashboard ---------- */
function AdminDash() {
  const [d, setD] = useState(null);
  useEffect(() => { (async () => {
    const since = new Date(Date.now() - 29 * 864e5); since.setHours(0, 0, 0, 0);
    const [apps, rev, req, dl, recent, ads, pend] = await Promise.all([
      sb.from('ah_apps').select('id,name,slug,downloads,views,broken_reports').order('downloads', { ascending: false }),
      sb.from('ah_reviews').select('id', { count: 'exact', head: true }),
      sb.from('ah_requests').select('id', { count: 'exact', head: true }).eq('status', 'new'),
      sb.from('ah_downloads').select('created_at,country,app_id').gte('created_at', since.toISOString()).limit(20000),
      sb.from('ah_reviews').select('*, ah_apps(name)').order('created_at', { ascending: false }).limit(5),
      sb.from('ah_banners').select('*').order('impressions', { ascending: false }),
      Promise.all([sb.from('ah_reviews').select('id', { count: 'exact', head: true }).eq('approved', false), sb.from('ah_comments').select('id', { count: 'exact', head: true }).eq('approved', false)]),
    ]);
    const days = Array.from({ length: 14 }, (_, i) => { const t = new Date(Date.now() - (13 - i) * 864e5); return { k: t.toDateString(), label: t.getDate(), n: 0 }; });
    const countries = {};
    (dl.data || []).forEach((r) => { const x = days.find((d) => d.k === new Date(r.created_at).toDateString()); if (x) x.n++; const c = r.country || '??'; countries[c] = (countries[c] || 0) + 1; });
    setD({ apps: apps.data || [], reviews: rev.count || 0, newReq: req.count || 0, days, recent: recent.data || [], ads: ads.data || [], countries: Object.entries(countries).sort((a, b) => b[1] - a[1]).slice(0, 8), month: (dl.data || []).length, pending: (pend[0].count || 0) + (pend[1].count || 0) });
  })(); }, []);
  if (!d) return <Loader />;
  const total = d.apps.reduce((a, b) => a + Number(b.downloads), 0); const views = d.apps.reduce((a, b) => a + Number(b.views), 0);
  const maxD = Math.max(1, ...d.days.map((x) => x.n)); const maxA = Math.max(1, ...d.apps.map((a) => Number(a.downloads))); const maxC = Math.max(1, ...d.countries.map((c) => c[1]));
  const flagged = d.apps.filter((a) => a.broken_reports > 0);
  return (<>
    <div className="stats">{[['Apps', d.apps.length], ['Total downloads', fmtNum(total)], ['Last 30 days', fmtNum(d.month)], ['App views', fmtNum(views)], ['Reviews', d.reviews], ['New requests', d.newReq], ['Awaiting approval', d.pending]].map(([k, v]) => <div key={k} className="card pad stat"><b>{v}</b><span className="muted">{k}</span></div>)}</div>
    {flagged.length > 0 && <div className="alert warn"><b>⚠ Broken link reports:</b> {flagged.map((a) => `${a.name} (${a.broken_reports})`).join(', ')} — fix the link in Apps, then press “Clear reports”.</div>}
    <div className="cols"><div className="card pad"><h3>🔥 Most downloaded apps</h3>{d.apps.length ? d.apps.slice(0, 10).map((a, i) => <div key={a.id} className="bar-row wide"><span>{i + 1}. <Link to={`/${a.slug}`}>{a.name}</Link></span><div className="bar"><i style={{ width: (Number(a.downloads) / maxA) * 100 + '%' }} /></div><b>{fmtNum(a.downloads)}</b></div>) : <Empty>No apps yet.</Empty>}
      <h3 style={{ marginTop: 18 }}>🌍 Top countries (30 days)</h3>{d.countries.length ? d.countries.map(([c, n]) => <div key={c} className="bar-row wide"><span>{c === '??' ? 'Unknown' : countryName(c)}</span><div className="bar"><i style={{ width: (n / maxC) * 100 + '%' }} /></div><b>{n}</b></div>) : <p className="muted small">No data yet. (Country detection works on Vercel.)</p>}</div>
      <div className="card pad"><h3>Downloads — last 14 days</h3><div className="chart">{d.days.map((x) => <div key={x.k} className="col" title={`${x.n} downloads`}><i style={{ height: (x.n / maxD) * 100 + '%' }} /><small>{x.label}</small></div>)}</div>
        <h3>📢 Ad performance</h3>{d.ads.length ? <div className="table-wrap"><table className="table"><thead><tr><th>Ad</th><th>Views</th><th>Clicks</th><th>CTR</th></tr></thead><tbody>{d.ads.map((b) => <tr key={b.id}><td>{b.title}</td><td>{fmtNum(b.impressions)}</td><td>{fmtNum(b.clicks)}</td><td>{b.impressions ? ((b.clicks / b.impressions) * 100).toFixed(1) + '%' : '–'}</td></tr>)}</tbody></table></div> : <p className="muted small">No ads yet.</p>}
        <h3 style={{ marginTop: 18 }}>Latest reviews</h3>{d.recent.length ? d.recent.map((r) => <div key={r.id} className="review"><b>{r.name}</b> on {r.ah_apps?.name} <Stars value={r.rating} size={12} /><p className="pre small">{r.comment}</p></div>) : <p className="muted">None yet.</p>}</div></div></>);
}

/* ---------- apps ---------- */
const blankApp = { name: '', slug: '', icon_url: '', short_desc: '', about: '', features: '', category: 'General', developer: '', version: '1.0', size: '', platform: 'Android', content_rating: 'Everyone', download_url: '', sha256: '', extra_links: '', whats_new: '', seo_keywords: '', seo_description: '', is_featured: false, is_published: true, is_verified: false, publish_at: '' };
function AdminApps({ owner }) {
  const toast = useToast(); const [apps, setApps] = useState(null); const [edit, setEdit] = useState(null); const [q, setQ] = useState(''); const [sel, setSel] = useState([]);
  const load = () => sb.from('ah_apps').select('*').order('created_at', { ascending: false }).then(({ data }) => setApps(data || []));
  useEffect(() => { load(); }, []);
  const del = async (ids) => { if (!confirm(`Delete ${ids.length} app(s)? Reviews and screenshots go too.`)) return; const { error } = await sb.from('ah_apps').delete().in('id', ids); if (error) toast(error.message); else { sb.rpc('ah_log', { p_action: 'delete_app', p_detail: ids.length + ' app(s)' }).then(() => {}); toast('Deleted'); setSel([]); load(); } };
  const bulk = async (patch) => { const { error } = await sb.from('ah_apps').update(patch).in('id', sel); if (error) toast(error.message); else { toast('Updated ' + sel.length + ' app(s)'); setSel([]); load(); } };
  if (edit) return <AppForm app={edit === 'new' ? null : edit.dup ? edit.app : edit} dup={edit.dup} onClose={() => { setEdit(null); load(); }} />;
  if (!apps) return <Loader />;
  const list = apps.filter((a) => a.name.toLowerCase().includes(q.toLowerCase())); const allOn = list.length > 0 && list.every((a) => sel.includes(a.id));
  return (<div className="card pad"><div className="row between"><h2>Apps ({apps.length})</h2><div className="row"><input placeholder="Filter…" value={q} onChange={(e) => setQ(e.target.value)} /><button className="btn" onClick={() => setEdit('new')}>+ Add app</button></div></div>
    {sel.length > 0 && <div className="bulk row"><b>{sel.length} selected</b><button className="btn sm" onClick={() => bulk({ is_published: true })}>Publish</button><button className="btn sm ghost" onClick={() => bulk({ is_published: false })}>Hide</button><button className="btn sm ghost" onClick={() => bulk({ is_featured: true })}>Feature</button><button className="btn sm ghost" onClick={() => bulk({ is_verified: true })}>Verify</button>{owner && <button className="btn sm danger" onClick={() => del(sel)}>Delete</button>}</div>}
    {!apps.length && !q && <div className="wizard card pad"><h3>👋 Welcome to Appshub</h3><p className="muted">You have no apps yet. Add your first one to get your store started — you can add screenshots, set the download link, and publish it whenever you’re ready.</p><button className="btn big" onClick={() => setEdit('new')}>+ Add your first app</button></div>}
    {list.length ? <div className="table-wrap"><table className="table"><thead><tr><th><input type="checkbox" checked={allOn} onChange={() => setSel(allOn ? [] : list.map((a) => a.id))} /></th><th>App</th><th>Ver.</th><th>Downloads</th><th>Views</th><th>Status</th><th></th></tr></thead><tbody>
      {list.map((a) => <tr key={a.id}><td><input type="checkbox" checked={sel.includes(a.id)} onChange={() => setSel(sel.includes(a.id) ? sel.filter((x) => x !== a.id) : [...sel, a.id])} /></td>
        <td><div className="row"><Icon app={a} size={36} /><div><b>{a.name}</b> {a.is_verified && <Verified />}<div className="muted small">/{a.slug}</div></div></div></td><td>{a.version}</td><td>{fmtNum(a.downloads)}</td><td>{fmtNum(a.views)}</td>
        <td>{a.is_published ? 'Live' : 'Hidden'}{a.is_featured && ' ⭐'}{a.broken_reports > 0 && <span className="chip sm warnchip">⚠ {a.broken_reports}</span>}</td>
        <td className="actions">{a.broken_reports > 0 && <button className="btn sm ghost" onClick={async () => { await sb.from('ah_apps').update({ broken_reports: 0 }).eq('id', a.id); load(); }}>Clear reports</button>}<button className="btn sm ghost" onClick={() => { navigator.clipboard.writeText(appUrl(a.slug)); toast('Share link copied'); }}>Copy link</button><button className="btn sm ghost" onClick={() => setEdit({ dup: true, app: a })}>Duplicate</button><button className="btn sm" onClick={() => setEdit(a)}>Edit</button>{owner && <button className="btn sm danger" onClick={() => del([a.id])}>Delete</button>}</td></tr>)}
    </tbody></table></div> : <Empty>No apps yet. Click “Add app” to publish your first one.</Empty>}</div>);
}

function AppForm({ app, dup, onClose }) {
  const toast = useToast(); const [saved, setSaved] = useState(dup ? null : app);
  const dKey = 'ah_admin_draft:' + (dup ? 'dup-' + app.id : (app ? app.id : 'new'));
  const [f, setF] = useState(() => {
    const base = (() => { if (!app) return blankApp; const b = { ...blankApp, ...app, features: (app.features || []).join('\n'), extra_links: (app.extra_links || []).map((l) => `${l.label} | ${l.url}`).join('\n'), publish_at: app.publish_at ? new Date(new Date(app.publish_at).getTime() - new Date(app.publish_at).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '' }; return dup ? { ...b, name: app.name + ' (copy)', slug: app.slug + '-copy', is_published: false, is_featured: false, is_verified: false, publish_at: '' } : b; })();
    const draft = lsGet(dKey, null);
    return draft || base;
  });
  const [restored] = useState(() => !!lsGet(dKey, null));
  useEffect(() => { if (restored) toast('Restored your unsaved draft — a reload (e.g. while picking a file) no longer loses your work'); }, []);
  useEffect(() => { lsSet(dKey, f); }, [f]);
  const [shots, setShots] = useState([]); const [versions, setVersions] = useState([]); const [busy, setBusy] = useState(''); const [slugTouched, setSlugTouched] = useState(!!app);
  const [nv, setNv] = useState({ version: '', size: '', download_url: '', sha256: '', notes: '' }); const dragI = useRef(null);
  const [dupeWarn, setDupeWarn] = useState('');
  useEffect(() => {
    const nm = f.name.trim(); if (nm.length < 2) return setDupeWarn('');
    const t = setTimeout(() => { sb.from('ah_apps').select('id,name,slug').ilike('name', nm).limit(3).then(({ data }) => { const other = (data || []).filter((a) => a.id !== saved?.id); if (other.length) setDupeWarn(`An app named “${other[0].name}” already exists (/${other[0].slug}).`); else setDupeWarn(''); }); }, 400);
    return () => clearTimeout(t);
  }, [f.name, saved?.id]);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const loadShots = (id) => sb.from('ah_screenshots').select('*').eq('app_id', id).order('sort').then(({ data }) => setShots(data || []));
  const loadVers = (id) => sb.from('ah_versions').select('*').eq('app_id', id).order('created_at', { ascending: false }).then(({ data }) => setVersions(data || []));
  useEffect(() => { if (saved) { loadShots(saved.id); loadVers(saved.id); } }, [saved?.id]);
  const onName = (e) => { const name = e.target.value; setF({ ...f, name, slug: slugTouched ? f.slug : slugify(name) }); };
  const up = async (file, apply, folder, hashTo) => { if (!file) return; setBusy('Uploading ' + file.name + '…'); try { apply(await uploadFile(file, folder)); if (hashTo) { setBusy('Calculating checksum…'); hashTo(await sha256File(file)); } toast('Uploaded'); } catch (e) { toast('Upload failed: ' + e.message); } setBusy(''); };
  const hashOnly = async (file, apply) => { if (!file) return; setBusy('Calculating checksum…'); try { apply(await sha256File(file)); toast('Checksum filled in'); } catch (e) { toast(e.message); } setBusy(''); };
  const save = async (e) => {
    e.preventDefault(); const slug = slugify(f.slug || f.name);
    if (!slug || RESERVED.includes(slug)) return toast('That link name is reserved or empty — pick another.');
    const extra = lines(f.extra_links).map((l) => { const [label, ...u] = l.split('|'); return { label: (label || '').trim() || 'Mirror', url: u.join('|').trim() }; }).filter((l) => safeUrl(l.url));
    const row = { name: f.name.trim(), slug, icon_url: f.icon_url || null, short_desc: f.short_desc, about: f.about, features: lines(f.features), category: f.category.trim() || 'General', developer: f.developer, version: f.version, size: f.size, platform: f.platform, content_rating: f.content_rating, download_url: f.download_url.trim(), sha256: (f.sha256 || '').trim().toLowerCase(), extra_links: extra, whats_new: f.whats_new, seo_keywords: f.seo_keywords || '', seo_description: f.seo_description || '', is_featured: f.is_featured, is_published: f.is_published, is_verified: f.is_verified, publish_at: f.publish_at ? new Date(f.publish_at).toISOString() : null };
    setBusy('Saving…'); const { data, error } = await (saved ? sb.from('ah_apps').update(row).eq('id', saved.id).select().single() : sb.from('ah_apps').insert(row).select().single()); setBusy('');
    if (error) return toast(error.code === '23505' ? 'That link name is already used by another app.' : error.message);
    sb.rpc('ah_log', { p_action: saved ? 'edit_app' : 'create_app', p_detail: data.name }).then(() => {});
    setSaved(data); setF((x) => ({ ...x, slug })); try { localStorage.removeItem(dKey); } catch {} toast(saved ? 'Changes saved' : 'App created — now add screenshots and versions below');
  };
  const addShots = async (files) => { let sort = shots.length ? Math.max(...shots.map((s) => s.sort)) + 1 : 0; for (const file of files) { setBusy('Uploading ' + file.name + '…'); try { const url = await uploadFile(file, 'screenshots'); await sb.from('ah_screenshots').insert({ app_id: saved.id, url, sort: sort++ }); } catch (e) { toast('Failed: ' + e.message); } } setBusy(''); loadShots(saved.id); };
  const reorder = async (from, to) => { if (to < 0 || to >= shots.length || from === to) return; const arr = [...shots]; const [m] = arr.splice(from, 1); arr.splice(to, 0, m); setShots(arr); await Promise.all(arr.map((s, i) => sb.from('ah_screenshots').update({ sort: i }).eq('id', s.id))); };
  const delShot = async (s) => { await sb.from('ah_screenshots').delete().eq('id', s.id); loadShots(saved.id); };
  const releaseNew = async () => {
    if (!nv.version.trim()) return toast('Enter the new version number');
    await sb.from('ah_versions').insert({ app_id: saved.id, version: saved.version, size: saved.size, download_url: saved.download_url, sha256: saved.sha256 || '', notes: saved.whats_new });
    const patch = { version: nv.version.trim(), size: nv.size || saved.size, download_url: nv.download_url || saved.download_url, sha256: nv.download_url ? nv.sha256 : saved.sha256, whats_new: nv.notes };
    const { data, error } = await sb.from('ah_apps').update(patch).eq('id', saved.id).select().single(); if (error) return toast(error.message);
    setSaved(data); setF((x) => ({ ...x, ...patch })); setNv({ version: '', size: '', download_url: '', sha256: '', notes: '' }); loadVers(saved.id); toast('New version released — old one moved to history. Use “Announce” to notify subscribers.');
  };
  const addOld = async () => { if (!nv.version.trim() || !nv.download_url.trim()) return toast('Older version needs a version number and download link'); await sb.from('ah_versions').insert({ app_id: saved.id, ...nv }); setNv({ version: '', size: '', download_url: '', sha256: '', notes: '' }); loadVers(saved.id); toast('Added to version history'); };
  return (<div className="card pad"><div className="row between"><h2>{saved ? `Edit ${saved.name}` : dup ? 'Duplicate app' : 'Add app'}</h2><button className="btn ghost" onClick={() => { try { localStorage.removeItem(dKey); } catch {} onClose(); }}>← Back to apps</button></div>
    {saved && <p className="muted small">Share link: <a href={appUrl(saved.slug)} target="_blank" rel="noreferrer">{appUrl(saved.slug)}</a></p>}
    {dup && !saved && <p className="muted small">Copy of “{app.name}”. Change the name, then Create. (Screenshots and versions are not copied.)</p>}
    <form className="form two" onSubmit={save}>
      <div className="full">{dupeWarn && <div className="alert warn"><Ico n="warn" s={16} /> {dupeWarn}</div>}</div>
      <label>App name<input required value={f.name} onChange={onName} /></label>
      <label>Link name (URL)<input required value={f.slug} onChange={(e) => { setSlugTouched(true); setF({ ...f, slug: slugify(e.target.value) }); }} /><small className="muted">{location.origin}/{f.slug || 'appname'}/reviews …</small></label>
      <label>Category<CategoryPicker value={f.category} onChange={(v) => setF({ ...f, category: v })} /></label><label>Developer<input value={f.developer} onChange={set('developer')} /></label>
      <label>Version<input value={f.version} onChange={set('version')} /></label><label>Size<input value={f.size} onChange={set('size')} placeholder="e.g. 48 MB" /></label>
      <label>Platform<input value={f.platform} onChange={set('platform')} /></label><label>Content rating<input value={f.content_rating} onChange={set('content_rating')} placeholder="Everyone, 12+, 18+" /></label>
      <label className="full">Icon<input value={f.icon_url || ''} onChange={set('icon_url')} placeholder="URL or upload ↓" /><input type="file" accept="image/*" onChange={(e) => up(e.target.files[0], (u) => setF((x) => ({ ...x, icon_url: u })), 'icons')} /></label>
      <label className="full">Short description<input value={f.short_desc} onChange={set('short_desc')} maxLength={200} /></label>
      <div className="full"><label>About this app <small className="muted">(supports bold, lists, links — use the toolbar)</small></label><MdEditor rows={8} value={f.about} onChange={(v) => setF((x) => ({ ...x, about: v }))} /></div>
      <label className="full">Features (one per line)<textarea rows={5} value={f.features} onChange={set('features')} /></label>
      <div className="full"><label>What’s new (update notes)</label><MdEditor rows={4} value={f.whats_new} onChange={(v) => setF((x) => ({ ...x, whats_new: v }))} /></div>
      <label className="full">Download link<input value={f.download_url} onChange={set('download_url')} placeholder="https://… or upload a file ↓" /><input type="file" onChange={(e) => up(e.target.files[0], (u) => setF((x) => ({ ...x, download_url: u })), 'files', (h) => setF((x) => ({ ...x, sha256: h })))} /><small className="muted">Uploads up to 100 MB (checksum is calculated automatically). For bigger files paste an external link.</small></label>
      <label className="full">SHA-256 checksum <small className="muted">(shown to visitors + used for the VirusTotal button)</small><input value={f.sha256 || ''} onChange={set('sha256')} placeholder="auto-filled on upload, or pick your file ↓ to calculate" /><input type="file" onChange={(e) => hashOnly(e.target.files[0], (h) => setF((x) => ({ ...x, sha256: h })))} /></label>
      <label className="full">Extra download links / mirrors (Label | URL, one per line)<textarea rows={3} value={f.extra_links} onChange={set('extra_links')} /></label>
      <label className="full">SEO keywords (comma separated)<input value={f.seo_keywords || ''} onChange={set('seo_keywords')} placeholder="free vpn, secure browser, …" /></label>
      <label className="full">SEO description (shown on Google & link previews; falls back to the short description)<input value={f.seo_description || ''} onChange={set('seo_description')} maxLength={200} /></label>
      <label>Publish at (optional — leave empty to publish immediately once “Published” is on)<input type="datetime-local" value={f.publish_at} onChange={set('publish_at')} /></label>
      <label className="check"><input type="checkbox" checked={f.is_featured} onChange={set('is_featured')} /> Featured on home</label><label className="check"><input type="checkbox" checked={f.is_published} onChange={set('is_published')} /> Published</label>
      <label className="check"><input type="checkbox" checked={f.is_verified} onChange={set('is_verified')} /> Verified by Appshub badge</label>
      <div className="full row"><button className="btn" disabled={!!busy}>{saved ? 'Save changes' : 'Create app'}</button>{busy && <span className="muted">{busy}</span>}</div></form>
    {saved && <><hr /><h3>Screenshots <span className="muted small">(drag or use ◀ ▶ to reorder)</span></h3><input type="file" accept="image/*" multiple onChange={(e) => { addShots([...e.target.files]); e.target.value = ''; }} />
      <div className="shots-admin">{shots.map((s, i) => <div key={s.id} draggable onDragStart={() => (dragI.current = i)} onDragOver={(e) => e.preventDefault()} onDrop={() => { reorder(dragI.current, i); dragI.current = null; }}><img src={s.url} alt="" /><div className="row"><button className="btn sm ghost" onClick={() => reorder(i, i - 1)}>◀</button><button className="btn sm ghost" onClick={() => reorder(i, i + 1)}>▶</button><button className="btn sm danger" onClick={() => delShot(s)}>✕</button></div></div>)}</div>
      <hr /><h3>Version history</h3><p className="muted small">Current version: <b>{saved.version}</b>. “Release new version” moves the current one into history and updates the app.</p>
      <div className="form two"><label>Version<input value={nv.version} onChange={(e) => setNv({ ...nv, version: e.target.value })} placeholder="e.g. 2.1" /></label><label>Size<input value={nv.size} onChange={(e) => setNv({ ...nv, size: e.target.value })} /></label>
        <label className="full">Download link<input value={nv.download_url} onChange={(e) => setNv({ ...nv, download_url: e.target.value })} /><input type="file" onChange={(e) => up(e.target.files[0], (u) => setNv((x) => ({ ...x, download_url: u })), 'files', (h) => setNv((x) => ({ ...x, sha256: h })))} /></label>
        <div className="full"><label>Notes</label><MdEditor rows={3} value={nv.notes} onChange={(v) => setNv((x) => ({ ...x, notes: v }))} /></div>
        <div className="full row"><button className="btn" type="button" onClick={releaseNew}>Release new version</button><button className="btn ghost" type="button" onClick={addOld}>Add as older version</button></div></div>
      {versions.map((v) => <div key={v.id} className="review row between"><div><b>v{v.version}</b> <span className="muted small">{new Date(v.created_at).toLocaleDateString()} {v.size}</span><div className="muted small">{v.download_url}</div></div><button className="btn sm danger" onClick={async () => { await sb.from('ah_versions').delete().eq('id', v.id); loadVers(saved.id); }}>Delete</button></div>)}</>}
  </div>);
}

/* ---------- developers (see every developer and their apps) ---------- */
function AdminDevelopers() {
  const toast = useToast(); const [devs, setDevs] = useState(null); const [apps, setApps] = useState([]); const [open, setOpen] = useState(null); const [q, setQ] = useState(''); const [newKey, setNewKey] = useState(null);
  const load = () => { sb.from('ah_developers').select('*').order('created_at', { ascending: false }).then(({ data }) => setDevs(data || [])); sb.from('ah_apps').select('id,name,slug,owner_id,downloads,is_published,broken_reports').not('owner_id', 'is', null).then(({ data }) => setApps(data || [])); };
  useEffect(() => { load(); }, []);
  if (!devs) return <Loader />;
  const appsFor = (id) => apps.filter((a) => a.owner_id === id);
  const list = devs.filter((d) => (d.name || '').toLowerCase().includes(q.toLowerCase()));
  const suspend = async (d) => { const { error } = await sb.from('ah_developers').update({ suspended: !d.suspended }).eq('id', d.id); if (error) return toast(error.message); sb.rpc('ah_log', { p_action: d.suspended ? 'unsuspend_developer' : 'suspend_developer', p_detail: d.name }).then(() => {}); toast(d.suspended ? 'Unsuspended — their apps are visible again' : 'Suspended — their apps are hidden from visitors'); load(); };
  const resetKey = async (d) => { if (!confirm(`Issue ${d.name} a new key? Their old key stops working immediately — you'll need to send them this new one yourself.`)) return; const { data, error } = await sb.rpc('ah_admin_reset_dev_key', { p_dev_id: d.id }); if (error) return toast(error.message); setNewKey({ name: d.name, key: data }); };
  const delDev = async (d) => { if (!confirm(`Permanently delete ${d.name} and every app they published? This can't be undone.`)) return; const { error } = await sb.rpc('ah_admin_delete_dev', { p_dev_id: d.id }); if (error) return toast(error.message); toast('Deleted'); load(); };
  return (<div className="card pad"><div className="row between"><h2>Developers ({devs.length})</h2><input placeholder="Filter…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
    <p className="muted small">Anyone can get a key at <Link to="/developer">/developer</Link> (no account/email needed) to add their own apps. Suspending a developer hides all of their apps from visitors immediately.</p>
    {newKey && <div className="alert warn" style={{ alignItems: 'flex-start', flexDirection: 'column', gap: 8 }}><b>New key for {newKey.name}</b><div className="keybox"><code>{newKey.key}</code><button className="btn sm" onClick={() => { navigator.clipboard.writeText(newKey.key); toast('Copied'); }}>Copy</button></div><p className="muted small">Send this to them yourself — it won't be shown again.</p><button className="btn sm ghost" onClick={() => setNewKey(null)}>Close</button></div>}
    {list.length ? list.map((d) => { const theirApps = appsFor(d.id); const isOpen = open === d.id; return (
      <div key={d.id} className="review">
        <div className="row between"><div><b>{d.name}</b>{d.suspended && <span className="chip sm warnchip">suspended</span>} <span className="muted small"> · joined {timeAgo(d.created_at)}{d.last_seen ? ` · last seen ${timeAgo(d.last_seen)}` : ''}</span>{d.website && <> · <a href={safeUrl(d.website)} target="_blank" rel="noopener noreferrer">{d.website}</a></>}</div>
          <div className="actions"><button className="btn sm ghost" onClick={() => setOpen(isOpen ? null : d.id)}>{theirApps.length} app{theirApps.length === 1 ? '' : 's'} {isOpen ? '▲' : '▼'}</button><button className="btn sm ghost" onClick={() => resetKey(d)}>Reset key</button><button className={'btn sm' + (d.suspended ? '' : ' danger')} onClick={() => suspend(d)}>{d.suspended ? 'Unsuspend' : 'Suspend'}</button><button className="btn sm danger" onClick={() => delDev(d)}>Delete</button></div></div>
        {d.bio && <p className="muted small pre">{d.bio}</p>}
        {isOpen && (theirApps.length ? <div className="table-wrap" style={{ marginTop: 8 }}><table className="table"><thead><tr><th>App</th><th>Downloads</th><th>Status</th></tr></thead><tbody>
          {theirApps.map((a) => <tr key={a.id}><td><Link to={`/${a.slug}`}>{a.name}</Link></td><td>{fmtNum(a.downloads)}</td><td>{a.is_published ? 'Live' : 'Unpublished'}{a.broken_reports > 0 && <span className="chip sm warnchip">⚠ {a.broken_reports}</span>}</td></tr>)}
        </tbody></table></div> : <p className="muted small">No apps yet.</p>)}
      </div>); }) : <Empty>No developers yet.</Empty>}</div>);
}

/* ---------- managed categories ---------- */
function CategoryPicker({ value, onChange }) {
  const [cats, setCats] = useState([]); const [adding, setAdding] = useState(false); const [nv, setNv] = useState('');
  useEffect(() => { sb.from('ah_categories').select('name').order('sort').then(({ data }) => setCats((data || []).map((c) => c.name))); }, []);
  if (adding) return <div className="row"><input autoFocus value={nv} onChange={(e) => setNv(e.target.value)} placeholder="New category name" />
    <button type="button" className="btn sm" onClick={async () => { const name = nv.trim(); if (!name) return; await sb.from('ah_categories').insert({ name, sort: cats.length }).select().then(() => {}); setCats([...cats, name]); onChange(name); setAdding(false); setNv(''); }}>Add</button>
    <button type="button" className="btn sm ghost" onClick={() => setAdding(false)}>Cancel</button></div>;
  return <select value={value} onChange={(e) => { if (e.target.value === '__new') return setAdding(true); onChange(e.target.value); }}>
    {!cats.includes(value) && value && <option value={value}>{value}</option>}
    {cats.map((c) => <option key={c} value={c}>{c}</option>)}<option value="__new">+ Add new category…</option></select>;
}
function AdminCategories() {
  const toast = useToast(); const [rows, setRows] = useState(null); const [nv, setNv] = useState(''); const [ren, setRen] = useState({});
  const load = () => sb.from('ah_categories').select('*').order('sort').then(({ data }) => setRows(data || []));
  useEffect(() => { load(); }, []);
  if (!rows) return <Loader />;
  const add = async () => { const name = nv.trim(); if (!name) return; const { error } = await sb.from('ah_categories').insert({ name, sort: rows.length }); if (error) return toast(error.code === '23505' ? 'Already exists' : error.message); setNv(''); load(); };
  const rename = async (old) => { const name = (ren[old] || '').trim(); if (!name || name === old) return setRen({ ...ren, [old]: undefined }); const { error } = await sb.rpc('ah_rename_category', { p_old: old, p_new: name }); if (error) return toast(error.message); toast('Renamed everywhere'); setRen({ ...ren, [old]: undefined }); load(); };
  const move = async (i, d) => { const j = i + d; if (j < 0 || j >= rows.length) return; const a = [...rows]; [a[i], a[j]] = [a[j], a[i]]; setRows(a); await Promise.all(a.map((c, k) => sb.from('ah_categories').update({ sort: k }).eq('id', c.id))); };
  const del = async (c) => { if (!confirm(`Delete “${c.name}”? Apps keep this category text, but it won’t appear as a filter chip until re-created.`)) return; await sb.from('ah_categories').delete().eq('id', c.id); load(); };
  return (<div className="card pad narrow"><h2>🏷 Categories</h2><p className="muted small">Rename merges every app using the old name; order controls the home page chip order.</p>
    <div className="row"><input value={nv} onChange={(e) => setNv(e.target.value)} placeholder="New category" /><button className="btn sm" onClick={add}>Add</button></div><hr />
    {rows.map((c, i) => <div key={c.id} className="review row between"><div className="row">{ren[c.name] !== undefined ? <><input value={ren[c.name]} onChange={(e) => setRen({ ...ren, [c.name]: e.target.value })} /><button className="btn sm" onClick={() => rename(c.name)}>Save</button></> : <b>{c.name}</b>}</div>
      <div className="actions"><button className="btn sm ghost" onClick={() => move(i, -1)}>▲</button><button className="btn sm ghost" onClick={() => move(i, 1)}>▼</button>{ren[c.name] === undefined && <button className="btn sm ghost" onClick={() => setRen({ ...ren, [c.name]: c.name })}>Rename</button>}<button className="btn sm danger" onClick={() => del(c)}>Delete</button></div></div>)}</div>);
}

/* ---------- collections ---------- */
function AdminCollections() {
  const toast = useToast(); const [rows, setRows] = useState(null); const [apps, setApps] = useState([]); const [f, setF] = useState(null);
  const load = () => sb.from('ah_collections').select('*').order('sort').then(({ data }) => setRows(data || []));
  useEffect(() => { load(); sb.from('ah_apps').select('id,name,slug,icon_url').order('name').then(({ data }) => setApps(data || [])); }, []);
  const save = async (e) => { e.preventDefault(); const { id, created_at, ...row } = f; row.sort = Number(row.sort) || 0; const { error } = id ? await sb.from('ah_collections').update(row).eq('id', id) : await sb.from('ah_collections').insert(row); if (error) return toast(error.message); toast('Saved'); setF(null); load(); };
  if (!rows) return <Loader />;
  if (f) { const move = (i, d) => { const a = [...f.app_ids]; const j = i + d; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; setF({ ...f, app_ids: a }); }; const byId = Object.fromEntries(apps.map((a) => [a.id, a]));
    return (<div className="card pad"><h2>{f.id ? 'Edit' : 'New'} collection</h2><form className="form" onSubmit={save}>
      <label>Title (e.g. “Editor’s choice”, “Best tools”)<input required value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></label>
      <div className="form two"><label>Order (lower shows first)<input type="number" value={f.sort} onChange={(e) => setF({ ...f, sort: e.target.value })} /></label><label className="check"><input type="checkbox" checked={f.active} onChange={(e) => setF({ ...f, active: e.target.checked })} /> Show on home page</label></div>
      <h3>Apps in this collection</h3>{f.app_ids.length ? f.app_ids.map((id, i) => <div key={id} className="row"><span className="grow">{i + 1}. {byId[id]?.name || '(deleted)'}</span><button type="button" className="btn sm ghost" onClick={() => move(i, -1)}>▲</button><button type="button" className="btn sm ghost" onClick={() => move(i, 1)}>▼</button><button type="button" className="btn sm danger" onClick={() => setF({ ...f, app_ids: f.app_ids.filter((x) => x !== id) })}>✕</button></div>) : <p className="muted small">Nothing yet — add apps below.</p>}
      <h3>Add apps</h3><div className="chips inline">{apps.filter((a) => !f.app_ids.includes(a.id)).map((a) => <button type="button" key={a.id} className="chip" onClick={() => setF({ ...f, app_ids: [...f.app_ids, a.id] })}>+ {a.name}</button>)}</div>
      <div className="row"><button className="btn">Save</button><button type="button" className="btn ghost" onClick={() => setF(null)}>Cancel</button></div></form></div>); }
  return (<div className="card pad"><div className="row between"><h2>Collections</h2><button className="btn" onClick={() => setF({ title: '', app_ids: [], sort: rows.length, active: true })}>+ New collection</button></div>
    <p className="muted small">Hand-picked shelves shown on the home page, like “Editor’s choice” or “Best tools”.</p>
    {rows.length ? rows.map((c) => <div key={c.id} className="review row between"><div><b>{c.title}</b> {!c.active && <span className="chip sm">hidden</span>}<div className="muted small">{c.app_ids.length} apps · order {c.sort}</div></div><div className="actions"><button className="btn sm" onClick={() => setF(c)}>Edit</button><button className="btn sm danger" onClick={async () => { if (confirm('Delete collection?')) { await sb.from('ah_collections').delete().eq('id', c.id); load(); } }}>Delete</button></div></div>) : <Empty>No collections yet.</Empty>}</div>);
}

/* ---------- reviews & Q&A moderation ---------- */
function AdminReviews() {
  const toast = useToast(); const [rows, setRows] = useState(null); const [draft, setDraft] = useState({}); const [flt, setFlt] = useState('all');
  const load = () => sb.from('ah_reviews').select('*, ah_apps(name,slug)').order('created_at', { ascending: false }).limit(300).then(({ data }) => setRows(data || []));
  useEffect(() => { load(); }, []);
  if (!rows) return <Loader />;
  const list = rows.filter((r) => flt === 'all' || (flt === 'pending' && !r.approved) || (flt === 'reported' && r.reports > 0));
  const reply = async (r, text) => { const { error } = await sb.from('ah_reviews').update({ admin_reply: text || null, replied_at: text ? new Date().toISOString() : null }).eq('id', r.id); if (error) return toast(error.message); toast(text ? 'Reply posted' : 'Reply removed'); setDraft({ ...draft, [r.id]: undefined }); load(); };
  return (<div className="card pad"><div className="row between"><h2>Reviews ({rows.length})</h2><div className="chips">{[['all', 'All'], ['pending', 'Awaiting approval'], ['reported', 'Reported']].map(([k, l]) => <button key={k} className={'chip' + (k === flt ? ' active' : '')} onClick={() => setFlt(k)}>{l}</button>)}</div></div>
    {list.length ? list.map((r) => <div key={r.id} className="review"><div className="row between"><div><b>{r.name}</b> on <Link to={`/${r.ah_apps?.slug}/reviews`}>{r.ah_apps?.name}</Link> <Stars value={r.rating} size={13} /> <span className="muted small">{timeAgo(r.created_at)}</span> {!r.approved && <span className="chip sm warnchip">hidden / pending</span>} {r.reports > 0 && <span className="chip sm warnchip">⚑ {r.reports}</span>}</div>
      <div className="actions">{!r.approved ? <button className="btn sm" onClick={async () => { await sb.from('ah_reviews').update({ approved: true, reports: 0 }).eq('id', r.id); load(); }}>Approve</button> : <button className="btn sm ghost" onClick={async () => { await sb.from('ah_reviews').update({ approved: false }).eq('id', r.id); load(); }}>Hide</button>}<button className="btn sm danger" onClick={async () => { if (!confirm('Delete this review?')) return; await sb.from('ah_reviews').delete().eq('id', r.id); toast('Deleted'); load(); }}>Delete</button></div></div><p className="pre">{r.comment}</p>
      {r.admin_reply && draft[r.id] === undefined && <div className="reply"><b>Your reply</b><p className="pre">{r.admin_reply}</p><button className="btn sm ghost" onClick={() => setDraft({ ...draft, [r.id]: r.admin_reply })}>Edit</button> <button className="btn sm danger" onClick={() => reply(r, '')}>Remove</button></div>}
      {!r.admin_reply && draft[r.id] === undefined && <button className="btn sm ghost" onClick={() => setDraft({ ...draft, [r.id]: '' })}>Reply</button>}
      {draft[r.id] !== undefined && <div className="form"><textarea rows={3} value={draft[r.id]} onChange={(e) => setDraft({ ...draft, [r.id]: e.target.value })} placeholder="Write a public reply…" /><div className="row"><button className="btn sm" onClick={() => reply(r, draft[r.id].trim())}>Post reply</button><button className="btn sm ghost" onClick={() => setDraft({ ...draft, [r.id]: undefined })}>Cancel</button></div></div>}</div>) : <Empty>Nothing here.</Empty>}</div>);
}
function AdminComments() {
  const toast = useToast(); const [rows, setRows] = useState(null); const [draft, setDraft] = useState({}); const [flt, setFlt] = useState('all');
  const load = () => sb.from('ah_comments').select('*, ah_apps(name,slug)').order('created_at', { ascending: false }).limit(400).then(({ data }) => setRows(data || []));
  useEffect(() => { load(); }, []);
  if (!rows) return <Loader />;
  const list = rows.filter((r) => flt === 'all' || (flt === 'pending' && !r.approved) || (flt === 'reported' && r.reports > 0) || (flt === 'open' && !r.is_admin && !r.parent_id && !rows.some((x) => x.parent_id === r.id && x.is_admin)));
  const reply = async (c) => { const message = (draft[c.id] || '').trim(); if (!message) return; const { error } = await sb.from('ah_comments').insert({ app_id: c.app_id, parent_id: c.parent_id || c.id, name: 'Developer', message, is_admin: true }); if (error) return toast(error.message); setDraft({ ...draft, [c.id]: undefined }); toast('Reply posted'); load(); };
  return (<div className="card pad"><div className="row between"><h2>Questions & comments ({rows.length})</h2><div className="chips">{[['all', 'All'], ['open', 'Unanswered'], ['pending', 'Awaiting approval'], ['reported', 'Reported']].map(([k, l]) => <button key={k} className={'chip' + (k === flt ? ' active' : '')} onClick={() => setFlt(k)}>{l}</button>)}</div></div>
    {list.length ? list.map((c) => <div key={c.id} className="review"><div className="row between"><div><b>{c.name}</b> {c.is_admin && <span className="chip sm">Developer</span>} on <Link to={`/${c.ah_apps?.slug}/questions`}>{c.ah_apps?.name}</Link> <span className="muted small">{timeAgo(c.created_at)}</span> {!c.approved && <span className="chip sm warnchip">hidden / pending</span>} {c.reports > 0 && <span className="chip sm warnchip">⚑ {c.reports}</span>}</div>
      <div className="actions">{!c.approved ? <button className="btn sm" onClick={async () => { await sb.from('ah_comments').update({ approved: true, reports: 0 }).eq('id', c.id); load(); }}>Approve</button> : !c.is_admin && <button className="btn sm ghost" onClick={async () => { await sb.from('ah_comments').update({ approved: false }).eq('id', c.id); load(); }}>Hide</button>}<button className="btn sm danger" onClick={async () => { if (!confirm('Delete?')) return; await sb.from('ah_comments').delete().eq('id', c.id); load(); }}>Delete</button></div></div><p className="pre">{c.message}</p>
      {draft[c.id] === undefined ? <button className="btn sm ghost" onClick={() => setDraft({ ...draft, [c.id]: '' })}>Reply as developer</button> : <div className="form"><textarea rows={3} value={draft[c.id]} onChange={(e) => setDraft({ ...draft, [c.id]: e.target.value })} /><div className="row"><button className="btn sm" onClick={() => reply(c)}>Post reply</button><button className="btn sm ghost" onClick={() => setDraft({ ...draft, [c.id]: undefined })}>Cancel</button></div></div>}</div>) : <Empty>Nothing here.</Empty>}</div>);
}

/* ---------- requests ---------- */
function AdminRequests() {
  const [rows, setRows] = useState(null); const [kind, setKind] = useState('all');
  const load = () => sb.from('ah_requests').select('*').order('created_at', { ascending: false }).limit(300).then(({ data }) => setRows(data || []));
  useEffect(() => { load(); }, []);
  if (!rows) return <Loader />;
  const list = rows.filter((r) => kind === 'all' || r.kind === kind); const label = { app: '🆕 App request', update: '🔄 Update request', contact: '✉️ Contact', report: '⚠️ Broken link' };
  return (<div className="card pad"><div className="row between"><h2>Requests & messages</h2><div className="chips">{['all', 'app', 'update', 'report', 'contact'].map((k) => <button key={k} className={'chip' + (k === kind ? ' active' : '')} onClick={() => setKind(k)}>{k === 'all' ? 'All' : label[k]}</button>)}</div></div>
    {list.length ? list.map((r) => <div key={r.id} className={'review req' + (r.status === 'done' ? ' done' : '')}><div className="row between"><b>{label[r.kind]}{r.app_name && ` — ${r.app_name}`}</b><span className="muted small">{timeAgo(r.created_at)}</span></div>
      <div className="muted small">{r.name || 'Anonymous'} {r.email && <>· <a href={`mailto:${r.email}`}>{r.email}</a></>} {r.app_slug && <>· <Link to={`/${r.app_slug}`}>open app</Link></>}</div><p className="pre">{r.message}</p>
      <div className="row"><button className="btn sm ghost" onClick={async () => { await sb.from('ah_requests').update({ status: r.status === 'done' ? 'new' : 'done' }).eq('id', r.id); load(); }}>{r.status === 'done' ? 'Mark as new' : '✓ Mark done'}</button><button className="btn sm danger" onClick={async () => { await sb.from('ah_requests').delete().eq('id', r.id); load(); }}>Delete</button></div></div>) : <Empty>Nothing here.</Empty>}</div>);
}

/* ---------- ads & banners (owner) ---------- */
const bannerDraftKey = (id) => 'ah_admin_draft:banner-' + (id || 'new');
function AdminBanners() {
  const toast = useToast(); const [rows, setRows] = useState(null); const [f, setF] = useState(null); const [busy, setBusy] = useState(false); const [restoredMsg, setRestoredMsg] = useState(false);
  const load = () => sb.from('ah_banners').select('*').order('created_at', { ascending: false }).then(({ data }) => setRows(data || []));
  useEffect(() => { load(); }, []);
  useEffect(() => { if (!f) return; lsSet(bannerDraftKey(f.id), f); }, [f]);
  const open = (base) => { const draft = lsGet(bannerDraftKey(base.id), null); setRestoredMsg(!!draft); setF(draft || base); };
  useEffect(() => { if (restoredMsg) { toast('Restored your unsaved draft'); setRestoredMsg(false); } }, [restoredMsg]);
  const cancel = () => { try { localStorage.removeItem(bannerDraftKey(f.id)); } catch {} setF(null); };
  const save = async (e) => {
    e.preventDefault(); const { id, created_at, clicks, impressions, ...row } = f; row.link_url = row.link_url || null; row.image_url = row.image_url || null;
    row.starts_at = row.starts_at ? new Date(row.starts_at).toISOString() : null; row.ends_at = row.ends_at ? new Date(row.ends_at).toISOString() : null;
    const { error } = id ? await sb.from('ah_banners').update(row).eq('id', id) : await sb.from('ah_banners').insert(row); if (error) return toast(error.message);
    try { localStorage.removeItem(bannerDraftKey(id)); } catch {} toast('Saved'); setF(null); load();
  };
  if (!rows) return <Loader />;
  if (f) return (<div className="card pad"><h2>{f.id ? 'Edit' : 'New'} banner / ad</h2><form className="form" onSubmit={save}>
    <label>Placement<select value={f.placement} onChange={(e) => setF({ ...f, placement: e.target.value })}><option value="popup">Pop-up before download</option><option value="banner">Banner on home page</option></select></label>
    <label>Title<input required value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></label><label>Text<textarea rows={3} value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} /></label>
    <label>Image<input value={f.image_url || ''} onChange={(e) => setF({ ...f, image_url: e.target.value })} placeholder="URL or upload ↓" /><input type="file" accept="image/*" onChange={async (e) => { const file = e.target.files[0]; if (!file) return; setBusy(true); try { setF({ ...f, image_url: await uploadFile(file, 'banners') }); } catch (er) { toast(er.message); } setBusy(false); }} /></label>
    <label>Link when clicked (optional)<input value={f.link_url || ''} onChange={(e) => setF({ ...f, link_url: e.target.value })} placeholder="https://…" /></label>
    <div className="form two"><label>Start showing (optional)<input type="datetime-local" value={toLocalInput(f.starts_at)} onChange={(e) => setF({ ...f, starts_at: e.target.value })} /></label><label>Stop showing (optional)<input type="datetime-local" value={toLocalInput(f.ends_at)} onChange={(e) => setF({ ...f, ends_at: e.target.value })} /></label></div>
    <label className="check"><input type="checkbox" checked={f.active} onChange={(e) => setF({ ...f, active: e.target.checked })} /> Active</label>
    <div className="row"><button className="btn" disabled={busy}>{busy ? 'Uploading…' : 'Save'}</button><button type="button" className="btn ghost" onClick={cancel}>Cancel</button></div></form></div>);
  return (<div className="card pad"><div className="row between"><h2>Ads & banners</h2><button className="btn" onClick={() => open({ placement: 'popup', title: '', message: '', image_url: '', link_url: '', starts_at: null, ends_at: null, active: true })}>+ New</button></div>
    <p className="muted small">Pop-up ads appear before every download (a random live one is shown). With none live, downloads start immediately.</p>
    {rows.length ? rows.map((b) => { const live = isLive(b); return (<div key={b.id} className="review row between"><div className="row">{b.image_url && <img className="thumb" src={b.image_url} alt="" />}<div><b>{b.title}</b> <span className="chip sm">{b.placement}</span> <span className={'chip sm' + (live ? '' : ' warnchip')}>{live ? 'live' : b.active ? 'scheduled/expired' : 'off'}</span>
      <p className="muted small">{b.message}</p><p className="small">👁 {fmtNum(b.impressions)} · 🖱 {fmtNum(b.clicks)} · CTR {b.impressions ? ((b.clicks / b.impressions) * 100).toFixed(1) : 0}%{b.starts_at && ` · from ${new Date(b.starts_at).toLocaleDateString()}`}{b.ends_at && ` · until ${new Date(b.ends_at).toLocaleDateString()}`}</p></div></div>
      <div className="actions"><button className="btn sm ghost" onClick={async () => { await sb.from('ah_banners').update({ active: !b.active }).eq('id', b.id); load(); }}>{b.active ? 'Turn off' : 'Turn on'}</button><button className="btn sm" onClick={() => open(b)}>Edit</button><button className="btn sm danger" onClick={async () => { if (confirm('Delete?')) { await sb.from('ah_banners').delete().eq('id', b.id); load(); } }}>Delete</button></div></div>); }) : <Empty>No banners yet.</Empty>}</div>);
}

/* ---------- announcements: push + email + Telegram channel ---------- */
function AdminNotify() {
  const toast = useToast(); const [apps, setApps] = useState([]); const [counts, setCounts] = useState(null); const [busy, setBusy] = useState(false); const [result, setResult] = useState(null);
  const [f, setF] = useState({ app: '', title: '', body: '', url: '', audience: 'followers', push: true, email: true, telegram: false });
  useEffect(() => { sb.from('ah_apps').select('id,name,slug,category,short_desc,whats_new,version').eq('is_published', true).order('name').then(({ data }) => setApps(data || []));
    Promise.all([sb.from('ah_push_subs').select('id', { count: 'exact', head: true }), sb.from('ah_subscribers').select('id', { count: 'exact', head: true })]).then(([p, e]) => setCounts({ push: p.count || 0, email: e.count || 0 })); }, []);
  const app = apps.find((a) => a.id === f.app);
  const fill = (type) => { if (!app) return toast('Choose an app first'); setF({ ...f, url: '/' + app.slug, title: type === 'new' ? `New app: ${app.name}` : `${app.name} updated to v${app.version}`, body: (type === 'new' ? app.short_desc : (app.whats_new || app.short_desc) || '').replace(/[*#_`]/g, '').slice(0, 140) || `${app.name} is now available on Appshub.` }); };
  const send = async () => {
    if (!f.title.trim() || !f.body.trim()) return toast('Add a title and a message');
    if (!f.push && !f.email && !f.telegram) return toast('Pick at least one channel');
    if (!confirm('Send this announcement now?')) return;
    setBusy(true); setResult(null);
    try {
      const { data: { session } } = await sb.auth.getSession();
      const r = await fetch('/api/notify', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + session.access_token }, body: JSON.stringify({ title: f.title.trim(), body: f.body.trim(), url: f.url, slug: app?.slug, category: app?.category, audience: f.audience, channels: { push: f.push, email: f.email, telegram: f.telegram } }) });
      const j = await r.json().catch(() => ({ error: r.status === 404 ? 'Announcements only work on your deployed (Vercel) site.' : 'Server error' }));
      if (!r.ok) toast(j.error || 'Failed'); else { setResult(j); toast('Sent!'); }
    } catch (e) { toast(e.message); }
    setBusy(false);
  };
  return (<div className="cols"><div className="card pad"><h2>📣 Announce</h2><p className="muted small">Send a notice about a new app or new version to visitors who saved the app or follow its category. Works on your deployed site.</p>
    <div className="form"><label>About which app? (optional)<select value={f.app} onChange={(e) => setF({ ...f, app: e.target.value })}><option value="">— none (general message) —</option>{apps.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select></label>
      {app && <div className="row"><button type="button" className="btn sm ghost" onClick={() => fill('new')}>Fill: new app</button><button type="button" className="btn sm ghost" onClick={() => fill('ver')}>Fill: new version</button></div>}
      <label>Title<input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></label><label>Message<textarea rows={4} value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} /></label>
      <label>Opens page (optional)<input value={f.url} onChange={(e) => setF({ ...f, url: e.target.value })} placeholder="/appname" /></label>
      <label>Send to<select value={f.audience} onChange={(e) => setF({ ...f, audience: e.target.value })}><option value="followers">Followers of this app / its category</option><option value="everyone">Everyone who subscribed</option></select></label>
      <div className="row"><label className="check"><input type="checkbox" checked={f.push} onChange={(e) => setF({ ...f, push: e.target.checked })} /> Push</label><label className="check"><input type="checkbox" checked={f.email} onChange={(e) => setF({ ...f, email: e.target.checked })} /> Email</label><label className="check"><input type="checkbox" checked={f.telegram} onChange={(e) => setF({ ...f, telegram: e.target.checked })} /> Telegram channel</label></div>
      <button className="btn" disabled={busy} onClick={send}>{busy ? 'Sending…' : 'Send announcement'}</button></div>
    {result && <div className="card pad" style={{ marginTop: 12 }}><b>Result</b>{result.push && <p className="small">Push: {result.push.sent} sent, {result.push.failed} failed ({result.push.audience} matched)</p>}{result.email && <p className="small">Email: {result.email.sent} sent, {result.email.failed} failed ({result.email.audience} matched)</p>}{result.telegram && <p className="small">Telegram: {result.telegram.ok ? 'posted' : 'failed'}</p>}</div>}</div>
    <aside><div className="card pad"><h3>Audience</h3>{counts ? <><p>🔔 {counts.push} push subscribers</p><p>✉️ {counts.email} email subscribers</p></> : <Loader />}<p className="muted small">Email needs a Resend API key and Telegram needs a bot token + channel ID (Settings).</p></div></aside></div>);
}

/* ---------- team (owner) ---------- */
function AdminTeam({ session }) {
  const toast = useToast(); const [rows, setRows] = useState(null); const [f, setF] = useState({ username: '', password: '', role: 'editor' }); const [busy, setBusy] = useState(false);
  const load = () => sb.from('ah_admins').select('*').order('created_at').then(({ data }) => setRows(data || []));
  useEffect(() => { load(); }, []);
  const uname = (email) => email.replace('@appshub.app', '');
  if (!rows) return <Loader />;
  return (<div className="cols"><div className="card pad"><h2>👥 Team</h2>
    {rows.map((a) => <div key={a.email} className="review row between"><div><b>{uname(a.email)}</b> <span className="chip sm">{a.role}</span>{a.email === session.user.email && <span className="muted small"> (you)</span>}</div>
      <div className="actions"><button className="btn sm ghost" onClick={async () => { const p = prompt(`New password for ${uname(a.email)} (min 8 characters)`); if (!p) return; const { error } = await sb.rpc('ah_set_admin_password', { p_username: uname(a.email), p_password: p }); toast(error ? error.message : 'Password changed'); }}>Reset password</button>
        {a.email !== session.user.email && a.email !== 'symoh@appshub.app' && <button className="btn sm danger" onClick={async () => { if (!confirm('Remove ' + uname(a.email) + '?')) return; const { error } = await sb.rpc('ah_delete_admin', { p_username: uname(a.email) }); toast(error ? error.message : 'Removed'); load(); }}>Remove</button>}</div></div>)}</div>
    <aside><div className="card pad"><h3>Add a team member</h3><form className="form" onSubmit={async (e) => { e.preventDefault(); setBusy(true); const { error } = await sb.rpc('ah_create_admin', { p_username: f.username.trim(), p_password: f.password, p_role: f.role }); setBusy(false); if (error) return toast(error.message); toast('Account created'); setF({ username: '', password: '', role: 'editor' }); load(); }}>
      <label>Username<input required value={f.username} onChange={(e) => setF({ ...f, username: e.target.value })} /></label><label>Password (min 8)<input required type="password" autoComplete="new-password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></label>
      <label>Role<select value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })}><option value="editor">Editor — apps, reviews, Q&A, requests</option><option value="owner">Owner — everything</option></select></label>
      <button className="btn" disabled={busy}>Create account</button></form></div></aside></div>);
}
function AdminAccount({ session, role }) {
  const toast = useToast(); const [p1, setP1] = useState(''); const [p2, setP2] = useState('');
  return (<div className="cols"><div className="card pad narrow"><h2>🔑 My account</h2><p className="muted">Signed in as <b>{session.user.email.replace('@appshub.app', '')}</b> ({role}).</p>
    <form className="form" onSubmit={async (e) => { e.preventDefault(); if (p1.length < 8) return toast('Use at least 8 characters'); if (p1 !== p2) return toast('Passwords do not match'); const { error } = await sb.auth.updateUser({ password: p1 }); toast(error ? error.message : 'Password changed'); if (!error) { setP1(''); setP2(''); } }}>
      <label>New password<input type="password" autoComplete="new-password" value={p1} onChange={(e) => setP1(e.target.value)} /></label><label>Repeat new password<input type="password" autoComplete="new-password" value={p2} onChange={(e) => setP2(e.target.value)} /></label><button className="btn">Change password</button></form></div>
    <TwoFactorCard /></div>);
}
function TwoFactorCard() {
  const toast = useToast(); const [factors, setFactors] = useState(null); const [enroll, setEnroll] = useState(null); const [code, setCode] = useState(''); const [busy, setBusy] = useState(false);
  const load = () => sb.auth.mfa.listFactors().then(({ data }) => setFactors(data?.totp || []));
  useEffect(() => { load(); }, []);
  const start = async () => { setBusy(true); const { data, error } = await sb.auth.mfa.enroll({ factorType: 'totp' }); setBusy(false); if (error) return toast(error.message); setEnroll(data); };
  const verify = async (e) => { e.preventDefault(); setBusy(true); const { data: ch, error: e1 } = await sb.auth.mfa.challenge({ factorId: enroll.id }); if (e1) { setBusy(false); return toast(e1.message); } const { error: e2 } = await sb.auth.mfa.verify({ factorId: enroll.id, challengeId: ch.id, code: code.trim() }); setBusy(false); if (e2) return toast('Wrong code, try again'); toast('Two-factor login enabled'); setEnroll(null); setCode(''); load(); };
  const remove = async (id) => { if (!confirm('Turn off two-factor login?')) return; const { error } = await sb.auth.mfa.unenroll({ factorId: id }); if (error) return toast(error.message); toast('Two-factor login turned off'); load(); };
  if (!factors) return <Loader />;
  return (<div className="card pad"><h2>🔐 Two-factor login</h2>
    {factors.length > 0 ? <p>Enabled ✓ <button className="btn sm danger" onClick={() => remove(factors[0].id)}>Turn off</button></p> : enroll ? (
      <form className="form" onSubmit={verify}><p className="muted small">Scan this in your authenticator app (Google Authenticator, Authy…), or enter the code manually.</p>
        <img src={enroll.totp.qr_code} alt="QR code for two-factor setup" style={{ background: '#fff', padding: 8, borderRadius: 8, width: 180 }} />
        <p className="muted small">Manual code: <code>{enroll.totp.secret}</code></p>
        <label>Enter the 6-digit code to confirm<input required inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value)} /></label>
        <div className="row"><button className="btn" disabled={busy}>Confirm</button><button type="button" className="btn ghost" onClick={() => setEnroll(null)}>Cancel</button></div></form>
    ) : <><p className="muted">Add an authenticator app code as a second step when logging in.</p><button className="btn" disabled={busy} onClick={start}>Set up two-factor login</button></>}</div>);
}

/* ---------- blocklist (owner) ---------- */
function AdminBlocklist() {
  const toast = useToast(); const [rows, setRows] = useState(null); const [kind, setKind] = useState('email'); const [value, setValue] = useState(''); const [note, setNote] = useState('');
  const load = () => sb.from('ah_blocklist').select('*').order('created_at', { ascending: false }).then(({ data }) => setRows(data || []));
  useEffect(() => { load(); }, []);
  if (!rows) return <Loader />;
  const add = async (e) => { e.preventDefault(); if (!value.trim()) return; const { error } = await sb.from('ah_blocklist').insert({ kind, value: value.trim(), note: note.trim() }); if (error) return toast(error.code === '23505' ? 'Already blocked' : error.message); setValue(''); setNote(''); toast('Blocked'); load(); };
  return (<div className="card pad narrow"><h2>🚫 Blocklist</h2><p className="muted small">Block an email address or IP from posting reviews, questions and requests. This is in addition to auto-hiding at 5 reports.</p>
    <form className="form two" onSubmit={add}><label>Type<select value={kind} onChange={(e) => setKind(e.target.value)}><option value="email">Email</option><option value="ip">IP address</option></select></label>
      <label>Value<input required value={value} onChange={(e) => setValue(e.target.value)} placeholder={kind === 'email' ? 'name@example.com' : '203.0.113.5'} /></label>
      <label className="full">Note (optional)<input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Why blocked" /></label>
      <div className="full"><button className="btn">Block</button></div></form><hr />
    {rows.length ? rows.map((b) => <div key={b.id} className="review row between"><div><span className="chip sm">{b.kind}</span> <b>{b.value}</b>{b.note && <div className="muted small">{b.note}</div>}</div><button className="btn sm danger" onClick={async () => { await sb.from('ah_blocklist').delete().eq('id', b.id); load(); }}>Remove</button></div>) : <Empty>Nothing blocked.</Empty>}</div>);
}

/* ---------- activity log (owner) ---------- */
function AdminActivity() {
  const [rows, setRows] = useState(null);
  useEffect(() => { sb.from('ah_activity').select('*').order('created_at', { ascending: false }).limit(200).then(({ data }) => setRows(data || [])); }, []);
  if (!rows) return <Loader />;
  return (<div className="card pad"><h2>📜 Activity log</h2><p className="muted small">Actions taken by team members (last 200).</p>
    {rows.length ? <div className="table-wrap"><table className="table"><thead><tr><th>Who</th><th>Action</th><th>Detail</th><th>When</th></tr></thead><tbody>
      {rows.map((r) => <tr key={r.id}><td>{r.actor.replace('@appshub.app', '')}</td><td>{r.action}</td><td>{r.detail}</td><td className="muted small">{timeAgo(r.created_at)}</td></tr>)}
    </tbody></table></div> : <Empty>No activity yet.</Empty>}</div>);
}

/* ---------- settings (owner) ---------- */
function AdminSettings() {
  const toast = useToast(); const [s, setS] = useState(null); const [sec, setSec] = useState(null);
  useEffect(() => { sb.from('ah_settings').select('*').then(({ data }) => setS(Object.fromEntries((data || []).map((r) => [r.key, r.value])))); sb.from('ah_secrets').select('*').then(({ data }) => setSec(Object.fromEntries((data || []).map((r) => [r.key, r.value])))); }, []);
  if (!s || !sec) return <Loader />;
  const fields = [['site_name', 'Site name'], ['tagline', 'Tagline'], ['announcement', 'Announcement bar (empty = hidden)'], ['popup_seconds', 'Seconds to wait in the download ad pop-up'], ['popup_message', 'Message in the ad pop-up'], ['donate_label', 'Donate button text'], ['donate_url', 'Donate link (PayPal, Buy Me a Coffee…)'], ['analytics_id', 'Analytics ID (GA: G-XXXXXXX, Plausible: yourdomain.com)']];
  const nfields = [['telegram_bot_token', 'Telegram bot token'], ['telegram_chat_id', 'Telegram chat ID (alerts to you)'], ['telegram_channel_id', 'Telegram channel ID or @channel (announcements)'], ['resend_api_key', 'Resend API key (for email)'], ['notify_email_to', 'Send alerts to email'], ['notify_email_from', 'Email “from” (e.g. Appshub <alerts@yourdomain.com>)'], ['discord_webhook_url', 'Discord webhook URL'], ['slack_webhook_url', 'Slack webhook URL'], ['catbox_userhash', 'Catbox.moe userhash (from catbox.moe/manage — optional)']];
  const saveLegal = async () => { const { error } = await sb.from('ah_settings').upsert([{ key: 'terms_content', value: s.terms_content || '' }, { key: 'privacy_content', value: s.privacy_content || '' }]); toast(error ? error.message : 'Saved'); };
  const saveHost = async () => { const { error } = await sb.from('ah_settings').upsert({ key: 'file_host', value: s.file_host || 'supabase' }); if (error) return toast(error.message); ADMIN_UPLOAD_CFG = null; loadAdminUploadCfg(); toast('Saved'); };
  return (<div className="cols"><div><div className="card pad"><h2>Site settings</h2><form className="form" onSubmit={async (e) => { e.preventDefault(); const keys = [...fields.map((x) => x[0]), 'donate_text', 'review_mode', 'download_captcha', 'analytics_provider', 'cookie_notice']; const { error } = await sb.from('ah_settings').upsert(keys.map((k) => ({ key: k, value: s[k] || '' }))); toast(error ? error.message : 'Saved — refresh the site to see changes'); }}>
    {fields.map(([k, l]) => <label key={k}>{l}<input value={s[k] || ''} onChange={(e) => setS({ ...s, [k]: e.target.value })} /></label>)}
    <label>Donate instructions (e.g. mobile money number)<textarea rows={3} value={s.donate_text || ''} onChange={(e) => setS({ ...s, donate_text: e.target.value })} /></label>
    <label>New reviews & questions<select value={s.review_mode || 'auto'} onChange={(e) => setS({ ...s, review_mode: e.target.value })}><option value="auto">Publish immediately</option><option value="manual">Hold until I approve</option></select></label>
    <label>Human check before downloads<select value={s.download_captcha || 'off'} onChange={(e) => setS({ ...s, download_captcha: e.target.value })}><option value="off">Off</option><option value="on">On (small maths question)</option></select></label>
    <label>Analytics<select value={s.analytics_provider || 'none'} onChange={(e) => setS({ ...s, analytics_provider: e.target.value })}><option value="none">None</option><option value="ga">Google Analytics</option><option value="plausible">Plausible</option></select></label>
    <label className="check"><input type="checkbox" checked={s.cookie_notice !== 'off'} onChange={(e) => setS({ ...s, cookie_notice: e.target.checked ? 'on' : 'off' })} /> Show a cookie consent banner when analytics is on</label>
    <button className="btn">Save settings</button></form></div>
    <div className="card pad"><h2>Terms of Service</h2><MdEditor rows={8} value={s.terms_content} onChange={(v) => setS({ ...s, terms_content: v })} /><button className="btn" style={{ marginTop: 10 }} onClick={saveLegal}>Save legal pages</button></div>
    <div className="card pad"><h2>Privacy Policy</h2><MdEditor rows={8} value={s.privacy_content} onChange={(v) => setS({ ...s, privacy_content: v })} /><button className="btn" style={{ marginTop: 10 }} onClick={saveLegal}>Save legal pages</button></div>
    <div className="card pad"><h2>📦 File storage</h2><p className="muted small">Where uploaded icons, screenshots and download files go. Catbox.moe is free and has no 100 MB cap (200 MB), but its own rules say it isn’t meant for hosting files for a business/commercial site without asking them first — use at your own judgment. Set the userhash in Alerts & notifications, below.</p>
      <select value={s.file_host || 'supabase'} onChange={(e) => setS({ ...s, file_host: e.target.value })}><option value="supabase">Supabase storage (default, 100 MB)</option><option value="catbox">Catbox.moe (200 MB, uploads from this admin session only)</option></select>
      <button className="btn" style={{ marginTop: 10 }} onClick={saveHost}>Save file storage</button></div></div>
    <div className="card pad"><h2>🔔 Alerts & notifications</h2><p className="muted small">Instant alerts to you (Telegram/email) plus keys for announcements. Stored privately — only owners can read them.</p>
      <form className="form" onSubmit={async (e) => { e.preventDefault(); const { error } = await sb.from('ah_secrets').upsert(nfields.map(([k]) => ({ key: k, value: (sec[k] || '').trim() }))); toast(error ? error.message : 'Saved'); }}>
        {nfields.map(([k, l]) => <label key={k}>{l}<input type={/token|key|hash/.test(k) ? 'password' : 'text'} autoComplete="off" value={sec[k] || ''} onChange={(e) => setSec({ ...sec, [k]: e.target.value })} /></label>)}
        <div className="row"><button className="btn">Save</button><button type="button" className="btn ghost" onClick={async () => { const { error } = await sb.from('ah_requests').insert({ kind: 'contact', name: 'Appshub', message: 'This is a test notification 🎉' }); toast(error ? error.message : 'Test sent — check Telegram / email'); }}>Send test alert</button></div></form></div></div>);
}

/* ---------- backup (owner) ---------- */
function AdminBackup() {
  const toast = useToast(); const [busy, setBusy] = useState('');
  const tables = [['ah_apps', 'Apps'], ['ah_versions', 'Versions'], ['ah_screenshots', 'Screenshots'], ['ah_reviews', 'Reviews'], ['ah_comments', 'Q&A'], ['ah_requests', 'Requests'], ['ah_banners', 'Banners'], ['ah_collections', 'Collections'], ['ah_subscribers', 'Email subscribers'], ['ah_downloads', 'Downloads log']];
  const csv = async (t) => { setBusy(t); try { saveFile(`${t}-${new Date().toISOString().slice(0, 10)}.csv`, toCSV(await fetchAll(t))); } catch (e) { toast(e.message); } setBusy(''); };
  const all = async () => { setBusy('all'); try { const out = {}; for (const [t] of tables) out[t] = await fetchAll(t); saveFile(`appshub-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(out, null, 2), 'application/json'); } catch (e) { toast(e.message); } setBusy(''); };
  return (<div className="cols"><div className="card pad narrow"><h2>💾 Backup & export</h2><p className="muted">Download your data as CSV (opens in Excel/Sheets) or everything as one JSON file.</p>
    <div className="dl-list">{tables.map(([t, l]) => <button key={t} className="btn ghost" disabled={!!busy} onClick={() => csv(t)}>{busy === t ? 'Exporting…' : `Export ${l} (CSV)`}</button>)}<button className="btn" disabled={!!busy} onClick={all}>{busy === 'all' ? 'Preparing…' : 'Download full backup (JSON)'}</button></div></div>
    <AdminImport /></div>);
}

/* ---------- parse our own CSV format (matches toCSV's quoting) ---------- */
function parseCSV(text) {
  const rows = []; let row = [], field = '', inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) { if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else inQ = false; } else field += c; }
    else if (c === '"') inQ = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(field); rows.push(row); row = []; field = ''; }
    else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  if (!rows.length) return [];
  const head = rows[0];
  return rows.slice(1).filter((r) => r.length > 1 || r[0]).map((r) => Object.fromEntries(head.map((h, i) => [h, r[i]])));
}
const APP_IMPORT_COLS = ['name', 'slug', 'icon_url', 'short_desc', 'about', 'features', 'category', 'developer', 'version', 'size', 'platform', 'content_rating', 'download_url', 'sha256', 'extra_links', 'whats_new', 'seo_keywords', 'seo_description', 'is_featured', 'is_published', 'is_verified'];
function AdminImport() {
  const toast = useToast(); const [busy, setBusy] = useState(false); const [result, setResult] = useState(null);
  const onFile = async (file) => {
    if (!file) return; setBusy(true); setResult(null);
    try {
      const text = await file.text(); const rows = parseCSV(text);
      const clean = rows.map((r) => {
        const row = {}; for (const c of APP_IMPORT_COLS) if (r[c] !== undefined) row[c] = r[c];
        row.slug = slugify(row.slug || row.name || ''); row.name = (row.name || '').trim();
        if (!row.slug || !row.name || RESERVED.includes(row.slug)) return null;
        for (const b of ['is_featured', 'is_published', 'is_verified']) if (row[b] !== undefined) row[b] = String(row[b]).toLowerCase() === 'true';
        for (const j of ['features']) if (row[j]) { try { row.features = JSON.parse(row.features); } catch { row.features = lines(row.features); } }
        if (row.extra_links) { try { row.extra_links = JSON.parse(row.extra_links); } catch { row.extra_links = []; } }
        return row;
      }).filter(Boolean);
      if (!clean.length) { toast('No valid rows found — check the column headers match an exported Apps CSV.'); setBusy(false); return; }
      const { error, count } = await sb.from('ah_apps').upsert(clean, { onConflict: 'slug' }).select('id', { count: 'exact' });
      setBusy(false); if (error) return toast(error.message);
      sb.rpc('ah_log', { p_action: 'import_csv', p_detail: clean.length + ' apps' }).then(() => {});
      setResult({ total: rows.length, imported: clean.length }); toast('Import complete');
    } catch (e) { setBusy(false); toast(e.message); }
  };
  return (<div className="card pad narrow"><h2>📥 Import apps from CSV</h2><p className="muted small">Use a CSV with the same columns as “Export Apps (CSV)”. Matching an existing app’s link name updates it instead of duplicating it. Screenshots and version history are not imported.</p>
    <input type="file" accept=".csv,text/csv" disabled={busy} onChange={(e) => { onFile(e.target.files[0]); e.target.value = ''; }} />
    {busy && <p className="muted small">Importing…</p>}{result && <p className="small">Read {result.total} row(s), imported {result.imported}.</p>}</div>);
}
