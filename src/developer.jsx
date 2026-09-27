/* =========================================================
   /developer — self-service developer accounts
   Developers can add/edit/publish their own apps. Cannot set
   Featured or Verified (admin-only) — enforced by RLS, not just UI.
   ========================================================= */

function DeveloperPortal() {
  const [session, setSession] = useState(undefined); const [role, setRole] = useState(undefined);
  useEffect(() => { sb.auth.getSession().then(({ data }) => setSession(data.session)); const { data } = sb.auth.onAuthStateChange((_e, s) => setSession(s)); return () => data.subscription.unsubscribe(); }, []);
  useEffect(() => { document.title = 'Developer portal — Appshub'; }, []);
  useEffect(() => { if (session === undefined) return; if (!session) return setRole(null); setRole(undefined); sb.rpc('ah_my_role').then(({ data }) => setRole(data || null)); }, [session]);
  if (session === undefined || (session && role === undefined)) return <Loader />;
  if (!session) return <DevAuth />;
  if (role) return (<div className="wrap page"><div className="card pad narrow center"><h2>You're an admin</h2><p className="muted">Admin accounts manage apps from the Admin panel, not here.</p><Link to="/admin" className="btn">Go to Admin</Link></div></div>);
  return <DevDashboard session={session} />;
}

function DevAuth() {
  const toast = useToast(); const [mode, setMode] = useState('login'); const [email, setEmail] = useState(''); const [pass, setPass] = useState(''); const [name, setName] = useState('');
  const [busy, setBusy] = useState(false); const [err, setErr] = useState(''); const [sent, setSent] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setErr('');
    if (mode === 'signup') {
      const { data, error } = await sb.auth.signUp({ email: email.trim(), password: pass, options: { data: { name: name.trim() } } });
      setBusy(false); if (error) return setErr(error.message);
      if (data.session) { /* email confirmation is off — signed in immediately */ } else setSent(true);
    } else {
      const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password: pass });
      setBusy(false); if (error) return setErr('Wrong email or password.');
    }
  };
  if (sent) return (<div className="wrap page"><div className="card pad narrow center"><h2>Check your email</h2><p className="muted">We sent a confirmation link to <b>{email}</b>. Click it, then come back and log in.</p></div></div>);
  return (<div className="wrap page"><div className="card pad narrow"><h2>👩‍💻 Developer portal</h2><p className="muted">Add your own apps to Appshub and manage them yourself.</p>
    <div className="chips" style={{ marginBottom: 12 }}><button className={'chip' + (mode === 'login' ? ' active' : '')} onClick={() => setMode('login')}>Log in</button><button className={'chip' + (mode === 'signup' ? ' active' : '')} onClick={() => setMode('signup')}>Sign up</button></div>
    <form className="form" onSubmit={submit}>
      {mode === 'signup' && <label>Your name<input required value={name} onChange={(e) => setName(e.target.value)} maxLength={80} /></label>}
      <label>Email<input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
      <label>Password<input required type="password" minLength={8} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} value={pass} onChange={(e) => setPass(e.target.value)} /></label>
      {err && <div className="alert">{err}</div>}
      <button className="btn" disabled={busy}>{busy ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Log in'}</button></form></div></div>);
}

