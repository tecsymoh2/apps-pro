/* =========================================================
   /developer — no account needed. A developer enters a name
   and (optional) website, gets a secret key back, and uses
   that key on every later visit to manage their apps. The key
   is never emailed or recoverable — losing it means asking the
   Appshub admin to issue a new one (Admin → Developers).
   ========================================================= */
const DEV_KEY_LS = 'ah_dev_key';
const draftKey = (id) => `ah_dev_draft:${id || 'new'}`;

function DeveloperPortal() {
  const [key, setKey] = useState(() => { try { return localStorage.getItem(DEV_KEY_LS) || ''; } catch { return ''; } });
  const [me, setMe] = useState(undefined);
  const load = useCallback((k) => {
    if (!k) return setMe(null);
    sb.rpc('ah_dev_me', { p_key: k }).then(({ data, error }) => {
      if (error || !data) { try { localStorage.removeItem(DEV_KEY_LS); } catch {} setKey(''); setMe(null); }
      else setMe(data);
    });
  }, []);
  useEffect(() => { document.title = 'Developer portal — Appshub'; load(key); }, []);
  const onKey = (k) => { try { localStorage.setItem(DEV_KEY_LS, k); } catch {} setKey(k); setMe(undefined); load(k); };
  const logout = () => { try { localStorage.removeItem(DEV_KEY_LS); } catch {} setKey(''); setMe(null); };
  if (me === undefined && key) return <Loader />;
  if (!me) return <DevKeyGate onKey={onKey} />;
  if (me.suspended) return (<div className="wrap page"><div className="card pad narrow center"><h2>Account suspended</h2><p className="muted">An Appshub admin has suspended this developer account, so your apps aren't visible to visitors right now. Use the Contact page if you think this is a mistake.</p><button className="btn ghost" onClick={logout}>Log out</button></div></div>);
  return <DevDashboard me={me} dkey={key} onKey={onKey} onLogout={logout} />;
}

function DevKeyGate({ onKey }) {
  const toast = useToast(); const [mode, setMode] = useState('new');
  const [name, setName] = useState(''); const [site, setSite] = useState(''); const [pasted, setPasted] = useState('');
  const [busy, setBusy] = useState(false); const [err, setErr] = useState(''); const [issued, setIssued] = useState(''); const [saved, setSaved] = useState(false);
  const register = async (e) => {
    e.preventDefault(); setBusy(true); setErr('');
    const { data, error } = await sb.rpc('ah_dev_register', { p_name: name.trim(), p_website: site.trim() });
    setBusy(false); if (error) return setErr(error.message.replace(/^.*?:\s*/, ''));
    setIssued(data.key);
  };
  const useExisting = async (e) => {
    e.preventDefault(); if (!pasted.trim()) return; setBusy(true); setErr('');
    const { data, error } = await sb.rpc('ah_dev_me', { p_key: pasted.trim() });
    setBusy(false); if (error || !data) return setErr('That key isn\u2019t valid.');
    onKey(pasted.trim());
  };
  if (issued) return (<div className="wrap page"><div className="card pad narrow"><h2>\ud83d\udd11 Your developer key</h2>
    <div className="alert warn"><Ico n="warn" s={18} /> Save this somewhere safe now. It will not be shown again, there's no email tied to it, and anyone with it can manage your apps.</div>
    <div className="keybox"><code>{issued}</code><button type="button" className="btn sm" onClick={() => { navigator.clipboard.writeText(issued); toast('Copied'); }}>Copy</button></div>
    <label className="check" style={{ marginTop: 14 }}><input type="checkbox" checked={saved} onChange={(e) => setSaved(e.target.checked)} /> I've saved my key somewhere safe</label>
    <button className="btn big" style={{ marginTop: 10 }} disabled={!saved} onClick={() => onKey(issued)}>Continue to my dashboard</button></div></div>);
  return (<div className="wrap page"><div className="card pad narrow"><h2>\ud83d\udc69\u200d\ud83d\udcbb Developer portal</h2><p className="muted">No account or email needed \u2014 add your own apps to Appshub with just a key.</p>
    <div className="chips" style={{ marginBottom: 12 }}><button className={'chip' + (mode === 'new' ? ' active' : '')} onClick={() => { setMode('new'); setErr(''); }}>Get a key</button><button className={'chip' + (mode === 'existing' ? ' active' : '')} onClick={() => { setMode('existing'); setErr(''); }}>I have a key</button></div>
    {mode === 'new' ? (<form className="form" onSubmit={register}>
      <label>Your name<input required minLength={2} maxLength={80} value={name} onChange={(e) => setName(e.target.value)} /></label>
      <label>Website (optional)<input type="url" maxLength={300} value={site} onChange={(e) => setSite(e.target.value)} placeholder="https://\u2026" /></label>
      {err && <div className="alert">{err}</div>}<button className="btn" disabled={busy}>{busy ? 'Please wait\u2026' : 'Get my key'}</button></form>) : (
      <form className="form" onSubmit={useExisting}><label>Paste your key<input required value={pasted} onChange={(e) => setPasted(e.target.value)} placeholder="ahk_\u2026" autoComplete="off" /></label>
        {err && <div className="alert">{err}</div>}<button className="btn" disabled={busy}>{busy ? 'Checking\u2026' : 'Continue'}</button></form>)}
  </div></div>);
}

const DEV_TABS = [['apps', '\ud83d\udce6 My apps'], ['stats', '\ud83d\udcca Stats'], ['reviews', '\u2b50 Reviews'], ['comments', '\ud83d\udcac Q&A'], ['profile', '\ud83d\udc64 Profile'], ['key', '\ud83d\udd11 My key']];
function DevDashboard({ me, dkey, onKey, onLogout }) {
  const [tab, setTab] = useState('apps'); const [apps, setApps] = useState(null); const [edit, setEdit] = useState(null);
  const loadApps = useCallback(() => sb.rpc('ah_dev_apps', { p_key: dkey }).then(({ data }) => setApps(data || [])), [dkey]);
  useEffect(() => { loadApps(); }, [loadApps]);
  return (<div className="wrap page"><div className="row between"><h1>\ud83d\udc69\u200d\ud83d\udcbb {me.name}</h1><button className="btn ghost" onClick={onLogout}>Log out</button></div>
    <nav className="tabs">{DEV_TABS.map(([k, l]) => <button key={k} className={'tab' + (k === tab ? ' active' : '')} onClick={() => { setTab(k); setEdit(null); }}>{l}</button>)}</nav>
    {tab === 'apps' && (edit ? <DevAppForm app={edit === 'new' ? null : edit} dkey={dkey} devId={me.id} onClose={() => { setEdit(null); loadApps(); }} /> : (
      !apps ? <Loader /> : (<div className="card pad">
        <div className="row between"><h2>My apps ({apps.length})</h2><button className="btn" onClick={() => setEdit('new')}>+ Add app</button></div>
        {apps.length ? <div className="table-wrap"><table className="table"><thead><tr><th>App</th><th>Version</th><th>Downloads</th><th>Rating</th><th>Status</th><th></th></tr></thead><tbody>
          {apps.map((a) => <tr key={a.id}><td><div className="row"><Icon app={a} size={36} /><div><b>{a.name}</b> {a.is_verified && <Verified />}<div className="muted small">/{a.slug}</div></div></div></td><td>{a.version}</td><td>{fmtNum(a.downloads)}</td>
            <td>{a.review_count ? <>{a.avg_rating} <Ico n="star" s={11} /> ({a.review_count})</> : '\u2013'}</td>
            <td>{a.is_published ? 'Live' : 'Unpublished'}{a.broken_reports > 0 && <span className="chip sm warnchip">\u26a0 {a.broken_reports}</span>}</td>
            <td className="actions"><button className="btn sm ghost" onClick={() => { navigator.clipboard.writeText(appUrl(a.slug)); }}>Copy link</button><button className="btn sm" onClick={() => setEdit(a)}>Edit</button></td></tr>)}
        </tbody></table></div> : <div className="wizard card pad"><h3>\ud83d\udc4b Welcome!</h3><p className="muted">You haven't added any apps yet.</p><button className="btn big" onClick={() => setEdit('new')}>+ Add your first app</button></div>}
      </div>)
    ))}
    {tab === 'stats' && <DevStats dkey={dkey} apps={apps} />}
    {tab === 'reviews' && <DevReviews dkey={dkey} />}
    {tab === 'comments' && <DevComments dkey={dkey} />}
    {tab === 'profile' && <DevProfileForm me={me} dkey={dkey} />}
    {tab === 'key' && <DevKeyPanel dkey={dkey} onKey={onKey} onLogout={onLogout} />}
  </div>);
}

function DevProfileForm({ me, dkey }) {
  const toast = useToast(); const [name, setName] = useState(me.name || ''); const [bio, setBio] = useState(me.bio || ''); const [site, setSite] = useState(me.website || ''); const [busy, setBusy] = useState(false);
  const save = async (e) => { e.preventDefault(); setBusy(true); const { error } = await sb.rpc('ah_dev_update_profile', { p_key: dkey, p_name: name, p_bio: bio, p_website: site }); setBusy(false); if (error) return toast(error.message.replace(/^.*?:\s*/, '')); toast('Saved'); };
  return (<div className="card pad narrow"><h2>Your developer profile</h2><p className="muted small">Shown to Appshub admins. \u201cOffered by\u201d on your app pages uses the developer name you set per app.</p>
    <form className="form" onSubmit={save}><label>Display name<input required minLength={2} value={name} onChange={(e) => setName(e.target.value)} maxLength={80} /></label>
      <label>Bio<textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} maxLength={1000} /></label>
      <label>Website<input type="url" value={site} onChange={(e) => setSite(e.target.value)} placeholder="https://\u2026" maxLength={300} /></label>
      <button className="btn" disabled={busy}>{busy ? 'Saving\u2026' : 'Save profile'}</button></form></div>);
}

function DevKeyPanel({ dkey, onKey, onLogout }) {
  const toast = useToast(); const [show, setShow] = useState(false); const [busy, setBusy] = useState(false); const [del, setDel] = useState('');
  const rotate = async () => { if (!confirm('Generate a new key? Your current key will stop working immediately \u2014 update anywhere you saved it.')) return; setBusy(true); const { data, error } = await sb.rpc('ah_dev_rotate_key', { p_key: dkey }); setBusy(false); if (error) return toast(error.message); onKey(data); setShow(true); toast('New key generated \u2014 copy it below'); };
  const del_ = async () => { if (del !== 'DELETE') return; if (!confirm('This permanently deletes your account and every app you published. Continue?')) return; setBusy(true); const { error } = await sb.rpc('ah_dev_delete_account', { p_key: dkey }); setBusy(false); if (error) return toast(error.message); onLogout(); };
  return (<div className="cols"><div className="card pad"><h2>\ud83d\udd11 My key</h2><p className="muted small">This key is how you get back into your apps \u2014 there's no email or password recovery.</p>
    <div className="keybox">{show ? <code>{dkey}</code> : <code>\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022</code>}<button type="button" className="btn sm ghost" onClick={() => setShow(!show)}>{show ? 'Hide' : 'Show'}</button><button type="button" className="btn sm" onClick={() => { navigator.clipboard.writeText(dkey); toast('Copied'); }}>Copy</button></div>
    <button className="btn ghost" style={{ marginTop: 12 }} disabled={busy} onClick={rotate}>Generate a new key</button></div>
    <div className="card pad"><h2>\u26a0\ufe0f Danger zone</h2><p className="muted small">Deletes your profile and every app you've published. This cannot be undone.</p>
      <div className="form"><label>Type DELETE to confirm<input value={del} onChange={(e) => setDel(e.target.value)} /></label><button className="btn danger" disabled={del !== 'DELETE' || busy} onClick={del_}>Delete my account</button></div></div></div>);
}

function DevStats({ dkey, apps }) {
  const [d, setD] = useState(null);
  useEffect(() => { sb.rpc('ah_dev_stats', { p_key: dkey, p_days: 30 }).then(({ data }) => setD(data)); }, [dkey]);
  if (!d || !apps) return <Loader />;
  const byId = Object.fromEntries(apps.map((a) => [a.id, a]));
  const days = Array.from({ length: 14 }, (_, i) => { const t = new Date(Date.now() - (13 - i) * 864e5); return { k: t.toISOString().slice(0, 10), label: t.getDate(), n: 0 }; });
  const perApp = {}; const countries = {};
  (d.daily || []).forEach((r) => { const x = days.find((x) => x.k === r.day); if (x) x.n += r.n; perApp[r.app_id] = (perApp[r.app_id] || 0) + r.n; });
  (d.countries || []).forEach((r) => { countries[r.country] = (countries[r.country] || 0) + r.n; });
  const topCountries = Object.entries(countries).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const maxD = Math.max(1, ...days.map((x) => x.n)); const maxC = Math.max(1, ...topCountries.map((c) => c[1]));
  const totalDownloads = apps.reduce((a, b) => a + Number(b.downloads), 0); const totalViews = apps.reduce((a, b) => a + Number(b.views || 0), 0);
  return (<>
    <div className="stats">{[['Apps', apps.length], ['Total downloads', fmtNum(totalDownloads)], ['App views', fmtNum(totalViews)], ['Last 30 days', fmtNum((d.daily || []).reduce((a, b) => a + b.n, 0))]].map(([k, v]) => <div key={k} className="card pad stat"><b>{v}</b><span className="muted">{k}</span></div>)}</div>
    <div className="cols"><div className="card pad"><h3>Downloads \u2014 last 14 days</h3><div className="chart">{days.map((x) => <div key={x.k} className="col" title={`${x.n} downloads`}><i style={{ height: (x.n / maxD) * 100 + '%' }} /><small>{x.label}</small></div>)}</div>
      <h3 style={{ marginTop: 18 }}>By app (30 days)</h3>{Object.keys(perApp).length ? Object.entries(perApp).sort((a, b) => b[1] - a[1]).map(([id, n]) => <div key={id} className="bar-row wide"><span>{byId[id]?.name || '\u2014'}</span><div className="bar"><i style={{ width: (n / Math.max(...Object.values(perApp))) * 100 + '%' }} /></div><b>{n}</b></div>) : <p className="muted small">No downloads in the last 30 days yet.</p>}</div>
      <div className="card pad"><h3>\ud83c\udf0d Top countries (30 days)</h3>{topCountries.length ? topCountries.map(([c, n]) => <div key={c} className="bar-row wide"><span>{c === '??' ? 'Unknown' : countryName(c)}</span><div className="bar"><i style={{ width: (n / maxC) * 100 + '%' }} /></div><b>{n}</b></div>) : <p className="muted small">No data yet.</p>}</div></div></>);
}

function DevReviews({ dkey }) {
  const toast = useToast(); const [rows, setRows] = useState(null); const [draft, setDraft] = useState({});
  const load = () => sb.rpc('ah_dev_reviews', { p_key: dkey }).then(({ data }) => setRows(data || []));
  useEffect(() => { load(); }, [dkey]);
  if (!rows) return <Loader />;
  const reply = async (r, text) => { const { error } = await sb.rpc('ah_dev_reply_review', { p_key: dkey, p_id: r.id, p_text: text }); if (error) return toast(error.message); toast(text ? 'Reply posted' : 'Reply removed'); setDraft({ ...draft, [r.id]: undefined }); load(); };
  return (<div className="card pad"><h2>Reviews on your apps ({rows.length})</h2>
    {rows.length ? rows.map((r) => <div key={r.id} className="review"><div className="row between"><div><b>{r.name}</b> on <Link to={`/${r.app_slug}/reviews`}>{r.app_name}</Link> <Stars value={r.rating} size={13} /> <span className="muted small">{timeAgo(r.created_at)}</span></div></div><p className="pre">{r.comment}</p>
      {r.admin_reply && draft[r.id] === undefined && <div className="reply"><b>Your reply</b><p className="pre">{r.admin_reply}</p><button className="btn sm ghost" onClick={() => setDraft({ ...draft, [r.id]: r.admin_reply })}>Edit</button> <button className="btn sm danger" onClick={() => reply(r, '')}>Remove</button></div>}
      {!r.admin_reply && draft[r.id] === undefined && <button className="btn sm ghost" onClick={() => setDraft({ ...draft, [r.id]: '' })}>Reply</button>}
      {draft[r.id] !== undefined && <div className="form"><textarea rows={3} value={draft[r.id]} onChange={(e) => setDraft({ ...draft, [r.id]: e.target.value })} placeholder="Write a public reply\u2026" /><div className="row"><button className="btn sm" onClick={() => reply(r, draft[r.id].trim())}>Post reply</button><button className="btn sm ghost" onClick={() => setDraft({ ...draft, [r.id]: undefined })}>Cancel</button></div></div>}</div>) : <Empty>No reviews on your apps yet.</Empty>}</div>);
}

function DevComments({ dkey }) {
  const toast = useToast(); const [rows, setRows] = useState(null); const [draft, setDraft] = useState({});
  const load = () => sb.rpc('ah_dev_comments', { p_key: dkey }).then(({ data }) => setRows(data || []));
  useEffect(() => { load(); }, [dkey]);
  if (!rows) return <Loader />;
  const tops = rows.filter((r) => !r.parent_id); const kids = (id) => rows.filter((r) => r.parent_id === id);
  const reply = async (c) => { const message = (draft[c.id] || '').trim(); if (!message) return; const { error } = await sb.rpc('ah_dev_reply_comment', { p_key: dkey, p_parent_id: c.id, p_message: message }); if (error) return toast(error.message); setDraft({ ...draft, [c.id]: undefined }); toast('Reply posted'); load(); };
  return (<div className="card pad"><h2>Questions on your apps ({tops.length})</h2>
    {tops.length ? tops.map((c) => (<div key={c.id} className="thread">
      <div className="qa"><div className="rev-h"><span className="avatar">{c.name[0]?.toUpperCase()}</span><b>{c.name}</b> on <Link to={`/${c.app_slug}/questions`}>{c.app_name}</Link><span className="muted small">{timeAgo(c.created_at)}</span></div><p className="pre">{c.message}</p>
        {draft[c.id] === undefined ? <button className="btn sm ghost" onClick={() => setDraft({ ...draft, [c.id]: '' })}>Reply</button> : <div className="form"><textarea rows={2} value={draft[c.id]} onChange={(e) => setDraft({ ...draft, [c.id]: e.target.value })} /><div className="row"><button className="btn sm" onClick={() => reply(c)}>Send</button><button className="btn sm ghost" onClick={() => setDraft({ ...draft, [c.id]: undefined })}>Cancel</button></div></div>}</div>
      {kids(c.id).map((k) => <div key={k.id} className="qa child"><div className="rev-h"><span className={'avatar' + (k.is_admin ? ' dev' : '')}>{k.name[0]?.toUpperCase()}</span><b>{k.name}</b>{k.is_admin && <span className="chip sm">Developer</span>}<span className="muted small">{timeAgo(k.created_at)}</span></div><p className="pre">{k.message}</p></div>)}
    </div>)) : <Empty>No questions on your apps yet.</Empty>}</div>);
}

/* ---------- add / edit app, with draft autosave so a background file picker
   (which some mobile browsers use as an excuse to reload the page) never loses work ---------- */
const blankDevApp = { name: '', slug: '', icon_url: '', short_desc: '', about: '', features: '', category: 'General', developer: '', version: '1.0', size: '', platform: 'Android', content_rating: 'Everyone', download_url: '', sha256: '', extra_links: '', whats_new: '', seo_keywords: '', seo_description: '', is_published: false };
function DevAppForm({ app, dkey, devId, onClose }) {
  const toast = useToast(); const [saved, setSaved] = useState(app);
  const dKey = draftKey(app?.id);
  const [f, setF] = useState(() => {
    const base = app ? { ...blankDevApp, ...app, features: (app.features || []).join('\n'), extra_links: (app.extra_links || []).map((l) => `${l.label} | ${l.url}`).join('\n') } : blankDevApp;
    const draft = lsGet(dKey, null);
    return draft || base;
  });
  const [restored] = useState(() => !!lsGet(dKey, null));
  useEffect(() => { if (restored) toast('Restored your unsaved draft'); }, []);
  useEffect(() => { lsSet(dKey, f); }, [f]);
  const [shots, setShots] = useState([]); const [versions, setVersions] = useState([]); const [busy, setBusy] = useState(''); const [slugTouched, setSlugTouched] = useState(!!app);
  const [nv, setNv] = useState({ version: '', size: '', download_url: '', sha256: '', notes: '' }); const dragI = useRef(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const loadShots = (id) => sb.from('ah_screenshots').select('*').eq('app_id', id).order('sort').then(({ data }) => setShots(data || []));
  const loadVers = (id) => sb.from('ah_versions').select('*').eq('app_id', id).order('created_at', { ascending: false }).then(({ data }) => setVersions(data || []));
  useEffect(() => { if (saved) { loadShots(saved.id); loadVers(saved.id); } }, [saved?.id]);
  const onName = (e) => { const name = e.target.value; setF({ ...f, name, slug: slugTouched ? f.slug : slugify(name) }); };
  const up = async (file, apply, folder, hashTo) => { if (!file) return; setBusy('Uploading ' + file.name + '\u2026'); try { let fx = file; if (folder.includes('icons') || folder.includes('screenshots')) fx = await optimizeImage(file, folder.includes('icons') ? 512 : 1600); apply(await uploadFile(fx, folder)); if (hashTo) hashTo(await sha256File(file)); toast('Uploaded'); } catch (e) { toast('Upload failed: ' + e.message); } setBusy(''); };
  const save = async (e) => {
    e.preventDefault();
    const row = { name: f.name.trim(), slug: slugify(f.slug || f.name), icon_url: f.icon_url || '', short_desc: f.short_desc, about: f.about, features: lines(f.features), category: f.category.trim() || 'General', developer: f.developer, version: f.version, size: f.size, platform: f.platform, content_rating: f.content_rating, download_url: f.download_url.trim(), sha256: f.sha256 || '', extra_links: lines(f.extra_links).map((l) => { const [label, ...u] = l.split('|'); return { label: (label || '').trim() || 'Mirror', url: u.join('|').trim() }; }), whats_new: f.whats_new, seo_keywords: f.seo_keywords || '', seo_description: f.seo_description || '', is_published: f.is_published };
    setBusy('Saving\u2026'); const { data, error } = await sb.rpc('ah_dev_save_app', { p_key: dkey, p_id: saved?.id || null, p_data: row }); setBusy('');
    if (error) return toast(error.message.replace(/^.*?:\s*/, ''));
    setSaved(data); setF((x) => ({ ...x, slug: data.slug })); try { localStorage.removeItem(dKey); } catch {}
    toast(saved ? 'Changes saved' : 'App created \u2014 add a screenshot below, then publish it');
  };
  const addShots = async (files) => { for (const file of files) { setBusy('Uploading ' + file.name + '\u2026'); try { const small = await optimizeImage(file, 1600); const url = await uploadFile(small, `dev/${devId}/screenshots`); const { error } = await sb.rpc('ah_dev_add_shot', { p_key: dkey, p_app_id: saved.id, p_url: url }); if (error) throw error; } catch (e) { toast('Failed: ' + e.message); } } setBusy(''); loadShots(saved.id); };
  const delShot = async (s) => { await sb.rpc('ah_dev_delete_shot', { p_key: dkey, p_id: s.id }); loadShots(saved.id); };
  const reorder = async (from, to) => { if (to < 0 || to >= shots.length || from === to) return; const arr = [...shots]; const [m] = arr.splice(from, 1); arr.splice(to, 0, m); setShots(arr); await sb.rpc('ah_dev_reorder_shots', { p_key: dkey, p_app_id: saved.id, p_ids: arr.map((s) => s.id) }); };
  const releaseNew = async () => { const { data, error } = await sb.rpc('ah_dev_release_version', { p_key: dkey, p_app_id: saved.id, p_version: nv.version, p_size: nv.size, p_download_url: nv.download_url, p_sha256: nv.sha256, p_notes: nv.notes }); if (error) return toast(error.message.replace(/^.*?:\s*/, '')); setSaved(data); setF((x) => ({ ...x, version: data.version, size: data.size, download_url: data.download_url, whats_new: data.whats_new })); setNv({ version: '', size: '', download_url: '', sha256: '', notes: '' }); loadVers(saved.id); toast('New version released \u2014 old one moved to history'); };
  const addOld = async () => { const { error } = await sb.rpc('ah_dev_add_old_version', { p_key: dkey, p_app_id: saved.id, p_version: nv.version, p_size: nv.size, p_download_url: nv.download_url, p_sha256: nv.sha256, p_notes: nv.notes }); if (error) return toast(error.message.replace(/^.*?:\s*/, '')); setNv({ version: '', size: '', download_url: '', sha256: '', notes: '' }); loadVers(saved.id); toast('Added to version history'); };
  return (<div className="card pad"><div className="row between"><h2>{saved ? `Edit ${saved.name}` : 'Add app'}</h2><button className="btn ghost" onClick={() => { try { localStorage.removeItem(dKey); } catch {} onClose(); }}>\u2190 Back to my apps</button></div>
    {saved && <p className="muted small">Link: <a href={appUrl(saved.slug)} target="_blank" rel="noreferrer">{appUrl(saved.slug)}</a></p>}
    <form className="form two" onSubmit={save}>
      <label>App name<input required value={f.name} onChange={onName} /></label>
      <label>Link name (URL)<input required value={f.slug} onChange={(e) => { setSlugTouched(true); setF({ ...f, slug: slugify(e.target.value) }); }} /></label>
      <label>Category<input value={f.category} onChange={set('category')} placeholder="Games, Tools, Social\u2026" /></label><label>Developer / studio name<input value={f.developer} onChange={set('developer')} placeholder="Shown on the app page" /></label>
      <label>Version<input value={f.version} onChange={set('version')} /></label><label>Size<input value={f.size} onChange={set('size')} placeholder="e.g. 48 MB" /></label>
      <label>Platform<input value={f.platform} onChange={set('platform')} /></label><label>Content rating<input value={f.content_rating} onChange={set('content_rating')} placeholder="Everyone, 12+, 18+" /></label>
      <label className="full">Icon<input value={f.icon_url || ''} onChange={set('icon_url')} placeholder="URL or upload \u2193" /><input type="file" accept="image/*" onChange={(e) => up(e.target.files[0], (u) => setF((x) => ({ ...x, icon_url: u })), `dev/${devId}/icons`)} /></label>
      <label className="full">Short description<input value={f.short_desc} onChange={set('short_desc')} maxLength={200} /></label>
      <div className="full"><label>About this app</label><MdEditor rows={7} value={f.about} onChange={(v) => setF((x) => ({ ...x, about: v }))} /></div>
      <label className="full">Features (one per line)<textarea rows={4} value={f.features} onChange={set('features')} /></label>
      <div className="full"><label>What's new</label><MdEditor rows={3} value={f.whats_new} onChange={(v) => setF((x) => ({ ...x, whats_new: v }))} /></div>
      <label className="full">Download link<input value={f.download_url} onChange={set('download_url')} placeholder="https://\u2026 or upload a file \u2193" /><input type="file" onChange={(e) => up(e.target.files[0], (u) => setF((x) => ({ ...x, download_url: u })), `dev/${devId}/files`, (h) => setF((x) => ({ ...x, sha256: h })))} /><small className="muted">Up to 100 MB per file, 300 MB total across everything you upload.</small></label>
      <label className="full">Extra download links / mirrors (Label | URL, one per line)<textarea rows={2} value={f.extra_links} onChange={set('extra_links')} /></label>
      <label className="full">SEO description<input value={f.seo_description || ''} onChange={set('seo_description')} maxLength={200} /></label>
      <label className="check"><input type="checkbox" checked={f.is_published} onChange={set('is_published')} /> Published (visible to visitors)</label>
      <div className="full row"><button className="btn" disabled={!!busy}>{saved ? 'Save changes' : 'Create app'}</button>{busy && <span className="muted">{busy}</span>}</div></form>
    {saved && <><hr /><h3>Screenshots <span className="muted small">(\u25c0 \u25b6 to reorder)</span></h3><input type="file" accept="image/*" multiple onChange={(e) => { addShots([...e.target.files]); e.target.value = ''; }} />
      <div className="shots-admin">{shots.map((s, i) => <div key={s.id}><img src={s.url} alt="" /><div className="row"><button className="btn sm ghost" onClick={() => reorder(i, i - 1)}>\u25c0</button><button className="btn sm ghost" onClick={() => reorder(i, i + 1)}>\u25b6</button><button className="btn sm danger" onClick={() => delShot(s)}>\u2715</button></div></div>)}</div>
      <hr /><h3>Version history</h3><p className="muted small">Current version: <b>{saved.version}</b>.</p>
      <div className="form two"><label>Version<input value={nv.version} onChange={(e) => setNv({ ...nv, version: e.target.value })} placeholder="e.g. 2.1" /></label><label>Size<input value={nv.size} onChange={(e) => setNv({ ...nv, size: e.target.value })} /></label>
        <label className="full">Download link<input value={nv.download_url} onChange={(e) => setNv({ ...nv, download_url: e.target.value })} /><input type="file" onChange={(e) => up(e.target.files[0], (u) => setNv((x) => ({ ...x, download_url: u })), `dev/${devId}/files`, (h) => setNv((x) => ({ ...x, sha256: h })))} /></label>
        <div className="full"><label>Notes</label><MdEditor rows={3} value={nv.notes} onChange={(v) => setNv((x) => ({ ...x, notes: v }))} /></div>
        <div className="full row"><button className="btn" type="button" onClick={releaseNew}>Release new version</button><button className="btn ghost" type="button" onClick={addOld}>Add as older version</button></div></div>
      {versions.map((v) => <div key={v.id} className="review row between"><div><b>v{v.version}</b> <span className="muted small">{new Date(v.created_at).toLocaleDateString()} {v.size}</span></div><button className="btn sm danger" onClick={async () => { await sb.rpc('ah_dev_delete_version', { p_key: dkey, p_id: v.id }); loadVers(saved.id); }}>Delete</button></div>)}</>}
  </div>);
}