const blankDevApp = { name: '', slug: '', icon_url: '', short_desc: '', about: '', features: '', category: 'General', developer: '', version: '1.0', size: '', platform: 'Android', content_rating: 'Everyone', download_url: '', sha256: '', extra_links: '', whats_new: '', seo_keywords: '', seo_description: '', is_published: false };
function DevDashboard({ session }) {
  const toast = useToast(); const [apps, setApps] = useState(null); const [edit, setEdit] = useState(null); const [profile, setProfile] = useState(null); const [tab, setTab] = useState('apps');
  const load = () => sb.from('ah_apps').select('*').eq('owner_id', session.user.id).order('created_at', { ascending: false }).then(({ data }) => setApps(data || []));
  useEffect(() => { load(); sb.from('ah_developers').select('*').eq('id', session.user.id).maybeSingle().then(({ data }) => setProfile(data)); }, []);
  const del = async (a) => { if (!confirm(`Delete ${a.name}? This can’t be undone.`)) return; const { error } = await sb.from('ah_apps').delete().eq('id', a.id); if (error) toast(error.message); else { toast('Deleted'); load(); } };
  return (<div className="wrap page"><div className="row between"><h1>👩‍💻 Developer portal</h1><button className="btn ghost" onClick={() => sb.auth.signOut()}>Log out</button></div>
    <nav className="tabs"><button className={'tab' + (tab === 'apps' ? ' active' : '')} onClick={() => setTab('apps')}>My apps</button><button className={'tab' + (tab === 'profile' ? ' active' : '')} onClick={() => setTab('profile')}>Profile</button></nav>
    {tab === 'profile' && profile && <DevProfileForm profile={profile} onSaved={setProfile} />}
    {tab === 'apps' && (edit ? <DevAppForm app={edit === 'new' ? null : edit} session={session} onClose={() => { setEdit(null); load(); }} /> : (
      !apps ? <Loader /> : (<div className="card pad">
        <div className="row between"><h2>My apps ({apps.length})</h2><button className="btn" onClick={() => setEdit('new')}>+ Add app</button></div>
        {apps.length ? <div className="table-wrap"><table className="table"><thead><tr><th>App</th><th>Version</th><th>Downloads</th><th>Status</th><th></th></tr></thead><tbody>
          {apps.map((a) => <tr key={a.id}><td><div className="row"><Icon app={a} size={36} /><div><b>{a.name}</b> {a.is_verified && <Verified />}<div className="muted small">/{a.slug}</div></div></div></td><td>{a.version}</td><td>{fmtNum(a.downloads)}</td>
            <td>{a.is_published ? 'Live' : 'Unpublished'}{a.broken_reports > 0 && <span className="chip sm warnchip">⚠ {a.broken_reports}</span>}</td>
            <td className="actions"><button className="btn sm ghost" onClick={() => { navigator.clipboard.writeText(appUrl(a.slug)); toast('Link copied'); }}>Copy link</button><button className="btn sm" onClick={() => setEdit(a)}>Edit</button><button className="btn sm danger" onClick={() => del(a)}>Delete</button></td></tr>)}
        </tbody></table></div> : <div className="wizard card pad"><h3>👋 Welcome!</h3><p className="muted">You haven’t added any apps yet. Add one, fill in the details, and turn on “Published” whenever you’re ready.</p><button className="btn big" onClick={() => setEdit('new')}>+ Add your first app</button></div>}
      </div>)
    ))}</div>);
}

function DevProfileForm({ profile, onSaved }) {
  const toast = useToast(); const [name, setName] = useState(profile.name || ''); const [bio, setBio] = useState(profile.bio || ''); const [site, setSite] = useState(profile.website || ''); const [busy, setBusy] = useState(false);
  const save = async (e) => { e.preventDefault(); setBusy(true); const { error } = await sb.rpc('ah_dev_update_profile', { p_name: name, p_bio: bio, p_website: site }); setBusy(false); if (error) return toast(error.message); toast('Saved'); onSaved({ ...profile, name, bio, website: site }); };
  return (<div className="card pad narrow"><h2>Your developer profile</h2><p className="muted small">Shown to Appshub admins; “Offered by” on your app pages uses the developer name you set per app, not this profile.</p>
    <form className="form" onSubmit={save}><label>Display name<input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} /></label>
      <label>Bio<textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} maxLength={1000} /></label>
      <label>Website<input value={site} onChange={(e) => setSite(e.target.value)} placeholder="https://…" maxLength={300} /></label>
      <button className="btn" disabled={busy}>{busy ? 'Saving…' : 'Save profile'}</button></form></div>);
}

function DevAppForm({ app, session, onClose }) {
  const toast = useToast(); const [saved, setSaved] = useState(app);
  const [f, setF] = useState(() => app ? { ...blankDevApp, ...app, features: (app.features || []).join('\n'), extra_links: (app.extra_links || []).map((l) => `${l.label} | ${l.url}`).join('\n') } : blankDevApp);
  const [shots, setShots] = useState([]); const [busy, setBusy] = useState(''); const [slugTouched, setSlugTouched] = useState(!!app);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const loadShots = (id) => sb.from('ah_screenshots').select('*').eq('app_id', id).order('sort').then(({ data }) => setShots(data || []));
  useEffect(() => { if (saved) loadShots(saved.id); }, [saved?.id]);
  const onName = (e) => { const name = e.target.value; setF({ ...f, name, slug: slugTouched ? f.slug : slugify(name) }); };
  const up = async (file, apply, folder, hashTo) => { if (!file) return; setBusy('Uploading ' + file.name + '…'); try { apply(await uploadFile(file, folder)); if (hashTo) hashTo(await sha256File(file)); toast('Uploaded'); } catch (e) { toast('Upload failed: ' + e.message); } setBusy(''); };
  const save = async (e) => {
    e.preventDefault(); const slug = slugify(f.slug || f.name);
    if (!slug || RESERVED.includes(slug)) return toast('That link name is reserved or empty — pick another.');
    const extra = lines(f.extra_links).map((l) => { const [label, ...u] = l.split('|'); return { label: (label || '').trim() || 'Mirror', url: u.join('|').trim() }; }).filter((l) => safeUrl(l.url));
    const row = { name: f.name.trim(), slug, owner_id: session.user.id, icon_url: f.icon_url || null, short_desc: f.short_desc, about: f.about, features: lines(f.features), category: f.category.trim() || 'General', developer: f.developer, version: f.version, size: f.size, platform: f.platform, content_rating: f.content_rating, download_url: f.download_url.trim(), sha256: (f.sha256 || '').trim().toLowerCase(), extra_links: extra, whats_new: f.whats_new, seo_keywords: f.seo_keywords || '', seo_description: f.seo_description || '', is_published: f.is_published };
    setBusy('Saving…'); const { data, error } = await (saved ? sb.from('ah_apps').update(row).eq('id', saved.id).select().single() : sb.from('ah_apps').insert(row).select().single()); setBusy('');
    if (error) return toast(error.code === '23505' ? 'That link name is already used by another app.' : error.message);
    setSaved(data); setF((x) => ({ ...x, slug })); toast(saved ? 'Changes saved' : 'App created — add a screenshot below, then publish it');
  };
  const addShots = async (files) => { let sort = shots.length ? Math.max(...shots.map((s) => s.sort)) + 1 : 0; for (const file of files) { setBusy('Uploading ' + file.name + '…'); try { const url = await uploadFile(file, `dev/${session.user.id}/screenshots`); await sb.from('ah_screenshots').insert({ app_id: saved.id, url, sort: sort++ }); } catch (e) { toast('Failed: ' + e.message); } } setBusy(''); loadShots(saved.id); };
  const delShot = async (s) => { await sb.from('ah_screenshots').delete().eq('id', s.id); loadShots(saved.id); };
  return (<div className="card pad"><div className="row between"><h2>{saved ? `Edit ${saved.name}` : 'Add app'}</h2><button className="btn ghost" onClick={onClose}>← Back to my apps</button></div>
    {saved && <p className="muted small">Link: <a href={appUrl(saved.slug)} target="_blank" rel="noreferrer">{appUrl(saved.slug)}</a></p>}
    <form className="form two" onSubmit={save}>
      <label>App name<input required value={f.name} onChange={onName} /></label>
      <label>Link name (URL)<input required value={f.slug} onChange={(e) => { setSlugTouched(true); setF({ ...f, slug: slugify(e.target.value) }); }} /></label>
      <label>Category<input value={f.category} onChange={set('category')} placeholder="Games, Tools, Social…" /></label><label>Developer / studio name<input value={f.developer} onChange={set('developer')} placeholder="Shown on the app page" /></label>
      <label>Version<input value={f.version} onChange={set('version')} /></label><label>Size<input value={f.size} onChange={set('size')} placeholder="e.g. 48 MB" /></label>
      <label>Platform<input value={f.platform} onChange={set('platform')} /></label><label>Content rating<input value={f.content_rating} onChange={set('content_rating')} placeholder="Everyone, 12+, 18+" /></label>
      <label className="full">Icon<input value={f.icon_url || ''} onChange={set('icon_url')} placeholder="URL or upload ↓" /><input type="file" accept="image/*" onChange={(e) => up(e.target.files[0], (u) => setF((x) => ({ ...x, icon_url: u })), `dev/${session.user.id}/icons`)} /></label>
      <label className="full">Short description<input value={f.short_desc} onChange={set('short_desc')} maxLength={200} /></label>
      <div className="full"><label>About this app</label><MdEditor rows={7} value={f.about} onChange={(v) => setF((x) => ({ ...x, about: v }))} /></div>
      <label className="full">Features (one per line)<textarea rows={4} value={f.features} onChange={set('features')} /></label>
      <div className="full"><label>What's new</label><MdEditor rows={3} value={f.whats_new} onChange={(v) => setF((x) => ({ ...x, whats_new: v }))} /></div>
      <label className="full">Download link<input value={f.download_url} onChange={set('download_url')} placeholder="https://… or upload a file ↓" /><input type="file" onChange={(e) => up(e.target.files[0], (u) => setF((x) => ({ ...x, download_url: u })), `dev/${session.user.id}/files`, (h) => setF((x) => ({ ...x, sha256: h })))} /><small className="muted">Up to 100 MB.</small></label>
      <label className="full">Extra download links / mirrors (Label | URL, one per line)<textarea rows={2} value={f.extra_links} onChange={set('extra_links')} /></label>
      <label className="full">SEO description<input value={f.seo_description || ''} onChange={set('seo_description')} maxLength={200} /></label>
      <label className="check"><input type="checkbox" checked={f.is_published} onChange={set('is_published')} /> Published (visible to visitors)</label>
      <div className="full row"><button className="btn" disabled={!!busy}>{saved ? 'Save changes' : 'Create app'}</button>{busy && <span className="muted">{busy}</span>}</div></form>
    {saved && <><hr /><h3>Screenshots</h3><input type="file" accept="image/*" multiple onChange={(e) => { addShots([...e.target.files]); e.target.value = ''; }} />
      <div className="shots-admin">{shots.map((s) => <div key={s.id}><img src={s.url} alt="" /><button className="btn sm danger" onClick={() => delShot(s)}>✕</button></div>)}</div></>}
  </div>);
}
