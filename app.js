(function(){
"use strict";
/* Languages. English text is the key; missing translations fall back to English. */
const LANGS = {
    en: { name: 'English', dir: 'ltr' }, sw: { name: 'Kiswahili', dir: 'ltr' }, ar: { name: 'العربية', dir: 'rtl' },
    fr: { name: 'Français', dir: 'ltr' }, es: { name: 'Español', dir: 'ltr' },
};
const DICT = {
    sw: {
        'Apps': 'Programu', 'Top charts': 'Zinazoongoza', 'Saved': 'Zilizohifadhiwa', 'Search for apps': 'Tafuta programu', 'Install app': 'Sakinisha programu',
        'Request': 'Omba', 'Contact': 'Wasiliana', 'Featured': 'Zilizochaguliwa', 'Most downloaded': 'Zilizopakuliwa zaidi', 'Top rated': 'Zenye alama za juu',
        'New & updated': 'Mpya na zilizosasishwa', 'Trending this week': 'Zinazovuma wiki hii', 'Recently viewed': 'Ulizotazama hivi karibuni',
        'Can’t find an app?': 'Huwezi kupata programu?', 'Request an app': 'Omba programu', 'Tell us what you need and we’ll try to add it.': 'Tuambie unachohitaji nasi tutajaribu kukiongeza.',
        'All': 'Zote', 'Download': 'Pakua', 'Save': 'Hifadhi', 'Share': 'Shiriki', 'Size': 'Ukubwa', 'Rated for': 'Inafaa kwa', 'Downloads': 'Vipakuliwa',
        'reviews': 'maoni', 'No reviews': 'Hakuna maoni', 'Overview': 'Muhtasari', 'About': 'Kuhusu', 'Screenshots': 'Picha za skrini', 'Reviews': 'Maoni',
        'Q&A': 'Maswali', 'What’s new': 'Kipya', 'Request update': 'Omba usasishaji', 'About this app': 'Kuhusu programu hii', 'Ratings and reviews': 'Ukadiriaji na maoni',
        'App info': 'Taarifa za programu', 'Similar apps': 'Programu zinazofanana', 'Write a review': 'Andika maoni', 'Back to': 'Rudi kwa', 'Rate this app': 'Kadiria programu hii',
        'Post': 'Tuma', 'Your name': 'Jina lako', 'Review': 'Maoni', 'Report broken link': 'Ripoti kiungo kibovu', 'Continue to download': 'Endelea kupakua',
        'Send message': 'Tuma ujumbe', 'Contact admin': 'Wasiliana na msimamizi', 'Version': 'Toleo', 'Older versions': 'Matoleo ya zamani', 'Latest': 'Jipya zaidi',
        'Saved for later': 'Zilizohifadhiwa kwa baadaye', 'Nothing saved yet. Tap the ♡ on any app to save it here.': 'Hujahifadhi chochote bado. Gusa ♡ kwenye programu yoyote kuihifadhi hapa.',
        'Get notified about new apps': 'Pata taarifa za programu mpya', 'Subscribe': 'Jiandikishe', 'Enable notifications': 'Washa arifa', 'Your email': 'Barua pepe yako',
        'Support us': 'Tuunge mkono', 'Scan on VirusTotal': 'Kagua kwenye VirusTotal', 'Ask a question': 'Uliza swali', 'Reply': 'Jibu', 'Report': 'Ripoti',
        'Results for': 'Matokeo ya', 'Language': 'Lugha', 'Developer response': 'Jibu la msanidi', 'No apps found.': 'Hakuna programu zilizopatikana.',
        'Verified by Appshub': 'Imethibitishwa na Appshub', 'Checksum (SHA-256)': 'Checksum (SHA-256)', 'Copy': 'Nakili', 'Questions & answers': 'Maswali na majibu',
        'Send': 'Tuma', 'Your question': 'Swali lako', 'Request an update': 'Omba usasishaji', 'Admin': 'Msimamizi', 'Verify you are human': 'Thibitisha kuwa wewe ni binadamu',
        'Check': 'Thibitisha', 'Wrong answer, try again': 'Jibu si sahihi, jaribu tena', 'Your download will be ready in': 'Upakuaji wako utakuwa tayari baada ya',
    },
    ar: {
        'Apps': 'التطبيقات', 'Top charts': 'الأكثر رواجًا', 'Saved': 'المحفوظة', 'Search for apps': 'ابحث عن تطبيقات', 'Install app': 'تثبيت التطبيق',
        'Request': 'طلب', 'Contact': 'اتصل بنا', 'Featured': 'مميزة', 'Most downloaded': 'الأكثر تنزيلًا', 'Top rated': 'الأعلى تقييمًا',
        'New & updated': 'جديد ومحدّث', 'Trending this week': 'الرائج هذا الأسبوع', 'Recently viewed': 'شوهدت مؤخرًا',
        'Can’t find an app?': 'لا تجد تطبيقًا؟', 'Request an app': 'اطلب تطبيقًا', 'Tell us what you need and we’ll try to add it.': 'أخبرنا بما تحتاجه وسنحاول إضافته.',
        'All': 'الكل', 'Download': 'تنزيل', 'Save': 'حفظ', 'Share': 'مشاركة', 'Size': 'الحجم', 'Rated for': 'مناسب لـ', 'Downloads': 'التنزيلات',
        'reviews': 'مراجعات', 'No reviews': 'لا مراجعات', 'Overview': 'نظرة عامة', 'About': 'حول', 'Screenshots': 'لقطات الشاشة', 'Reviews': 'المراجعات',
        'Q&A': 'أسئلة وأجوبة', 'What’s new': 'الجديد', 'Request update': 'طلب تحديث', 'About this app': 'حول هذا التطبيق', 'Ratings and reviews': 'التقييمات والمراجعات',
        'App info': 'معلومات التطبيق', 'Similar apps': 'تطبيقات مشابهة', 'Write a review': 'اكتب مراجعة', 'Back to': 'العودة إلى', 'Rate this app': 'قيّم هذا التطبيق',
        'Post': 'نشر', 'Your name': 'اسمك', 'Review': 'المراجعة', 'Report broken link': 'الإبلاغ عن رابط معطل', 'Continue to download': 'متابعة التنزيل',
        'Send message': 'إرسال الرسالة', 'Contact admin': 'اتصل بالمشرف', 'Version': 'الإصدار', 'Older versions': 'إصدارات أقدم', 'Latest': 'الأحدث',
        'Saved for later': 'محفوظ لوقت لاحق', 'Nothing saved yet. Tap the ♡ on any app to save it here.': 'لا شيء محفوظ بعد. اضغط ♡ على أي تطبيق لحفظه هنا.',
        'Get notified about new apps': 'احصل على إشعارات بالتطبيقات الجديدة', 'Subscribe': 'اشترك', 'Enable notifications': 'تفعيل الإشعارات', 'Your email': 'بريدك الإلكتروني',
        'Support us': 'ادعمنا', 'Scan on VirusTotal': 'افحص على VirusTotal', 'Ask a question': 'اطرح سؤالًا', 'Reply': 'رد', 'Report': 'إبلاغ',
        'Results for': 'نتائج البحث عن', 'Language': 'اللغة', 'Developer response': 'رد المطوّر', 'No apps found.': 'لم يتم العثور على تطبيقات.',
        'Verified by Appshub': 'موثّق من Appshub', 'Checksum (SHA-256)': 'بصمة الملف (SHA-256)', 'Copy': 'نسخ', 'Questions & answers': 'الأسئلة والأجوبة',
        'Send': 'إرسال', 'Your question': 'سؤالك', 'Request an update': 'اطلب تحديثًا', 'Admin': 'المشرف', 'Verify you are human': 'تحقق أنك إنسان',
        'Check': 'تحقق', 'Wrong answer, try again': 'إجابة خاطئة، حاول مرة أخرى', 'Your download will be ready in': 'سيكون تنزيلك جاهزًا خلال',
    },
    fr: {
        'Apps': 'Applis', 'Top charts': 'Classements', 'Saved': 'Enregistrées', 'Search for apps': 'Rechercher des applis', 'Install app': 'Installer l’appli',
        'Request': 'Demander', 'Contact': 'Contact', 'Featured': 'À la une', 'Most downloaded': 'Les plus téléchargées', 'Top rated': 'Les mieux notées',
        'New & updated': 'Nouveautés et mises à jour', 'Trending this week': 'Tendances de la semaine', 'Recently viewed': 'Consultées récemment',
        'Can’t find an app?': 'Vous ne trouvez pas une appli ?', 'Request an app': 'Demander une appli', 'Tell us what you need and we’ll try to add it.': 'Dites-nous ce qu’il vous faut, nous essaierons de l’ajouter.',
        'All': 'Toutes', 'Download': 'Télécharger', 'Save': 'Enregistrer', 'Share': 'Partager', 'Size': 'Taille', 'Rated for': 'Public', 'Downloads': 'Téléchargements',
        'reviews': 'avis', 'No reviews': 'Aucun avis', 'Overview': 'Aperçu', 'About': 'À propos', 'Screenshots': 'Captures d’écran', 'Reviews': 'Avis',
        'Q&A': 'Questions', 'What’s new': 'Nouveautés', 'Request update': 'Demander une mise à jour', 'About this app': 'À propos de cette appli', 'Ratings and reviews': 'Notes et avis',
        'App info': 'Infos sur l’appli', 'Similar apps': 'Applis similaires', 'Write a review': 'Écrire un avis', 'Back to': 'Retour à', 'Rate this app': 'Noter cette appli',
        'Post': 'Publier', 'Your name': 'Votre nom', 'Review': 'Avis', 'Report broken link': 'Signaler un lien cassé', 'Continue to download': 'Continuer le téléchargement',
        'Send message': 'Envoyer le message', 'Contact admin': 'Contacter l’admin', 'Version': 'Version', 'Older versions': 'Anciennes versions', 'Latest': 'Dernière',
        'Saved for later': 'Enregistrées pour plus tard', 'Nothing saved yet. Tap the ♡ on any app to save it here.': 'Rien d’enregistré. Touchez ♡ sur une appli pour l’ajouter ici.',
        'Get notified about new apps': 'Être averti des nouvelles applis', 'Subscribe': 'S’abonner', 'Enable notifications': 'Activer les notifications', 'Your email': 'Votre e-mail',
        'Support us': 'Soutenez-nous', 'Scan on VirusTotal': 'Analyser sur VirusTotal', 'Ask a question': 'Poser une question', 'Reply': 'Répondre', 'Report': 'Signaler',
        'Results for': 'Résultats pour', 'Language': 'Langue', 'Developer response': 'Réponse du développeur', 'No apps found.': 'Aucune appli trouvée.',
        'Verified by Appshub': 'Vérifiée par Appshub', 'Checksum (SHA-256)': 'Somme de contrôle (SHA-256)', 'Copy': 'Copier', 'Questions & answers': 'Questions et réponses',
        'Send': 'Envoyer', 'Your question': 'Votre question', 'Request an update': 'Demander une mise à jour', 'Admin': 'Admin', 'Verify you are human': 'Vérifiez que vous êtes humain',
        'Check': 'Vérifier', 'Wrong answer, try again': 'Mauvaise réponse, réessayez', 'Your download will be ready in': 'Votre téléchargement sera prêt dans',
    },
    es: {
        'Apps': 'Apps', 'Top charts': 'Listas', 'Saved': 'Guardadas', 'Search for apps': 'Buscar apps', 'Install app': 'Instalar app',
        'Request': 'Solicitar', 'Contact': 'Contacto', 'Featured': 'Destacadas', 'Most downloaded': 'Más descargadas', 'Top rated': 'Mejor valoradas',
        'New & updated': 'Nuevas y actualizadas', 'Trending this week': 'Tendencias de la semana', 'Recently viewed': 'Vistas recientemente',
        'Can’t find an app?': '¿No encuentras una app?', 'Request an app': 'Solicitar una app', 'Tell us what you need and we’ll try to add it.': 'Dinos lo que necesitas e intentaremos añadirlo.',
        'All': 'Todas', 'Download': 'Descargar', 'Save': 'Guardar', 'Share': 'Compartir', 'Size': 'Tamaño', 'Rated for': 'Clasificación', 'Downloads': 'Descargas',
        'reviews': 'reseñas', 'No reviews': 'Sin reseñas', 'Overview': 'Resumen', 'About': 'Acerca de', 'Screenshots': 'Capturas', 'Reviews': 'Reseñas',
        'Q&A': 'Preguntas', 'What’s new': 'Novedades', 'Request update': 'Solicitar actualización', 'About this app': 'Acerca de esta app', 'Ratings and reviews': 'Valoraciones y reseñas',
        'App info': 'Información de la app', 'Similar apps': 'Apps similares', 'Write a review': 'Escribir una reseña', 'Back to': 'Volver a', 'Rate this app': 'Valorar esta app',
        'Post': 'Publicar', 'Your name': 'Tu nombre', 'Review': 'Reseña', 'Report broken link': 'Informar de enlace roto', 'Continue to download': 'Continuar con la descarga',
        'Send message': 'Enviar mensaje', 'Contact admin': 'Contactar al administrador', 'Version': 'Versión', 'Older versions': 'Versiones anteriores', 'Latest': 'Última',
        'Saved for later': 'Guardadas para después', 'Nothing saved yet. Tap the ♡ on any app to save it here.': 'Aún no has guardado nada. Toca ♡ en una app para guardarla aquí.',
        'Get notified about new apps': 'Recibe avisos de nuevas apps', 'Subscribe': 'Suscribirse', 'Enable notifications': 'Activar notificaciones', 'Your email': 'Tu correo',
        'Support us': 'Apóyanos', 'Scan on VirusTotal': 'Analizar en VirusTotal', 'Ask a question': 'Hacer una pregunta', 'Reply': 'Responder', 'Report': 'Denunciar',
        'Results for': 'Resultados para', 'Language': 'Idioma', 'Developer response': 'Respuesta del desarrollador', 'No apps found.': 'No se encontraron apps.',
        'Verified by Appshub': 'Verificada por Appshub', 'Checksum (SHA-256)': 'Suma de verificación (SHA-256)', 'Copy': 'Copiar', 'Questions & answers': 'Preguntas y respuestas',
        'Send': 'Enviar', 'Your question': 'Tu pregunta', 'Request an update': 'Solicitar una actualización', 'Admin': 'Admin', 'Verify you are human': 'Verifica que eres humano',
        'Check': 'Verificar', 'Wrong answer, try again': 'Respuesta incorrecta, inténtalo de nuevo', 'Your download will be ready in': 'Tu descarga estará lista en',
    },
};
let LANG = (() => { try {
    const l = localStorage.getItem('ah_lang') || (navigator.language || 'en').slice(0, 2);
    return LANGS[l] ? l : 'en';
}
catch {
    return 'en';
} })();
const t = (s) => (LANG === 'en' ? s : (DICT[LANG] && DICT[LANG][s]) || s);
function setLang(l) { if (!LANGS[l])
    return; LANG = l; try {
    localStorage.setItem('ah_lang', l);
}
catch { } applyLang(); }
function applyLang() { document.documentElement.lang = LANG; document.documentElement.dir = LANGS[LANG].dir; }
applyLang();
/* =========================================================
   APPSHUB v2 — Play-Store style, React (no build step)
   Backend: Supabase (tables ah_*, bucket "appshub")
   ========================================================= */
const { useState, useEffect, useMemo, useRef, useContext, createContext, useCallback } = React;
const SB_URL = 'https://mqassrjwcwpnruyflmpz.supabase.co';
const SB_KEY = 'sb_publishable_2_oaZBr7tu63TC1HMSahMw_PT-H3z3i';
const sb = supabase.createClient(SB_URL, SB_KEY);
const ADMIN_EMAIL = 'symoh@appshub.app'; // login username "Symoh" -> symoh@appshub.app
const RESERVED = ['admin', 'request-app', 'contact', 'apps', 'saved', 'top', 'donate', 'unsubscribe', 'terms', 'privacy', 'compare', 'assets', 'api', 'icons'];
const TABS = [
    ['overview', 'Overview', ''], ['about', 'About', '/about'], ['screenshots', 'Screenshots', '/screenshots'],
    ['reviews', 'Reviews', '/reviews'], ['questions', 'Q&A', '/questions'], ['changelog', 'What’s new', '/changelog'], ['download', 'Download', '/download'],
    ['request-update', 'Request update', '/request-update'],
];
/* ---------- helpers ---------- */
const safeUrl = (u) => { try {
    const x = new URL(u);
    return ['http:', 'https:'].includes(x.protocol) ? x.href : '';
}
catch {
    return '';
} };
const slugify = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const fmtNum = (n) => { n = Number(n || 0); if (n >= 1e6)
    return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M'; if (n >= 1e3)
    return (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K'; return String(n); };
const dlBucket = (n) => { n = Number(n || 0); if (n < 10)
    return String(n); const p = 10 ** Math.floor(Math.log10(n)); const l = n / p; return fmtNum((l >= 5 ? 5 : l >= 2 ? 2 : 1) * p) + '+'; };
const timeAgo = (d) => { const s = (Date.now() - new Date(d)) / 1000; if (s < 60)
    return 'just now'; if (s < 3600)
    return Math.floor(s / 60) + 'm ago'; if (s < 86400)
    return Math.floor(s / 3600) + 'h ago'; if (s < 2592000)
    return Math.floor(s / 86400) + 'd ago'; return new Date(d).toLocaleDateString(); };
const appUrl = (slug, tab = '') => `${location.origin}/${slug}${tab}`;
const lines = (t) => (t || '').split('\n').map((x) => x.trim()).filter(Boolean);
const isLive = (b) => b.active && (!b.starts_at || new Date(b.starts_at) <= Date.now()) && (!b.ends_at || new Date(b.ends_at) >= Date.now());
const countryName = (c) => { try {
    return new Intl.DisplayNames(['en'], { type: 'region' }).of(c);
}
catch {
    return c;
} };
let _country;
const getCountry = async () => { if (_country !== undefined)
    return _country; try {
    _country = (await (await fetch('/api/geo')).json()).country || '';
}
catch {
    _country = '';
} return _country; };
const lsGet = (k, d) => { var _a; try {
    return (_a = JSON.parse(localStorage.getItem(k))) !== null && _a !== void 0 ? _a : d;
}
catch {
    return d;
} };
const lsSet = (k, v) => { try {
    localStorage.setItem(k, JSON.stringify(v));
}
catch { } };
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
const Ico = ({ n, s = 22, ...p }) => React.createElement("svg", { viewBox: "0 0 24 24", width: s, height: s, fill: "currentColor", "aria-hidden": "true", ...p },
    React.createElement("path", { d: PATHS[n] }));
/* ---------- toast ---------- */
const ToastCtx = createContext(() => { });
function ToastHost({ children }) {
    const [msg, setMsg] = useState('');
    const t = useRef();
    const show = useCallback((m) => { setMsg(m); clearTimeout(t.current); t.current = setTimeout(() => setMsg(''), 2600); }, []);
    return (React.createElement(ToastCtx.Provider, { value: show },
        children,
        msg && React.createElement("div", { className: "toast" }, msg)));
}
const useToast = () => useContext(ToastCtx);
/* ---------- router (History API, clean URLs) ---------- */
const RouterCtx = createContext({});
function Router({ children }) {
    const [loc, setLoc] = useState(location.pathname + location.search);
    useEffect(() => { const f = () => setLoc(location.pathname + location.search); addEventListener('popstate', f); return () => removeEventListener('popstate', f); }, []);
    const nav = useCallback((to) => { if (to !== location.pathname + location.search)
        history.pushState({}, '', to); setLoc(location.pathname + location.search); window.scrollTo(0, 0); }, []);
    return React.createElement(RouterCtx.Provider, { value: { loc, nav } }, children);
}
const useRouter = () => useContext(RouterCtx);
function Link({ to, children, className, ...p }) {
    const { nav } = useRouter();
    return React.createElement("a", { href: to, className: className, ...p, onClick: (e) => { if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1)
            return; e.preventDefault(); nav(to); } }, children);
}
/* ---------- site context: settings, live banners, saved apps ---------- */
const SiteCtx = createContext({ settings: {}, banners: [], saved: [], toggleSaved() { } });
const useSite = () => useContext(SiteCtx);
/* PWA install prompt */
let deferredPrompt = null;
addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredPrompt = e; dispatchEvent(new Event('ah-install')); });
/* ---------- UI pieces ---------- */
function Icon({ app, size = 64, decorative = false }) {
    var _a;
    const [bad, setBad] = useState(false);
    if (app.icon_url && !bad)
        return React.createElement("img", { className: "icon", style: { width: size, height: size }, src: app.icon_url, alt: decorative ? '' : app.name, onError: () => setBad(true), loading: "lazy" });
    const hue = [...app.name].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
    return React.createElement("div", { className: "icon fallback", role: decorative ? undefined : 'img', "aria-label": decorative ? undefined : app.name, style: { width: size, height: size, background: `hsl(${hue} 55% 45%)`, fontSize: size * 0.45 } }, (_a = app.name[0]) === null || _a === void 0 ? void 0 : _a.toUpperCase());
}
const Stars = ({ value = 0, size = 16 }) => (React.createElement("span", { className: "stars", style: { fontSize: size }, title: `${value} / 5` }, [1, 2, 3, 4, 5].map((i) => React.createElement("span", { key: i, className: value >= i - 0.25 ? 'on' : value >= i - 0.75 ? 'half' : '' }, "\u2605"))));
function StarInput({ value, onChange }) {
    return React.createElement("span", { className: "stars input" }, [1, 2, 3, 4, 5].map((i) => React.createElement("button", { type: "button", key: i, className: value >= i ? 'on' : '', onClick: () => onChange(i), "aria-label": `${i} stars` }, "\u2605")));
}
const Loader = () => React.createElement("div", { className: "loader" },
    React.createElement("div", { className: "spin" }));
const Empty = ({ children }) => React.createElement("div", { className: "empty" }, children);
const Verified = () => React.createElement("span", { className: "verified", title: "Verified by Appshub" },
    React.createElement(Ico, { n: "ok", s: 16 }));
const Rate = ({ app }) => app.review_count > 0 ? React.createElement("span", { className: "rate" },
    app.avg_rating,
    " ",
    React.createElement(Ico, { n: "star", s: 11 })) : React.createElement("span", { className: "rate muted" }, "New");
function SaveBtn({ app, label }) {
    const { saved, toggleSaved } = useSite();
    const toast = useToast();
    const on = saved.includes(app.slug);
    return React.createElement("button", { className: 'icon-btn heart' + (on ? ' on' : ''), "aria-label": on ? 'Remove from saved' : 'Save for later', onClick: (e) => { e.preventDefault(); e.stopPropagation(); toggleSaved(app.slug); toast(on ? 'Removed from saved' : 'Saved for later'); } },
        React.createElement(Ico, { n: "heart" }),
        label && React.createElement("span", null, on ? t('Saved') : t('Save')));
}
/* carousel card (Play Store shelf item) */
function MiniCard({ app }) {
    return (React.createElement(Link, { to: `/${app.slug}`, className: "mini" },
        React.createElement(Icon, { app: app, size: 104 }),
        React.createElement("div", { className: "mini-name" }, app.name),
        React.createElement("div", { className: "mini-sub" }, app.size || app.category),
        React.createElement(Rate, { app: app })));
}
function Shelf({ title, to, apps }) {
    if (!apps.length)
        return null;
    return (React.createElement("section", { className: "shelf" },
        React.createElement("div", { className: "shelf-h" },
            React.createElement("h2", null, title),
            to && React.createElement(Link, { to: to, className: "round-arrow", "aria-label": `See all ${title}` },
                React.createElement(Ico, { n: "fwd", s: 20 }))),
        React.createElement("div", { className: "shelf-row" }, apps.map((a) => React.createElement(MiniCard, { key: a.id, app: a })))));
}
function ListRow({ app, rank, action = true }) {
    return (React.createElement(Link, { to: `/${app.slug}`, className: "row-card" },
        rank && React.createElement("span", { className: "rank" }, rank),
        React.createElement(Icon, { app: app, size: 56 }),
        React.createElement("div", { className: "row-body" },
            React.createElement("b", null,
                app.name,
                " ",
                app.is_verified && React.createElement(Verified, null)),
            React.createElement("span", { className: "muted small" },
                app.category,
                app.size && ` · ${app.size}`,
                " \u00B7 ",
                dlBucket(app.downloads),
                " downloads"),
            React.createElement(Rate, { app: app })),
        action && React.createElement(SaveBtn, { app: app })));
}
/* ---------- data ---------- */
async function fetchApps() {
    const [{ data: apps, error }, { data: stats }] = await Promise.all([
        sb.from('ah_apps').select('*').eq('is_published', true).order('created_at', { ascending: false }),
        sb.from('ah_app_stats').select('*'),
    ]);
    if (error)
        throw error;
    const m = Object.fromEntries((stats || []).map((s) => [s.app_id, s]));
    return (apps || []).map((a) => { var _a, _b; return ({ ...a, review_count: ((_a = m[a.id]) === null || _a === void 0 ? void 0 : _a.review_count) || 0, avg_rating: ((_b = m[a.id]) === null || _b === void 0 ? void 0 : _b.avg_rating) || 0 }); });
}
function useApps() {
    const [apps, setApps] = useState(null);
    const [err, setErr] = useState('');
    useEffect(() => { fetchApps().then(setApps).catch((e) => { setErr(e.message); setApps([]); }); }, []);
    return { apps, err };
}
/* ---------- share ---------- */
function ShareBox({ app, tab = '' }) {
    const toast = useToast();
    const url = appUrl(app.slug, tab);
    const text = `Download ${app.name} on Appshub`;
    const e = encodeURIComponent;
    const copy = async () => { try {
        await navigator.clipboard.writeText(url);
        toast('Link copied!');
    }
    catch {
        prompt('Copy this link:', url);
    } };
    const targets = [['WhatsApp', `https://wa.me/?text=${e(text + ' ' + url)}`], ['Telegram', `https://t.me/share/url?url=${e(url)}&text=${e(text)}`], ['X', `https://twitter.com/intent/tweet?text=${e(text)}&url=${e(url)}`], ['Facebook', `https://www.facebook.com/sharer/sharer.php?u=${e(url)}`], ['Email', `mailto:?subject=${e(text)}&body=${e(url)}`]];
    return (React.createElement("div", { className: "share" },
        React.createElement("div", { className: "share-link" },
            React.createElement("input", { readOnly: true, value: url, onFocus: (x) => x.target.select() }),
            React.createElement("button", { className: "btn", onClick: copy }, "Copy link")),
        React.createElement("div", { className: "share-apps" },
            navigator.share && React.createElement("button", { className: "chip", onClick: () => navigator.share({ title: app.name, text, url }).catch(() => { }) }, "Share\u2026"),
            targets.map(([n, h]) => React.createElement("a", { key: n, className: "chip", href: h, target: "_blank", rel: "noopener noreferrer" }, n)))));
}
/* ---------- ads ---------- */
function useAdTrack(id) { useEffect(() => { if (id)
    sb.rpc('ah_track_ad', { p_id: id, p_kind: 'view' }).then(() => { }); }, [id]); }
const clickAd = (id) => sb.rpc('ah_track_ad', { p_id: id, p_kind: 'click' }).then(() => { });
function BannerAd({ b }) {
    useAdTrack(b.id);
    const href = safeUrl(b.link_url);
    const inner = React.createElement("div", { className: "banner" },
        b.image_url && React.createElement("img", { src: b.image_url, alt: "" }),
        React.createElement("div", null,
            React.createElement("b", null, b.title),
            React.createElement("p", null, b.message)),
        React.createElement("span", { className: "ad-tag" }, "Ad"));
    return href ? React.createElement("a", { href: href, target: "_blank", rel: "noopener noreferrer sponsored", onClick: () => clickAd(b.id) }, inner) : inner;
}
/* =========================================================
   LAYOUT
   ========================================================= */
function Header() {
    const { settings } = useSite();
    const { nav, loc } = useRouter();
    const [q, setQ] = useState('');
    const [canInstall, setCanInstall] = useState(!!deferredPrompt);
    const [sugg, setSugg] = useState([]);
    const [open, setOpen] = useState(false);
    const boxRef = useRef();
    useEffect(() => { const f = (e) => { if (boxRef.current && !boxRef.current.contains(e.target))
        setOpen(false); }; addEventListener('mousedown', f); return () => removeEventListener('mousedown', f); }, []);
    const onQ = (e) => { const v = e.target.value; setQ(v); if (v.trim().length < 2)
        return setSugg([]); sb.from('ah_apps').select('name,slug,icon_url,category').eq('is_published', true).ilike('name', `%${v.trim()}%`).limit(6).then(({ data }) => { setSugg(data || []); setOpen(true); }); };
    const [dark, setDark] = useState(() => lsGet('theme', 'light') === 'dark');
    useEffect(() => { document.documentElement.dataset.theme = dark ? 'dark' : 'light'; lsSet('theme', dark ? 'dark' : 'light'); }, [dark]);
    useEffect(() => { const f = () => setCanInstall(true); addEventListener('ah-install', f); return () => removeEventListener('ah-install', f); }, []);
    const install = async () => { if (!deferredPrompt)
        return; deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt = null; setCanInstall(false); };
    const path = loc.split('?')[0];
    return (React.createElement("header", { className: "header" },
        React.createElement("div", { className: "wrap header-in" },
            React.createElement(Link, { to: "/", className: "logo" },
                React.createElement("span", { className: "logo-mark" }, "\u25B6"),
                React.createElement("span", null, settings.site_name || 'Appshub')),
            React.createElement("nav", { className: "nav desk" },
                React.createElement(Link, { to: "/", className: path === '/' ? 'on' : '' }, t('Apps')),
                React.createElement(Link, { to: "/top", className: path === '/top' ? 'on' : '' }, t('Top charts')),
                React.createElement(Link, { to: "/saved", className: path === '/saved' ? 'on' : '' }, t('Saved'))),
            React.createElement("div", { className: "search-wrap", ref: boxRef },
                React.createElement("form", { className: "search", onSubmit: (e) => { e.preventDefault(); setOpen(false); nav(`/?q=${encodeURIComponent(q)}`); } },
                    React.createElement(Ico, { n: "search", s: 20 }),
                    React.createElement("input", { value: q, onChange: onQ, onFocus: () => sugg.length && setOpen(true), placeholder: t('Search for apps'), "aria-label": "Search apps" })),
                open && sugg.length > 0 && React.createElement("div", { className: "suggest" }, sugg.map((a) => React.createElement("a", { key: a.slug, href: `/${a.slug}`, onClick: (e) => { e.preventDefault(); setOpen(false); setQ(''); nav(`/${a.slug}`); } },
                    React.createElement(Icon, { app: a, size: 32 }),
                    React.createElement("div", null,
                        React.createElement("b", null, a.name),
                        React.createElement("span", { className: "muted small" }, a.category)))))),
            React.createElement("div", { className: "hdr-actions" },
                canInstall && React.createElement("button", { className: "btn sm ghost", onClick: install }, t('Install app')),
                React.createElement(LangSwitch, null),
                React.createElement("button", { className: "icon-btn", onClick: () => setDark(!dark), "aria-label": "Toggle theme" }, dark ? '☀️' : '🌙')))));
}
function BottomNav() {
    const { loc } = useRouter();
    const path = loc.split('?')[0];
    const { saved } = useSite();
    const items = [['/', 'home', 'Apps'], ['/top', 'chart', 'Top charts'], ['/saved', 'heart', 'Saved'], ['/request-app', 'plus', 'Request'], ['/contact', 'mail', 'Contact']];
    if (path.startsWith('/admin'))
        return null;
    return React.createElement("nav", { className: "bottom-nav" }, items.map(([to, ic, l]) => React.createElement(Link, { key: to, to: to, className: path === to ? 'on' : '' },
        React.createElement("span", { className: "pill" },
            React.createElement(Ico, { n: ic }),
            to === '/saved' && saved.length > 0 && React.createElement("i", { className: "badge" }, saved.length)),
        React.createElement("span", null, t(l)))));
}
function Footer() {
    const { settings } = useSite();
    return (React.createElement("footer", { className: "footer" },
        React.createElement("div", { className: "wrap" },
            React.createElement("b", null, settings.site_name || 'Appshub'),
            " \u2014 ",
            settings.tagline,
            React.createElement("div", { className: "muted small" },
                "\u00A9 ",
                new Date().getFullYear(),
                " \u00B7 ",
                React.createElement(Link, { to: "/request-app" }, t('Request an app')),
                " \u00B7 ",
                React.createElement(Link, { to: "/contact" }, t('Contact admin')),
                " \u00B7 ",
                React.createElement(Link, { to: "/top" }, t('Top charts')),
                settings.donate_url || settings.donate_text ? React.createElement(React.Fragment, null,
                    " \u00B7 ",
                    React.createElement(Link, { to: "/donate" },
                        "\u2665 ",
                        t(settings.donate_label || 'Support us'))) : null,
                " \u00B7 ",
                React.createElement(Link, { to: "/terms" }, "Terms"),
                " \u00B7 ",
                React.createElement(Link, { to: "/privacy" }, "Privacy"),
                " \u00B7 ",
                React.createElement("a", { href: "/feed.xml" }, "RSS")))));
}
function TopBanners() {
    const { banners, settings } = useSite();
    const list = banners.filter((b) => b.placement === 'banner');
    return (React.createElement(React.Fragment, null,
        settings.announcement && React.createElement("div", { className: "announce" }, settings.announcement),
        list.length > 0 && React.createElement("div", { className: "banners" }, list.map((b) => React.createElement(BannerAd, { key: b.id, b: b })))));
}
/* =========================================================
   PUBLIC PAGES
   ========================================================= */
function Saved() {
    const { saved } = useSite();
    const { apps } = useApps();
    useEffect(() => { document.title = 'Saved apps — Appshub'; }, []);
    if (!apps)
        return React.createElement(Loader, null);
    const list = apps.filter((a) => saved.includes(a.slug));
    return (React.createElement("div", { className: "wrap page" },
        React.createElement("h1", { className: "sec-title big" }, t('Saved for later')),
        list.length ? React.createElement("div", { className: "list" }, list.map((a) => React.createElement(ListRow, { key: a.id, app: a }))) : React.createElement(Empty, null, t('Nothing saved yet. Tap the ♡ on any app to save it here.'))));
}
/* ----- app page ----- */
function AppPage({ slug, tab }) {
    var _a;
    const [app, setApp] = useState(undefined);
    const [shots, setShots] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [versions, setVersions] = useState([]);
    const [related, setRelated] = useState([]);
    const [share, setShare] = useState(false);
    const dl = useDownload(app || { slug });
    const load = useCallback(async () => {
        const { data } = await sb.from('ah_apps').select('*').eq('slug', slug).maybeSingle();
        if (!data) {
            setApp(null);
            return;
        }
        setApp(data);
        pushRecent(slug);
        if (!sessionStorage.getItem('v:' + slug)) {
            sessionStorage.setItem('v:' + slug, '1');
            sb.rpc('ah_track_view', { p_slug: slug }).then(() => { });
        }
        const [s, r, v, rel, st] = await Promise.all([
            sb.from('ah_screenshots').select('*').eq('app_id', data.id).order('sort'),
            sb.from('ah_reviews').select('*').eq('app_id', data.id).order('created_at', { ascending: false }),
            sb.from('ah_versions').select('*').eq('app_id', data.id).order('created_at', { ascending: false }),
            sb.from('ah_apps').select('*').eq('is_published', true).eq('category', data.category).neq('id', data.id).limit(12),
            sb.from('ah_app_stats').select('*'),
        ]);
        const m = Object.fromEntries((st.data || []).map((x) => [x.app_id, x]));
        setShots(s.data || []);
        setReviews(r.data || []);
        setVersions(v.data || []);
        setRelated((rel.data || []).map((a) => { var _a, _b; return ({ ...a, review_count: ((_a = m[a.id]) === null || _a === void 0 ? void 0 : _a.review_count) || 0, avg_rating: ((_b = m[a.id]) === null || _b === void 0 ? void 0 : _b.avg_rating) || 0 }); }));
    }, [slug]);
    useEffect(() => { setApp(undefined); load(); }, [load]);
    useEffect(() => { var _a; if (app)
        document.title = `${app.name}${tab !== 'overview' ? ' · ' + (((_a = TABS.find((t) => t[0] === tab)) === null || _a === void 0 ? void 0 : _a[1]) || '') : ''} — Appshub`; }, [app, tab]);
    if (app === undefined)
        return React.createElement(Loader, null);
    if (!app || !TABS.some((t) => t[0] === tab))
        return React.createElement(NotFound, null);
    const avg = reviews.length ? +(reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1) : 0;
    const P = { app, shots, reviews, versions, avg, related, reload: load, dl };
    const subTitle = (_a = TABS.find((t) => t[0] === tab)) === null || _a === void 0 ? void 0 : _a[1];
    return (React.createElement("div", { className: "page" },
        tab !== 'overview' && React.createElement("div", { className: "subbar" },
            React.createElement("div", { className: "wrap" },
                React.createElement(Link, { to: `/${app.slug}`, className: "back-link" },
                    React.createElement(Ico, { n: "back" }),
                    React.createElement(Icon, { app: app, size: 32 }),
                    React.createElement("b", null, app.name)),
                React.createElement("span", { className: "sub-title" }, t(subTitle)))),
        React.createElement("div", { className: "wrap app-wrap" },
            tab === 'overview' && (React.createElement(React.Fragment, null,
                React.createElement("div", { className: "ap-head" },
                    React.createElement(Icon, { app: app, size: 112 }),
                    React.createElement("div", { className: "ap-title" },
                        React.createElement("h1", null, app.name),
                        React.createElement("div", { className: "dev" },
                            app.developer || 'Unknown developer',
                            " ",
                            app.is_verified && React.createElement(Verified, null)),
                        React.createElement("div", { className: "muted small" },
                            app.category,
                            " \u00B7 ",
                            app.platform))),
                React.createElement("div", { className: "stats-row" },
                    React.createElement("div", null,
                        React.createElement("b", null, reviews.length ? React.createElement(React.Fragment, null,
                            avg,
                            " ",
                            React.createElement(Ico, { n: "star", s: 13 })) : '–'),
                        React.createElement("span", null, reviews.length ? `${fmtNum(reviews.length)} ${t('reviews')}` : t('No reviews'))),
                    React.createElement("div", null,
                        React.createElement("b", null, app.size || '–'),
                        React.createElement("span", null, t('Size'))),
                    React.createElement("div", null,
                        React.createElement("b", null, app.content_rating || 'Everyone'),
                        React.createElement("span", null, t('Rated for'))),
                    React.createElement("div", null,
                        React.createElement("b", null, dlBucket(app.downloads)),
                        React.createElement("span", null, t('Downloads')))),
                React.createElement("div", { className: "ap-actions" },
                    React.createElement(Link, { to: `/${app.slug}/download`, className: "btn big grow" }, t('Download')),
                    React.createElement(SaveBtn, { app: app, label: true }),
                    React.createElement("button", { className: "icon-btn", onClick: () => setShare(!share) },
                        React.createElement(Ico, { n: "share" }),
                        React.createElement("span", null, t('Share')))),
                share && React.createElement("div", { className: "card pad" },
                    React.createElement(ShareBox, { app: app })),
                app.broken_reports >= 3 && React.createElement("div", { className: "alert warn" },
                    React.createElement(Ico, { n: "warn", s: 18 }),
                    " Some users reported problems with the download link. We\u2019re checking it."))),
            React.createElement("nav", { className: "tabs" }, TABS.map(([k, label, p]) => React.createElement(Link, { key: k, to: `/${app.slug}${p}`, className: 'tab' + (k === tab ? ' active' : '') },
                t(label),
                k === 'reviews' && reviews.length ? ` (${reviews.length})` : '',
                k === 'screenshots' && shots.length ? ` (${shots.length})` : ''))),
            tab === 'overview' && React.createElement(Overview, { ...P }),
            tab === 'about' && React.createElement(About, { ...P }),
            tab === 'screenshots' && React.createElement(Screenshots, { ...P }),
            tab === 'reviews' && React.createElement(Reviews, { ...P }),
            tab === 'questions' && React.createElement(Questions, { ...P }),
            tab === 'changelog' && React.createElement(Changelog, { ...P }),
            tab === 'download' && React.createElement(Download, { ...P }),
            tab === 'request-update' && React.createElement(RequestUpdate, { ...P }),
            tab !== 'overview' && React.createElement("div", { className: "center" },
                React.createElement(Link, { to: `/${app.slug}`, className: "btn ghost back" },
                    "\u2190 ",
                    t('Back to'),
                    " ",
                    app.name))),
        tab === 'overview' && React.createElement("div", { className: "wrap" },
            React.createElement(DevShelf, { app: app }),
            related.length > 0 && React.createElement(Shelf, { title: t('Similar apps'), apps: related })),
        dl.modal));
}
const Sec = ({ title, to, children }) => (React.createElement("section", { className: "app-sec" },
    React.createElement("div", { className: "shelf-h" },
        to ? React.createElement(Link, { to: to, className: "sec-link" },
            React.createElement("h2", null, title)) : React.createElement("h2", null, title),
        to && React.createElement(Link, { to: to, className: "round-arrow" },
            React.createElement(Ico, { n: "fwd", s: 20 }))),
    children));
const InfoTable = ({ app }) => (React.createElement("table", { className: "info" },
    React.createElement("tbody", null, [['Version', app.version], ['Updated on', new Date(app.updated_at).toLocaleDateString()], ['Size', app.size], ['Requires', app.platform], ['Category', app.category], ['Content rating', app.content_rating], ['Offered by', app.developer], ['Released on', new Date(app.created_at).toLocaleDateString()], ['Downloads', dlBucket(app.downloads)]].filter((r) => r[1]).map(([k, v]) => React.createElement("tr", { key: k },
        React.createElement("td", null, k),
        React.createElement("td", null, v))))));
function Overview({ app, shots, reviews, avg }) {
    return (React.createElement(React.Fragment, null,
        shots.length > 0 && React.createElement(Sec, { title: t('Screenshots'), to: `/${app.slug}/screenshots` },
            React.createElement("div", { className: "shots-row" }, shots.slice(0, 8).map((s) => React.createElement("img", { key: s.id, src: s.url, alt: "", loading: "lazy" })))),
        React.createElement(Sec, { title: t('About this app'), to: `/${app.slug}/about` },
            React.createElement("p", { className: "pre clamp3" }, app.short_desc || app.about || 'No description yet.')),
        React.createElement(Sec, { title: t('What’s new'), to: `/${app.slug}/changelog` },
            React.createElement("p", { className: "muted small" },
                "Version ",
                app.version,
                " \u00B7 updated ",
                new Date(app.updated_at).toLocaleDateString()),
            React.createElement("p", { className: "pre clamp3" }, app.whats_new || 'Bug fixes and improvements.')),
        React.createElement(Sec, { title: t('Ratings and reviews'), to: `/${app.slug}/reviews` },
            reviews.length ? React.createElement(React.Fragment, null,
                React.createElement("div", { className: "big-rate" },
                    React.createElement("b", null, avg),
                    React.createElement("div", null,
                        React.createElement(Stars, { value: avg, size: 18 }),
                        React.createElement("div", { className: "muted small" },
                            reviews.length,
                            " reviews"))),
                reviews.slice(0, 3).map((r) => React.createElement(ReviewItem, { key: r.id, r: r }))) : React.createElement("p", { className: "muted" }, "No reviews yet \u2014 be the first."),
            React.createElement(Link, { to: `/${app.slug}/reviews`, className: "btn ghost sm" }, t('Write a review'))),
        React.createElement(Sec, { title: t('App info') },
            React.createElement(InfoTable, { app: app })),
        React.createElement("div", { className: "row" },
            React.createElement(Link, { to: `/${app.slug}/request-update`, className: "link" },
                React.createElement(Ico, { n: "flag", s: 16 }),
                " ",
                t('Request an update')),
            " ",
            React.createElement("span", { className: "dot" }, "\u2022"),
            " ",
            React.createElement(Link, { to: `/compare?a=${app.slug}`, className: "link" },
                React.createElement(Ico, { n: "chart", s: 16 }),
                " Compare with another app"))));
}
function DevShelf({ app }) {
    const [rows, setRows] = useState([]);
    useEffect(() => { var _a; if (!((_a = app.developer) === null || _a === void 0 ? void 0 : _a.trim()))
        return; sb.from('ah_apps').select('*').eq('is_published', true).eq('developer', app.developer).neq('id', app.id).limit(12).then(({ data }) => setRows((data || []).map((a) => ({ ...a, review_count: 0, avg_rating: 0 })))); }, [app.id]);
    if (!rows.length)
        return null;
    return React.createElement(Shelf, { title: `More from ${app.developer}`, apps: rows });
}
function About({ app }) {
    const feats = app.features || [];
    return (React.createElement("div", { className: "narrow-col" },
        React.createElement("div", { className: "card pad" },
            React.createElement("h2", null,
                t('About'),
                " ",
                app.name),
            React.createElement(Md, { text: app.about || app.short_desc || 'No description yet.' })),
        feats.length > 0 && React.createElement("div", { className: "card pad" },
            React.createElement("h2", null, "Features"),
            React.createElement("ul", { className: "feat" }, feats.map((f, i) => React.createElement("li", { key: i }, f)))),
        React.createElement("div", { className: "card pad" },
            React.createElement("h2", null, t('App info')),
            React.createElement(InfoTable, { app: app })),
        React.createElement("div", { className: "card pad" },
            React.createElement("h3", null, "Share this app"),
            React.createElement(ShareBox, { app: app, tab: "/about" }))));
}
function Screenshots({ app, shots }) {
    const [open, setOpen] = useState(-1);
    useEffect(() => { const k = (e) => { if (e.key === 'Escape')
        setOpen(-1); if (e.key === 'ArrowRight')
        setOpen((i) => (i < 0 ? i : (i + 1) % shots.length)); if (e.key === 'ArrowLeft')
        setOpen((i) => (i < 0 ? i : (i - 1 + shots.length) % shots.length)); }; addEventListener('keydown', k); return () => removeEventListener('keydown', k); }, [shots.length]);
    return (React.createElement("div", { className: "card pad" },
        React.createElement("h2", null, "Screenshots"),
        shots.length ? React.createElement("div", { className: "shots-grid" }, shots.map((s, i) => React.createElement("img", { key: s.id, src: s.url, alt: `${app.name} screenshot ${i + 1}`, loading: "lazy", onClick: () => setOpen(i) }))) : React.createElement(Empty, null, "No screenshots yet."),
        open >= 0 && React.createElement("div", { className: "lightbox", onClick: () => setOpen(-1) },
            React.createElement("button", { className: "lb-nav l", onClick: (e) => { e.stopPropagation(); setOpen((open - 1 + shots.length) % shots.length); } }, "\u2039"),
            React.createElement("img", { src: shots[open].url, alt: "", onClick: (e) => e.stopPropagation() }),
            React.createElement("button", { className: "lb-nav r", onClick: (e) => { e.stopPropagation(); setOpen((open + 1) % shots.length); } }, "\u203A"),
            React.createElement("button", { className: "lb-x", onClick: () => setOpen(-1) },
                React.createElement(Ico, { n: "close" })))));
}
function Reviews({ app, reviews, avg, reload }) {
    const toast = useToast();
    const { settings } = useSite();
    const key = 'reviewed:' + app.slug;
    const [done, setDone] = useState(() => !!localStorage.getItem(key));
    const [name, setName] = useState(localStorage.getItem('reviewer') || '');
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [hp, setHp] = useState('');
    const [busy, setBusy] = useState(false);
    const dist = [5, 4, 3, 2, 1].map((n) => [n, reviews.filter((r) => r.rating === n).length]);
    const submit = async (e) => {
        e.preventDefault();
        if (hp)
            return;
        if (!rating)
            return toast('Please pick a star rating');
        setBusy(true);
        const { error } = await sb.from('ah_reviews').insert({ app_id: app.id, name: name.trim().slice(0, 60), rating, comment: comment.trim().slice(0, 1000) });
        setBusy(false);
        if (error)
            return toast('Could not post review: ' + error.message);
        try {
            localStorage.setItem(key, '1');
            localStorage.setItem('reviewer', name.trim());
        }
        catch { }
        setDone(true);
        setComment('');
        toast(settings.review_mode === 'manual' ? 'Thanks! Your review will appear after approval.' : 'Thanks for your review!');
        reload();
    };
    return (React.createElement("div", { className: "cols" },
        React.createElement("div", { className: "card pad" },
            React.createElement("h2", null, t('Ratings and reviews')),
            React.createElement("div", { className: "big-rate" },
                React.createElement("b", null, avg || '–'),
                React.createElement("div", null,
                    React.createElement(Stars, { value: avg, size: 18 }),
                    React.createElement("div", { className: "muted small" },
                        reviews.length,
                        " reviews")),
                React.createElement("div", { className: "dist" }, dist.map(([n, c]) => React.createElement("div", { key: n, className: "bar-row" },
                    React.createElement("span", null, n),
                    React.createElement("div", { className: "bar" },
                        React.createElement("i", { style: { width: reviews.length ? (c / reviews.length) * 100 + '%' : 0 } })))))),
            reviews.length ? reviews.map((r) => React.createElement(ReviewItem, { key: r.id, r: r })) : React.createElement(Empty, null, "No reviews yet \u2014 be the first!")),
        React.createElement("aside", null,
            React.createElement("div", { className: "card pad" },
                React.createElement("h3", null, t('Rate this app')),
                done ? React.createElement("p", { className: "muted" }, "You\u2019ve already reviewed this app on this device. Thank you!") :
                    React.createElement("form", { onSubmit: submit, className: "form" },
                        React.createElement(StarInput, { value: rating, onChange: setRating }),
                        React.createElement("label", null,
                            t('Your name'),
                            React.createElement("input", { required: true, maxLength: 60, value: name, onChange: (e) => setName(e.target.value) })),
                        React.createElement("label", null,
                            t('Review'),
                            React.createElement("textarea", { rows: 4, maxLength: 1000, value: comment, onChange: (e) => setComment(e.target.value), placeholder: "Describe your experience" })),
                        React.createElement("input", { className: "hp", tabIndex: -1, autoComplete: "off", value: hp, onChange: (e) => setHp(e.target.value) }),
                        React.createElement("button", { className: "btn", disabled: busy }, busy ? 'Posting…' : t('Post')))))));
}
function Changelog({ app, versions, dl }) {
    return (React.createElement("div", { className: "narrow-col" },
        React.createElement("div", { className: "card pad" },
            React.createElement("div", { className: "row between" },
                React.createElement("div", null,
                    React.createElement("h2", null,
                        t('Version'),
                        " ",
                        app.version,
                        " ",
                        React.createElement("span", { className: "chip sm" }, t('Latest'))),
                    React.createElement("div", { className: "muted small" },
                        new Date(app.updated_at).toLocaleDateString(),
                        app.size && ` · ${app.size}`)),
                React.createElement("button", { className: "btn sm", onClick: () => dl.start(app.download_url, app.version) }, t('Download'))),
            React.createElement(Md, { text: app.whats_new || 'Bug fixes and improvements.' }),
            versions[0] && React.createElement(ChangeDiff, { from: versions[0].notes, to: app.whats_new })),
        React.createElement("h3", { className: "sec-title" }, t('Older versions')),
        versions.length ? versions.map((v) => (React.createElement("div", { key: v.id, className: "card pad" },
            React.createElement("div", { className: "row between" },
                React.createElement("div", null,
                    React.createElement("h3", null,
                        "Version ",
                        v.version),
                    React.createElement("div", { className: "muted small" },
                        new Date(v.created_at).toLocaleDateString(),
                        v.size && ` · ${v.size}`)),
                React.createElement("button", { className: "btn sm ghost", onClick: () => dl.start(v.download_url, v.version) }, t('Download'))),
            v.notes && React.createElement(Md, { text: v.notes })))) : React.createElement(Empty, null, "No older versions available.")));
}
/* ----- forms ----- */
function useSubmit(kind) {
    const toast = useToast();
    const [busy, setBusy] = useState(false);
    const [sent, setSent] = useState(false);
    const send = async (row) => { setBusy(true); const { error } = await sb.from('ah_requests').insert({ kind, ...row }); setBusy(false); if (error)
        return toast('Could not send: ' + error.message); setSent(true); toast('Sent! Thank you.'); };
    return { busy, sent, send };
}
function RequestUpdate({ app }) {
    const { busy, sent, send } = useSubmit('update');
    const [f, setF] = useState({ name: '', email: '', message: '', hp: '' });
    const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
    if (sent)
        return React.createElement("div", { className: "card pad center" },
            React.createElement("h2", null, "Update request sent"),
            React.createElement("p", { className: "muted" },
                "The admin will look into updating ",
                app.name,
                "."));
    return (React.createElement("div", { className: "card pad narrow" },
        React.createElement("h2", null,
            "Request an update for ",
            app.name),
        React.createElement("p", { className: "muted" }, "Outdated version or a new feature? Tell us."),
        React.createElement("form", { className: "form", onSubmit: (e) => { e.preventDefault(); if (f.hp)
                return; send({ app_slug: app.slug, app_name: app.name, name: f.name.trim(), email: f.email.trim(), message: f.message.trim() }); } },
            React.createElement("label", null,
                "Your name",
                React.createElement("input", { value: f.name, onChange: set('name'), maxLength: 100 })),
            React.createElement("label", null,
                "Email (optional)",
                React.createElement("input", { type: "email", value: f.email, onChange: set('email'), maxLength: 200 })),
            React.createElement("label", null,
                "What should be updated?",
                React.createElement("textarea", { required: true, rows: 5, maxLength: 2000, value: f.message, onChange: set('message') })),
            React.createElement("input", { className: "hp", tabIndex: -1, autoComplete: "off", value: f.hp, onChange: set('hp') }),
            React.createElement("button", { className: "btn", disabled: busy }, busy ? 'Sending…' : 'Send request'))));
}
function RequestApp() {
    useEffect(() => { document.title = 'Request an app — Appshub'; }, []);
    const { busy, sent, send } = useSubmit('app');
    const [f, setF] = useState({ app: '', link: '', name: '', email: '', message: '', hp: '' });
    const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
    if (sent)
        return React.createElement("div", { className: "wrap page" },
            React.createElement("div", { className: "card pad center" },
                React.createElement("h2", null, "Request received"),
                React.createElement("p", { className: "muted" }, "We\u2019ll try to add it soon."),
                React.createElement(Link, { to: "/", className: "btn" }, "Back home")));
    return (React.createElement("div", { className: "wrap page" },
        React.createElement("div", { className: "card pad narrow" },
            React.createElement("h2", null, t('Request an app')),
            React.createElement("p", { className: "muted" }, "Can\u2019t find what you\u2019re looking for? Tell us which app you want."),
            React.createElement("form", { className: "form", onSubmit: (e) => { e.preventDefault(); if (f.hp)
                    return; send({ app_name: f.app.trim(), name: f.name.trim(), email: f.email.trim(), message: `${f.link ? 'Link: ' + f.link + '\n' : ''}${f.message}`.trim() || f.app.trim() }); } },
                React.createElement("label", null,
                    "App name",
                    React.createElement("input", { required: true, value: f.app, onChange: set('app'), maxLength: 100 })),
                React.createElement("label", null,
                    "Link (optional)",
                    React.createElement("input", { value: f.link, onChange: set('link'), maxLength: 300, placeholder: "https://\u2026" })),
                React.createElement("label", null,
                    "Your name",
                    React.createElement("input", { value: f.name, onChange: set('name'), maxLength: 100 })),
                React.createElement("label", null,
                    "Email (optional)",
                    React.createElement("input", { type: "email", value: f.email, onChange: set('email'), maxLength: 200 })),
                React.createElement("label", null,
                    "Anything else?",
                    React.createElement("textarea", { rows: 4, value: f.message, onChange: set('message'), maxLength: 1500 })),
                React.createElement("input", { className: "hp", tabIndex: -1, autoComplete: "off", value: f.hp, onChange: set('hp') }),
                React.createElement("button", { className: "btn", disabled: busy }, busy ? 'Sending…' : 'Submit request')))));
}
function Contact() {
    useEffect(() => { document.title = 'Contact admin — Appshub'; }, []);
    const { busy, sent, send } = useSubmit('contact');
    const [f, setF] = useState({ name: '', email: '', message: '', hp: '' });
    const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
    if (sent)
        return React.createElement("div", { className: "wrap page" },
            React.createElement("div", { className: "card pad center" },
                React.createElement("h2", null, "Message sent"),
                React.createElement("p", { className: "muted" }, "The admin will get back to you if needed."),
                React.createElement(Link, { to: "/", className: "btn" }, "Back home")));
    return (React.createElement("div", { className: "wrap page" },
        React.createElement("div", { className: "card pad narrow" },
            React.createElement("h2", null, t('Contact admin')),
            React.createElement("form", { className: "form", onSubmit: (e) => { e.preventDefault(); if (f.hp)
                    return; send({ name: f.name.trim(), email: f.email.trim(), message: f.message.trim() }); } },
                React.createElement("label", null,
                    "Your name",
                    React.createElement("input", { required: true, value: f.name, onChange: set('name'), maxLength: 100 })),
                React.createElement("label", null,
                    "Email",
                    React.createElement("input", { required: true, type: "email", value: f.email, onChange: set('email'), maxLength: 200 })),
                React.createElement("label", null,
                    "Message",
                    React.createElement("textarea", { required: true, rows: 6, value: f.message, onChange: set('message'), maxLength: 2000 })),
                React.createElement("input", { className: "hp", tabIndex: -1, autoComplete: "off", value: f.hp, onChange: set('hp') }),
                React.createElement("button", { className: "btn", disabled: busy }, busy ? 'Sending…' : t('Send message'))))));
}
const NotFound = () => React.createElement("div", { className: "wrap page" },
    React.createElement("div", { className: "card pad center" },
        React.createElement("h1", null, "404"),
        React.createElement("p", { className: "muted" }, "That page or app doesn\u2019t exist."),
        React.createElement(Link, { to: "/", className: "btn" }, "Go home")));
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
    const out = [];
    let rest = text, i = 0;
    const re = /(\*\*[^*]+\*\*|\*[^*\n]+\*|\[[^\]]+\]\([^)\s]+\)|`[^`]+`)/;
    while (rest) {
        const m = re.exec(rest);
        if (!m) {
            out.push(rest);
            break;
        }
        if (m.index)
            out.push(rest.slice(0, m.index));
        const tok = m[0];
        if (tok.startsWith('**'))
            out.push(React.createElement("strong", { key: i++ }, tok.slice(2, -2)));
        else if (tok.startsWith('`'))
            out.push(React.createElement("code", { key: i++ }, tok.slice(1, -1)));
        else if (tok.startsWith('*'))
            out.push(React.createElement("em", { key: i++ }, tok.slice(1, -1)));
        else {
            const mm = /\[([^\]]+)\]\(([^)\s]+)\)/.exec(tok);
            const u = safeUrl(mm[2]);
            out.push(u ? React.createElement("a", { key: i++, href: u, target: "_blank", rel: "noopener noreferrer nofollow" }, mm[1]) : mm[1]);
        }
        rest = rest.slice(m.index + tok.length);
    }
    return out;
}
function Md({ text }) {
    const out = [];
    let list = null;
    let para = [];
    let k = 0;
    const flushPara = () => { if (para.length) {
        out.push(React.createElement("p", { key: k++ }, para.map((l, i) => React.createElement(React.Fragment, { key: i },
            i > 0 && React.createElement("br", null),
            inlineMd(l)))));
        para = [];
    } };
    const flushList = () => { if (list) {
        const items = list.items.map((x, i) => React.createElement("li", { key: i }, inlineMd(x)));
        out.push(list.type === 'ol' ? React.createElement("ol", { key: k++ }, items) : React.createElement("ul", { key: k++ }, items));
        list = null;
    } };
    String(text || '').replace(/\r/g, '').split('\n').forEach((line) => {
        let m;
        if ((m = /^(#{1,3})\s+(.*)$/.exec(line))) {
            flushPara();
            flushList();
            out.push(m[1].length === 3 ? React.createElement("h4", { key: k++ }, inlineMd(m[2])) : React.createElement("h3", { key: k++ }, inlineMd(m[2])));
        }
        else if ((m = /^\s*[-*•]\s+(.*)$/.exec(line))) {
            flushPara();
            if (!list || list.type !== 'ul') {
                flushList();
                list = { type: 'ul', items: [] };
            }
            list.items.push(m[1]);
        }
        else if ((m = /^\s*\d+[.)]\s+(.*)$/.exec(line))) {
            flushPara();
            if (!list || list.type !== 'ol') {
                flushList();
                list = { type: 'ol', items: [] };
            }
            list.items.push(m[1]);
        }
        else if (!line.trim()) {
            flushPara();
            flushList();
        }
        else {
            flushList();
            para.push(line);
        }
    });
    flushPara();
    flushList();
    return React.createElement("div", { className: "md" }, out);
}
/* ---------- language switcher ---------- */
function LangSwitch() {
    return React.createElement("select", { className: "lang", "aria-label": t('Language'), value: LANG, onChange: (e) => { setLang(e.target.value); dispatchEvent(new Event('ah-lang')); } }, Object.entries(LANGS).map(([k, v]) => React.createElement("option", { key: k, value: k }, v.name)));
}
/* ---------- ad modal (+ optional human check) & download flow ---------- */
function AdModal({ banner, seconds, message, captcha, onContinue, onClose }) {
    const [ok, setOk] = useState(!captcha);
    const [left, setLeft] = useState(seconds);
    const [ans, setAns] = useState('');
    const [bad, setBad] = useState(false);
    const q = useMemo(() => ({ a: 2 + Math.floor(Math.random() * 8), b: 2 + Math.floor(Math.random() * 8) }), []);
    useAdTrack(banner === null || banner === void 0 ? void 0 : banner.id);
    useEffect(() => { if (!ok || left <= 0)
        return; const tm = setTimeout(() => setLeft(left - 1), 1000); return () => clearTimeout(tm); }, [left, ok]);
    const href = safeUrl(banner === null || banner === void 0 ? void 0 : banner.link_url);
    return (React.createElement("div", { className: "modal-back", role: "dialog", "aria-modal": "true" },
        React.createElement("div", { className: "modal" },
            React.createElement("button", { className: "icon-btn x", onClick: onClose, "aria-label": "Close" },
                React.createElement(Ico, { n: "close" })),
            !ok ? (React.createElement("form", { className: "form", onSubmit: (e) => { e.preventDefault(); if (Number(ans) === q.a + q.b)
                    setOk(true);
                else {
                    setBad(true);
                    setAns('');
                } } },
                React.createElement("p", { className: "ad-note" }, t('Verify you are human')),
                React.createElement("h2", null,
                    q.a,
                    " + ",
                    q.b,
                    " = ?"),
                React.createElement("input", { autoFocus: true, inputMode: "numeric", value: ans, onChange: (e) => setAns(e.target.value) }),
                bad && React.createElement("div", { className: "alert" }, t('Wrong answer, try again')),
                React.createElement("button", { className: "btn big" }, t('Check')))) : (React.createElement(React.Fragment, null,
                banner && React.createElement("p", { className: "ad-note" }, message),
                banner && (() => { const inner = (React.createElement("div", { className: "ad-box" },
                    banner.image_url && React.createElement("img", { src: banner.image_url, alt: "" }),
                    React.createElement("h3", null, banner.title),
                    React.createElement("p", null, banner.message),
                    React.createElement("span", { className: "ad-tag" }, "Ad"))); return href ? React.createElement("a", { href: href, target: "_blank", rel: "noopener noreferrer sponsored", onClick: () => clickAd(banner.id) }, inner) : inner; })(),
                React.createElement("button", { className: "btn big", disabled: left > 0, onClick: onContinue }, left > 0 ? `${t('Your download will be ready in')} ${left}s…` : t('Continue to download')))))));
}
function useDownload(app) {
    const { banners, settings } = useSite();
    const toast = useToast();
    const [pending, setPending] = useState(null);
    const popups = banners.filter((b) => b.placement === 'popup');
    const captcha = settings.download_captcha === 'on';
    const go = (url, version) => {
        window.open(safeUrl(url), '_blank', 'noopener');
        setPending(null);
        toast('Download started');
        getCountry().then((c) => sb.rpc('ah_track_download', { p_slug: app.slug, p_country: c, p_version: version || app.version })).then(() => { });
    };
    const start = (url, version) => {
        if (!safeUrl(url))
            return toast('Download link not available yet');
        if (popups.length || captcha)
            setPending({ url, version, banner: popups.length ? popups[Math.floor(Math.random() * popups.length)] : null });
        else
            go(url, version);
    };
    const modal = pending && React.createElement(AdModal, { banner: pending.banner, seconds: pending.banner ? Number(settings.popup_seconds) || 5 : 0, captcha: captcha, message: settings.popup_message || 'These ads help us pay for this service.', onContinue: () => go(pending.url, pending.version), onClose: () => setPending(null) });
    return { start, modal };
}
/* ---------- push helpers ---------- */
const pushOK = () => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
const b64u = (b64) => { const s = (b64 + '='.repeat((4 - (b64.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/'); const raw = atob(s); return Uint8Array.from([...raw].map((c) => c.charCodeAt(0))); };
async function enablePush(vapid, slugs, cats) {
    const reg = await navigator.serviceWorker.ready;
    if ((await Notification.requestPermission()) !== 'granted')
        throw new Error('Notifications are blocked in your browser settings');
    let sub = await reg.pushManager.getSubscription();
    if (!sub)
        sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64u(vapid) });
    const j = sub.toJSON();
    const { error } = await sb.rpc('ah_push_save', { p_endpoint: j.endpoint, p_p256dh: j.keys.p256dh, p_auth: j.keys.auth, p_slugs: slugs, p_categories: cats });
    if (error)
        throw error;
    lsSet('ah_push', { on: true, cats });
}
async function disablePush() {
    try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
            await sb.rpc('ah_push_remove', { p_endpoint: sub.endpoint });
            await sub.unsubscribe();
        }
    }
    catch { }
    lsSet('ah_push', { on: false, cats: [] });
}
async function syncPush(slugs) {
    const st = lsGet('ah_push', null);
    if (!(st === null || st === void 0 ? void 0 : st.on) || !pushOK())
        return;
    try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (!sub)
            return;
        const j = sub.toJSON();
        await sb.rpc('ah_push_save', { p_endpoint: j.endpoint, p_p256dh: j.keys.p256dh, p_auth: j.keys.auth, p_slugs: slugs, p_categories: st.cats || [] });
    }
    catch { }
}
/* ---------- subscribe card (email + push, per category) ---------- */
function SubscribeCard({ cats }) {
    const toast = useToast();
    const { saved, settings } = useSite();
    const [email, setEmail] = useState('');
    const [sel, setSel] = useState(lsGet('ah_push', {}).cats || []);
    const [busy, setBusy] = useState(false);
    const [pushOn, setPushOn] = useState(!!lsGet('ah_push', {}).on);
    const [subbed, setSubbed] = useState(!!lsGet('ah_sub', false));
    const toggle = (c) => setSel(sel.includes(c) ? sel.filter((x) => x !== c) : [...sel, c]);
    const subscribe = async (e) => {
        e.preventDefault();
        setBusy(true);
        const { error } = await sb.rpc('ah_subscribe', { p_email: email.trim(), p_categories: sel });
        setBusy(false);
        if (error)
            return toast('Please enter a valid email');
        lsSet('ah_sub', true);
        setSubbed(true);
        toast('Subscribed! 🎉');
    };
    const push = async () => {
        try {
            if (pushOn) {
                await disablePush();
                setPushOn(false);
                toast('Notifications turned off');
            }
            else {
                await enablePush(settings.vapid_public, saved, sel);
                setPushOn(true);
                toast('Notifications enabled 🔔');
            }
        }
        catch (e) {
            toast(e.message || 'Could not enable notifications');
        }
    };
    return (React.createElement("div", { className: "card pad sub-card" },
        React.createElement("h3", null,
            "\uD83D\uDD14 ",
            t('Get notified about new apps')),
        cats.length > 1 && React.createElement("div", { className: "chips inline" }, cats.map((c) => React.createElement("button", { type: "button", key: c, className: 'chip' + (sel.includes(c) ? ' active' : ''), onClick: () => toggle(c) }, c))),
        React.createElement("form", { className: "row sub-form", onSubmit: subscribe },
            subbed ? React.createElement("span", { className: "muted" },
                "\u2713 ",
                email || 'Subscribed') : React.createElement(React.Fragment, null,
                React.createElement("input", { className: "grow", type: "email", required: true, placeholder: t('Your email'), value: email, onChange: (e) => setEmail(e.target.value) }),
                React.createElement("button", { className: "btn", disabled: busy }, t('Subscribe'))),
            pushOK() && settings.vapid_public && React.createElement("button", { type: "button", className: "btn ghost", onClick: push }, pushOn ? '🔕 Off' : t('Enable notifications'))),
        cats.length > 1 && React.createElement("p", { className: "muted small" }, "Pick categories above (leave empty for everything).")));
}
function UnsubscribePage() {
    const { loc } = useRouter();
    const tk = new URLSearchParams(loc.split('?')[1] || '').get('t');
    const [state, setState] = useState('busy');
    useEffect(() => { if (!tk)
        return setState('bad'); sb.rpc('ah_unsubscribe', { p_token: tk }).then(({ data, error }) => setState(!error && data ? 'ok' : 'bad')); }, [tk]);
    return React.createElement("div", { className: "wrap page" },
        React.createElement("div", { className: "card pad narrow center" },
            state === 'busy' ? React.createElement(Loader, null) : state === 'ok' ? React.createElement(React.Fragment, null,
                React.createElement("h2", null, "Unsubscribed"),
                React.createElement("p", { className: "muted" }, "You won\u2019t get any more emails from us.")) : React.createElement(React.Fragment, null,
                React.createElement("h2", null, "Link expired"),
                React.createElement("p", { className: "muted" }, "This unsubscribe link isn\u2019t valid (maybe you already unsubscribed).")),
            React.createElement(Link, { to: "/", className: "btn" }, t('Apps'))));
}
/* ---------- donate ---------- */
function DonateCard() {
    const { settings } = useSite();
    const url = safeUrl(settings.donate_url);
    const label = t(settings.donate_label || 'Support us');
    if (!url && !settings.donate_text)
        return null;
    return (React.createElement("div", { className: "card pad donate" },
        React.createElement("h3", null,
            "\u2665 ",
            label),
        settings.donate_text && React.createElement("p", { className: "pre muted" }, settings.donate_text),
        url && React.createElement("a", { className: "btn", href: url, target: "_blank", rel: "noopener noreferrer" }, label)));
}
const DonatePage = () => React.createElement("div", { className: "wrap page" },
    React.createElement("div", { className: "narrow" },
        React.createElement(DonateCard, null)));
/* ---------- legal pages ---------- */
function LegalPage({ kind }) {
    const { settings } = useSite();
    const title = kind === 'terms' ? 'Terms of Service' : 'Privacy Policy';
    const body = settings[kind + '_content'];
    useEffect(() => { document.title = `${title} — Appshub`; }, []);
    return (React.createElement("div", { className: "wrap page" },
        React.createElement("div", { className: "narrow-col" },
            React.createElement("div", { className: "card pad" },
                React.createElement("h1", null, title),
                body ? React.createElement(Md, { text: body }) : React.createElement("p", { className: "muted" }, "This page hasn\u2019t been written yet.")))));
}
/* ---------- simple word-level diff (for "what changed" between versions) ---------- */
function wordDiff(oldText, newText) {
    const a = String(oldText || '').split(/(\s+)/), b = String(newText || '').split(/(\s+)/);
    const m = a.length, n2 = b.length;
    const dp = Array.from({ length: m + 1 }, () => new Array(n2 + 1).fill(0));
    for (let i = m - 1; i >= 0; i--)
        for (let j = n2 - 1; j >= 0; j--)
            dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    const out = [];
    let i = 0, j = 0;
    while (i < m && j < n2) {
        if (a[i] === b[j]) {
            out.push([0, b[j]]);
            i++;
            j++;
        }
        else if (dp[i + 1][j] >= dp[i][j + 1]) {
            out.push([-1, a[i]]);
            i++;
        }
        else {
            out.push([1, b[j]]);
            j++;
        }
    }
    while (i < m)
        out.push([-1, a[i++]]);
    while (j < n2)
        out.push([1, b[j++]]);
    return out;
}
function ChangeDiff({ from, to }) {
    if (!from || !from.trim() || from.trim() === to.trim())
        return null;
    const parts = wordDiff(from, to);
    return (React.createElement("details", { className: "diff" },
        React.createElement("summary", null, "See what changed"),
        React.createElement("p", { className: "pre" }, parts.map(([t2, w], i) => t2 === 0 ? w : t2 === 1 ? React.createElement("ins", { key: i }, w) : React.createElement("del", { key: i }, w)))));
}
/* ---------- home ---------- */
function Home() {
    const { loc } = useRouter();
    const { settings } = useSite();
    const q = (new URLSearchParams(loc.split('?')[1] || '').get('q') || '').trim();
    const { apps, err } = useApps();
    const [cat, setCat] = useState('All');
    const [trend, setTrend] = useState([]);
    const [cols, setCols] = useState([]);
    useEffect(() => { sb.rpc('ah_trending', { p_days: 7 }).then(({ data }) => setTrend(data || [])); sb.from('ah_collections').select('*').eq('active', true).order('sort').then(({ data }) => setCols(data || [])); }, []);
    useEffect(() => { document.title = `${settings.site_name || 'Appshub'} — Download apps`; }, [settings]);
    if (!apps)
        return React.createElement(Loader, null);
    const byId = Object.fromEntries(apps.map((a) => [a.id, a]));
    const bySlug = Object.fromEntries(apps.map((a) => [a.slug, a]));
    const cats = ['All', ...new Set(apps.map((a) => a.category).filter(Boolean))];
    const featured = apps.filter((a) => a.is_featured);
    const top = [...apps].sort((a, b) => b.downloads - a.downloads).filter((a) => a.downloads > 0).slice(0, 12);
    const rated = [...apps].filter((a) => a.review_count > 0).sort((a, b) => b.avg_rating - a.avg_rating).slice(0, 12);
    const fresh = [...apps].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)).slice(0, 12);
    const trending = trend.map((x) => byId[x.app_id]).filter(Boolean).slice(0, 12);
    const recent = getRecent().map((s) => bySlug[s]).filter(Boolean).slice(0, 12);
    const results = q ? apps.filter((a) => (a.name + a.short_desc + a.category + a.developer + (a.seo_keywords || '')).toLowerCase().includes(q.toLowerCase())) : cat !== 'All' ? apps.filter((a) => a.category === cat) : null;
    return (React.createElement("div", { className: "page" },
        React.createElement("div", { className: "chips-bar" },
            React.createElement("div", { className: "wrap chips" }, cats.map((c) => React.createElement("button", { key: c, className: 'chip' + (c === cat && !q ? ' active' : ''), onClick: () => { setCat(c); if (q) {
                    history.pushState({}, '', '/');
                    dispatchEvent(new PopStateEvent('popstate'));
                } } }, c === 'All' ? t('All') : c)))),
        React.createElement("div", { className: "wrap" },
            React.createElement(TopBanners, null),
            err && React.createElement("div", { className: "alert" },
                "Could not load apps: ",
                err),
            results ? (React.createElement("section", null,
                React.createElement("h2", { className: "sec-title" }, q ? `${t('Results for')} “${q}”` : cat),
                results.length ? React.createElement("div", { className: "list" }, results.map((a) => React.createElement(ListRow, { key: a.id, app: a }))) : React.createElement(Empty, null,
                    t('No apps found.'),
                    " ",
                    React.createElement(Link, { to: "/request-app", className: "link" },
                        t('Request an app'),
                        " \u2192")))) : (React.createElement(React.Fragment, null,
                !apps.length && React.createElement(Empty, null, "No apps published yet."),
                React.createElement(Shelf, { title: t('Recently viewed'), apps: recent }),
                React.createElement(Shelf, { title: t('Featured'), apps: featured }),
                cols.map((c) => React.createElement(Shelf, { key: c.id, title: c.title, apps: (c.app_ids || []).map((id) => byId[id]).filter(Boolean) })),
                React.createElement(Shelf, { title: t('Trending this week'), to: "/top?c=trending", apps: trending }),
                React.createElement(Shelf, { title: t('Most downloaded'), to: "/top", apps: top }),
                React.createElement(Shelf, { title: t('Top rated'), to: "/top?c=rated", apps: rated }),
                React.createElement(Shelf, { title: t('New & updated'), to: "/top?c=new", apps: fresh }),
                cats.slice(1).map((c) => React.createElement(Shelf, { key: c, title: c, apps: apps.filter((a) => a.category === c).slice(0, 12) })),
                React.createElement(SubscribeCard, { cats: cats.slice(1) }),
                React.createElement(DonateCard, null),
                React.createElement("div", { className: "cta card" },
                    React.createElement("h3", null, t('Can’t find an app?')),
                    React.createElement("p", { className: "muted" }, t('Tell us what you need and we’ll try to add it.')),
                    React.createElement(Link, { to: "/request-app", className: "btn" }, t('Request an app'))))))));
}
function TopCharts() {
    const { loc, nav } = useRouter();
    const c = new URLSearchParams(loc.split('?')[1] || '').get('c') || 'downloads';
    const { apps } = useApps();
    const [trend, setTrend] = useState([]);
    useEffect(() => { document.title = 'Top charts — Appshub'; sb.rpc('ah_trending', { p_days: 7 }).then(({ data }) => setTrend(data || [])); }, []);
    if (!apps)
        return React.createElement(Loader, null);
    const byId = Object.fromEntries(apps.map((a) => [a.id, a]));
    const sorted = c === 'trending' ? trend.map((x) => byId[x.app_id]).filter(Boolean)
        : c === 'rated' ? [...apps].filter((a) => a.review_count).sort((a, b) => b.avg_rating - a.avg_rating || b.review_count - a.review_count)
            : c === 'new' ? [...apps].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) : [...apps].sort((a, b) => b.downloads - a.downloads);
    return (React.createElement("div", { className: "wrap page" },
        React.createElement("h1", { className: "sec-title big" }, t('Top charts')),
        React.createElement("div", { className: "chips" }, [['downloads', 'Most downloaded'], ['trending', 'Trending this week'], ['rated', 'Top rated'], ['new', 'New & updated']].map(([k, l]) => React.createElement("button", { key: k, className: 'chip' + (k === c ? ' active' : ''), onClick: () => nav('/top?c=' + k) }, t(l)))),
        sorted.length ? React.createElement("div", { className: "list" }, sorted.map((a, i) => React.createElement(ListRow, { key: a.id, app: a, rank: i + 1 }))) : React.createElement(Empty, null, "Nothing here yet.")));
}
/* ---------- reviews (report) + Q&A ---------- */
function ReportBtn({ id, rpc, prefix }) {
    const toast = useToast();
    const [done, setDone] = useState(() => !!localStorage.getItem(prefix + id));
    if (done)
        return React.createElement("span", { className: "muted small" }, "Reported");
    return React.createElement("button", { className: "link-btn small", onClick: async () => { await sb.rpc(rpc, { p_id: id }); try {
            localStorage.setItem(prefix + id, '1');
        }
        catch { } setDone(true); toast('Thanks — we’ll review it'); } },
        React.createElement(Ico, { n: "flag", s: 13 }),
        " ",
        t('Report'));
}
function ReviewItem({ r }) {
    var _a;
    return (React.createElement("div", { className: "review" },
        React.createElement("div", { className: "rev-h" },
            React.createElement("span", { className: "avatar" }, (_a = r.name[0]) === null || _a === void 0 ? void 0 : _a.toUpperCase()),
            React.createElement("b", null, r.name)),
        React.createElement("div", { className: "rev-m" },
            React.createElement(Stars, { value: r.rating, size: 13 }),
            " ",
            React.createElement("span", { className: "muted small" }, timeAgo(r.created_at)),
            " ",
            React.createElement(ReportBtn, { id: r.id, rpc: "ah_report_review", prefix: "rr:" })),
        r.comment && React.createElement("p", { className: "pre" }, r.comment),
        r.admin_reply && React.createElement("div", { className: "reply" },
            React.createElement("b", null, t('Developer response')),
            " ",
            React.createElement("span", { className: "muted small" }, r.replied_at && timeAgo(r.replied_at)),
            React.createElement("p", { className: "pre" }, r.admin_reply))));
}
function Questions({ app }) {
    const toast = useToast();
    const { settings } = useSite();
    const [rows, setRows] = useState(null);
    const [name, setName] = useState(localStorage.getItem('reviewer') || '');
    const [msg, setMsg] = useState('');
    const [hp, setHp] = useState('');
    const [busy, setBusy] = useState(false);
    const [replyTo, setReplyTo] = useState(null);
    const [rmsg, setRmsg] = useState('');
    const load = () => sb.from('ah_comments').select('*').eq('app_id', app.id).order('created_at', { ascending: true }).then(({ data }) => setRows(data || []));
    useEffect(() => { load(); }, [app.id]);
    const post = async (message, parent) => {
        if (hp || !message.trim() || !name.trim())
            return toast(name.trim() ? 'Write something first' : 'Please enter your name');
        setBusy(true);
        const { error } = await sb.from('ah_comments').insert({ app_id: app.id, parent_id: parent || null, name: name.trim().slice(0, 60), message: message.trim().slice(0, 1000) });
        setBusy(false);
        if (error)
            return toast(error.message);
        try {
            localStorage.setItem('reviewer', name.trim());
        }
        catch { }
        setMsg('');
        setRmsg('');
        setReplyTo(null);
        toast(settings.review_mode === 'manual' ? 'Thanks! It will appear after approval.' : 'Posted');
        load();
    };
    if (!rows)
        return React.createElement(Loader, null);
    const tops = rows.filter((r) => !r.parent_id).reverse();
    const kids = (id) => rows.filter((r) => r.parent_id === id);
    const item = (c, child) => {
        var _a;
        return (React.createElement("div", { key: c.id, className: 'qa' + (child ? ' child' : '') },
            React.createElement("div", { className: "rev-h" },
                React.createElement("span", { className: 'avatar' + (c.is_admin ? ' dev' : '') }, (_a = c.name[0]) === null || _a === void 0 ? void 0 : _a.toUpperCase()),
                React.createElement("b", null, c.name),
                c.is_admin && React.createElement("span", { className: "chip sm" }, "Developer"),
                React.createElement("span", { className: "muted small" }, timeAgo(c.created_at))),
            React.createElement("p", { className: "pre" }, c.message),
            React.createElement("div", { className: "row small" },
                !child && React.createElement("button", { className: "link-btn small", onClick: () => setReplyTo(replyTo === c.id ? null : c.id) }, t('Reply')),
                !c.is_admin && React.createElement(ReportBtn, { id: c.id, rpc: "ah_report_comment", prefix: "rc:" })),
            replyTo === c.id && React.createElement("div", { className: "form" },
                React.createElement("textarea", { rows: 2, maxLength: 1000, value: rmsg, onChange: (e) => setRmsg(e.target.value) }),
                React.createElement("div", { className: "row" },
                    React.createElement("button", { className: "btn sm", disabled: busy, onClick: () => post(rmsg, c.id) }, t('Send'))))));
    };
    return (React.createElement("div", { className: "cols" },
        React.createElement("div", { className: "card pad" },
            React.createElement("h2", null, t('Questions & answers')),
            tops.length ? tops.map((c) => React.createElement("div", { key: c.id, className: "thread" },
                item(c),
                kids(c.id).map((k) => item(k, true)))) : React.createElement(Empty, null, "No questions yet \u2014 ask the first one!")),
        React.createElement("aside", null,
            React.createElement("div", { className: "card pad" },
                React.createElement("h3", null, t('Ask a question')),
                React.createElement("div", { className: "form" },
                    React.createElement("label", null,
                        t('Your name'),
                        React.createElement("input", { maxLength: 60, value: name, onChange: (e) => setName(e.target.value) })),
                    React.createElement("label", null,
                        t('Your question'),
                        React.createElement("textarea", { rows: 4, maxLength: 1000, value: msg, onChange: (e) => setMsg(e.target.value) })),
                    React.createElement("input", { className: "hp", tabIndex: -1, autoComplete: "off", value: hp, onChange: (e) => setHp(e.target.value) }),
                    React.createElement("button", { className: "btn", disabled: busy, onClick: () => post(msg) }, t('Send')))))));
}
/* ---------- download page (checksum, VirusTotal, donate) ---------- */
function Download({ app, dl }) {
    const toast = useToast();
    const [reported, setReported] = useState(() => !!localStorage.getItem('rep:' + app.slug));
    const links = [{ label: t('Download') + ' ' + app.name, url: app.download_url }, ...(Array.isArray(app.extra_links) ? app.extra_links : [])].filter((l) => safeUrl(l.url));
    const vt = app.sha256 ? `https://www.virustotal.com/gui/file/${app.sha256}` : safeUrl(app.download_url) ? `https://www.virustotal.com/gui/search/${encodeURIComponent(app.download_url)}` : '';
    const report = async () => {
        const { error } = await sb.from('ah_requests').insert({ kind: 'report', app_slug: app.slug, app_name: app.name, message: `Broken download link reported for ${app.name} v${app.version}` });
        if (error)
            return toast('Could not send report');
        try {
            localStorage.setItem('rep:' + app.slug, '1');
        }
        catch { }
        setReported(true);
        toast('Thanks — we’ll check the link');
    };
    return (React.createElement("div", { className: "cols" },
        React.createElement("div", null,
            React.createElement("div", { className: "card pad center" },
                React.createElement(Icon, { app: app, size: 96 }),
                React.createElement("h2", null,
                    app.name,
                    " ",
                    app.is_verified && React.createElement(Verified, null)),
                React.createElement("p", { className: "muted" },
                    t('Version'),
                    " ",
                    app.version,
                    app.size && ` · ${app.size}`,
                    " \u00B7 ",
                    app.platform),
                app.broken_reports >= 3 && React.createElement("div", { className: "alert warn" },
                    React.createElement(Ico, { n: "warn", s: 18 }),
                    " Some users reported this link as broken."),
                links.length ? React.createElement("div", { className: "dl-list" }, links.map((l, i) => React.createElement("button", { key: i, className: 'btn big' + (i ? ' ghost' : ''), onClick: () => dl.start(l.url, app.version) }, l.label))) : React.createElement(Empty, null, "Download link is not available yet. Please check back soon."),
                (app.sha256 || vt) && React.createElement("div", { className: "checksum" },
                    app.sha256 && React.createElement(React.Fragment, null,
                        React.createElement("b", null, t('Checksum (SHA-256)')),
                        React.createElement("code", null, app.sha256),
                        React.createElement("button", { className: "link-btn small", onClick: () => { navigator.clipboard.writeText(app.sha256); toast('Copied'); } }, t('Copy'))),
                    vt && React.createElement("a", { className: "btn sm ghost", href: vt, target: "_blank", rel: "noopener noreferrer" },
                        "\uD83D\uDEE1 ",
                        t('Scan on VirusTotal'))),
                React.createElement("p", { className: "muted small" },
                    "Older versions are on the ",
                    React.createElement(Link, { to: `/${app.slug}/changelog`, className: "link" }, t('What’s new')),
                    " page."),
                React.createElement("p", { className: "small" }, reported ? React.createElement("span", { className: "muted" }, "Report sent. Thank you!") : React.createElement("button", { className: "link-btn", onClick: report },
                    React.createElement(Ico, { n: "flag", s: 14 }),
                    " ",
                    t('Report broken link')))),
            React.createElement(DonateCard, null)),
        React.createElement("aside", null,
            React.createElement("div", { className: "card pad" },
                React.createElement("h3", null, "Share this download"),
                React.createElement(ShareBox, { app: app, tab: "/download" })))));
}
/* ---------- analytics (Google Analytics or Plausible) ---------- */
function useAnalytics(settings, loc, consent) {
    const p = settings.analytics_provider, id = (settings.analytics_id || '').trim();
    useEffect(() => {
        if (window.__ahAnalytics || !id || !consent)
            return;
        if (p === 'ga' && /^G-[A-Z0-9]+$/.test(id)) {
            window.__ahAnalytics = true;
            window.dataLayer = window.dataLayer || [];
            window.gtag = function () { dataLayer.push(arguments); };
            gtag('js', new Date());
            gtag('config', id, { send_page_view: false });
            const s = document.createElement('script');
            s.async = true;
            s.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
            document.head.appendChild(s);
        }
        if (p === 'plausible' && /^[a-z0-9.-]+$/i.test(id)) {
            window.__ahAnalytics = true;
            const s = document.createElement('script');
            s.defer = true;
            s.dataset.domain = id;
            s.src = 'https://plausible.io/js/script.js';
            document.head.appendChild(s);
        }
    }, [p, id]);
    useEffect(() => { if (window.gtag && p === 'ga' && consent)
        gtag('event', 'page_view', { page_path: loc, page_title: document.title }); }, [loc, p, consent]);
}
/* ---------- cookie consent banner ---------- */
function CookieBanner({ show, onDecide }) {
    if (!show)
        return null;
    return (React.createElement("div", { className: "cookie-bar", role: "dialog", "aria-label": "Cookie notice" },
        React.createElement("p", null,
            "This site uses analytics cookies to understand how visitors use it. ",
            React.createElement(Link, { to: "/privacy" }, "Learn more")),
        React.createElement("div", { className: "row" },
            React.createElement("button", { className: "btn sm ghost", onClick: () => onDecide(false) }, "Decline"),
            React.createElement("button", { className: "btn sm", onClick: () => onDecide(true) }, "Accept"))));
}
/* =========================================================
   ROOT
   ========================================================= */
function App() {
    const { loc } = useRouter();
    const [site, setSite] = useState({ settings: {}, banners: [] });
    const [saved, setSaved] = useState(() => lsGet('ah_saved', []));
    const [consent, setConsent] = useState(() => lsGet('ah_cookie_consent', null));
    useEffect(() => { Promise.all([sb.from('ah_settings').select('*'), sb.from('ah_banners').select('*').eq('active', true)]).then(([s, b]) => setSite({ settings: Object.fromEntries((s.data || []).map((r) => [r.key, r.value])), banners: (b.data || []).filter(isLive) })); }, []);
    useEffect(() => { syncPush(saved); }, [saved]);
    useAnalytics(site.settings, loc, consent === true);
    const decide = (v) => { setConsent(v); lsSet('ah_cookie_consent', v); };
    const needsConsent = site.settings.cookie_notice !== 'off' && site.settings.analytics_provider && site.settings.analytics_provider !== 'none' && consent === null;
    const toggleSaved = useCallback((slug) => setSaved((cur) => { const n = cur.includes(slug) ? cur.filter((x) => x !== slug) : [...cur, slug]; lsSet('ah_saved', n); return n; }), []);
    const parts = loc.split('?')[0].split('/').filter(Boolean).map(decodeURIComponent);
    let page;
    if (!parts.length)
        page = React.createElement(Home, null);
    else if (parts[0] === 'admin')
        page = React.createElement(Admin, null);
    else if (parts[0] === 'top')
        page = React.createElement(TopCharts, null);
    else if (parts[0] === 'saved')
        page = React.createElement(Saved, null);
    else if (parts[0] === 'donate')
        page = React.createElement(DonatePage, null);
    else if (parts[0] === 'terms')
        page = React.createElement(LegalPage, { kind: "terms" });
    else if (parts[0] === 'privacy')
        page = React.createElement(LegalPage, { kind: "privacy" });
    else if (parts[0] === 'compare')
        page = React.createElement(ComparePage, null);
    else if (parts[0] === 'unsubscribe')
        page = React.createElement(UnsubscribePage, null);
    else if (parts[0] === 'request-app')
        page = React.createElement(RequestApp, null);
    else if (parts[0] === 'contact')
        page = React.createElement(Contact, null);
    else if (parts.length > 2 || RESERVED.includes(parts[0]))
        page = React.createElement(NotFound, null);
    else
        page = React.createElement(AppPage, { slug: parts[0], tab: parts[1] || 'overview', key: parts[0] });
    return (React.createElement(SiteCtx.Provider, { value: { ...site, saved, toggleSaved } },
        React.createElement("a", { href: "#main", className: "skip-link" }, "Skip to content"),
        React.createElement(Header, null),
        React.createElement("main", { id: "main", tabIndex: -1 }, page),
        React.createElement(Footer, null),
        React.createElement(BottomNav, null),
        React.createElement(CookieBanner, { show: needsConsent, onDecide: decide })));
}
/* ---------- compare two apps ---------- */
function ComparePage() {
    const { loc, nav } = useRouter();
    const qs = new URLSearchParams(loc.split('?')[1] || '');
    const { apps } = useApps();
    const [a, setA] = useState(qs.get('a') || '');
    const [b, setB] = useState(qs.get('b') || '');
    useEffect(() => { document.title = 'Compare apps — Appshub'; }, []);
    if (!apps)
        return React.createElement(Loader, null);
    const bySlug = Object.fromEntries(apps.map((x) => [x.slug, x]));
    const appA = bySlug[a], appB = bySlug[b];
    const go = (na, nb) => nav(`/compare${na || nb ? `?a=${na}&b=${nb}` : ''}`);
    const Row = (label, get) => React.createElement("tr", null,
        React.createElement("td", null, label),
        React.createElement("td", null, appA ? get(appA) : '–'),
        React.createElement("td", null, appB ? get(appB) : '–'));
    return (React.createElement("div", { className: "wrap page" },
        React.createElement("h1", { className: "sec-title big" }, "Compare apps"),
        React.createElement("div", { className: "form two" },
            React.createElement("label", null,
                "App A",
                React.createElement("select", { value: a, onChange: (e) => { setA(e.target.value); go(e.target.value, b); } },
                    React.createElement("option", { value: "" }, "\u2014 choose \u2014"),
                    apps.map((x) => React.createElement("option", { key: x.slug, value: x.slug }, x.name)))),
            React.createElement("label", null,
                "App B",
                React.createElement("select", { value: b, onChange: (e) => { setB(e.target.value); go(a, e.target.value); } },
                    React.createElement("option", { value: "" }, "\u2014 choose \u2014"),
                    apps.map((x) => React.createElement("option", { key: x.slug, value: x.slug }, x.name))))),
        (appA || appB) && React.createElement("div", { className: "table-wrap", style: { marginTop: 18 } },
            React.createElement("table", { className: "table compare" },
                React.createElement("thead", null,
                    React.createElement("tr", null,
                        React.createElement("th", null),
                        React.createElement("th", null, appA ? React.createElement(Link, { to: `/${appA.slug}` },
                            React.createElement(Icon, { app: appA, size: 40 }),
                            " ",
                            appA.name) : '—'),
                        React.createElement("th", null, appB ? React.createElement(Link, { to: `/${appB.slug}` },
                            React.createElement(Icon, { app: appB, size: 40 }),
                            " ",
                            appB.name) : '—'))),
                React.createElement("tbody", null,
                    Row('Rating', (x) => x.review_count ? React.createElement(React.Fragment, null,
                        x.avg_rating,
                        " ",
                        React.createElement(Ico, { n: "star", s: 12 }),
                        " (",
                        x.review_count,
                        ")") : '–'),
                    Row('Downloads', (x) => dlBucket(x.downloads)),
                    Row('Size', (x) => x.size || '–'),
                    Row('Version', (x) => x.version),
                    Row('Category', (x) => x.category),
                    Row('Developer', (x) => x.developer || '–'),
                    Row('Rated for', (x) => x.content_rating))))));
}
/* =========================================================
   ADMIN (roles: owner = everything, editor = content only)
   ========================================================= */
const SAFE = (n) => n.toLowerCase().replace(/[^a-z0-9._-]+/g, '-');
const MAX_UPLOAD = 100 * 1024 * 1024; // 100 MB
const IMG_TYPES = ['icons', 'screenshots', 'banners'];
async function optimizeImage(file, maxDim) {
    if (!file.type.startsWith('image/') || file.type === 'image/svg+xml' || file.type === 'image/gif')
        return file;
    try {
        const bitmap = await createImageBitmap(file);
        const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
        const w = Math.round(bitmap.width * scale), h = Math.round(bitmap.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(bitmap, 0, 0, w, h);
        const blob = await new Promise((res) => canvas.toBlob(res, 'image/webp', 0.85));
        if (!blob || blob.size >= file.size)
            return file; // keep original if webp didn't help (e.g. unsupported)
        return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.webp', { type: 'image/webp' });
    }
    catch {
        return file;
    } // unsupported browser — fall back to the original file
}
async function uploadFile(file, folder) {
    if (IMG_TYPES.includes(folder))
        file = await optimizeImage(file, folder === 'icons' ? 512 : 1600);
    if (file.size > MAX_UPLOAD)
        throw new Error(`File is ${(file.size / 1024 / 1024).toFixed(1)} MB — the limit is 100 MB.`);
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 6)}-${SAFE(file.name)}`;
    const { error } = await sb.storage.from('appshub').upload(path, file, { cacheControl: '31536000', upsert: false });
    if (error)
        throw error;
    return sb.storage.from('appshub').getPublicUrl(path).data.publicUrl;
}
async function sha256File(file) { const h = await crypto.subtle.digest('SHA-256', await file.arrayBuffer()); return [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, '0')).join(''); }
const toCSV = (rows) => { if (!rows.length)
    return ''; const cols = [...new Set(rows.flatMap((r) => Object.keys(r)))]; const esc = (v) => { if (v == null)
    return ''; v = typeof v === 'object' ? JSON.stringify(v) : String(v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }; return [cols.join(','), ...rows.map((r) => cols.map((c) => esc(r[c])).join(','))].join('\n'); };
const saveFile = (name, text, type = 'text/csv') => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); };
async function fetchAll(table) { let all = [], from = 0; for (;;) {
    const { data, error } = await sb.from(table).select('*').range(from, from + 999);
    if (error)
        throw error;
    all = all.concat(data);
    if (data.length < 1000)
        break;
    from += 1000;
} return all; }
const toLocalInput = (d) => (d ? new Date(new Date(d).getTime() - new Date(d).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '');
/* ---------- simple rich-text (Markdown) editor ---------- */
function MdEditor({ value, onChange, rows = 6 }) {
    const ref = useRef();
    const [preview, setPreview] = useState(false);
    value = value || '';
    const wrap = (a, b = a, ph = 'text') => { const el = ref.current, s = el.selectionStart, e = el.selectionEnd, sel = value.slice(s, e) || ph; onChange(value.slice(0, s) + a + sel + b + value.slice(e)); setTimeout(() => { el.focus(); el.setSelectionRange(s + a.length, s + a.length + sel.length); }, 0); };
    const prefix = (p) => { const el = ref.current, s = el.selectionStart, e = el.selectionEnd; const ls = value.lastIndexOf('\n', s - 1) + 1; const block = value.slice(ls, e || s).split('\n').map((l, i) => (typeof p === 'function' ? p(i) : p) + l).join('\n'); onChange(value.slice(0, ls) + block + value.slice(e || s)); setTimeout(() => el.focus(), 0); };
    return (React.createElement("div", { className: "mdeditor" },
        React.createElement("div", { className: "md-tools" },
            React.createElement("button", { type: "button", onClick: () => wrap('**') },
                React.createElement("b", null, "B")),
            React.createElement("button", { type: "button", onClick: () => wrap('*') },
                React.createElement("i", null, "I")),
            React.createElement("button", { type: "button", onClick: () => prefix('## ') }, "H"),
            React.createElement("button", { type: "button", onClick: () => prefix('- ') }, "\u2022 List"),
            React.createElement("button", { type: "button", onClick: () => prefix((i) => `${i + 1}. `) }, "1. List"),
            React.createElement("button", { type: "button", onClick: () => { const u = prompt('Link address (https://…)'); if (u)
                    wrap('[', `](${u})`, 'link text'); } }, "\uD83D\uDD17 Link"),
            React.createElement("button", { type: "button", className: preview ? 'on' : '', onClick: () => setPreview(!preview) }, preview ? 'Edit' : 'Preview')),
        preview ? React.createElement("div", { className: "md-preview card" },
            React.createElement(Md, { text: value })) : React.createElement("textarea", { ref: ref, rows: rows, value: value, onChange: (e) => onChange(e.target.value) })));
}
/* ---------- auth / shell ---------- */
function Admin() {
    const [session, setSession] = useState(undefined);
    const [role, setRole] = useState(undefined);
    const [aal, setAal] = useState(undefined);
    useEffect(() => { sb.auth.getSession().then(({ data }) => setSession(data.session)); const { data } = sb.auth.onAuthStateChange((_e, s) => setSession(s)); return () => data.subscription.unsubscribe(); }, []);
    useEffect(() => { document.title = 'Admin — Appshub'; }, []);
    useEffect(() => {
        if (session === undefined)
            return;
        if (!session) {
            setRole(null);
            setAal(null);
            return;
        }
        setRole(undefined);
        setAal(undefined);
        sb.auth.mfa.getAuthenticatorAssuranceLevel().then(({ data }) => setAal(data));
        sb.rpc('ah_my_role').then(({ data }) => setRole(data || null));
    }, [session]);
    if (session === undefined || (session && (role === undefined || aal === undefined)))
        return React.createElement(Loader, null);
    if (session && aal && aal.nextLevel === 'aal2' && aal.currentLevel !== 'aal2')
        return React.createElement(MfaChallenge, { onDone: () => sb.auth.mfa.getAuthenticatorAssuranceLevel().then(({ data }) => setAal(data)) });
    return role ? React.createElement(AdminPanel, { role: role, session: session }) : React.createElement(AdminLogin, { denied: !!session });
}
function AdminLogin({ denied }) {
    const [u, setU] = useState('');
    const [p, setP] = useState('');
    const [err, setErr] = useState('');
    const [busy, setBusy] = useState(false);
    const submit = async (e) => {
        e.preventDefault();
        setBusy(true);
        setErr('');
        const { data: lock } = await sb.rpc('ah_login_precheck', { p_username: u.trim() });
        if (lock) {
            setBusy(false);
            return setErr(`Too many attempts. Try again after ${new Date(lock).toLocaleTimeString()}.`);
        }
        const { error } = await sb.auth.signInWithPassword({ email: u.trim().toLowerCase() + '@appshub.app', password: p });
        setBusy(false);
        if (error) {
            sb.rpc('ah_login_fail', { p_username: u.trim() }).then(() => { });
            setErr('Wrong username or password.');
        }
        else
            sb.rpc('ah_login_success', { p_username: u.trim() }).then(() => { });
    };
    return (React.createElement("div", { className: "wrap page" },
        React.createElement("div", { className: "card pad narrow" },
            React.createElement("h2", null, "Admin login"),
            denied && React.createElement("div", { className: "alert" },
                "This account is not an admin. ",
                React.createElement("button", { className: "link-btn", onClick: () => sb.auth.signOut() }, "Log out")),
            React.createElement("form", { className: "form", onSubmit: submit },
                React.createElement("label", null,
                    "Username",
                    React.createElement("input", { required: true, autoComplete: "username", value: u, onChange: (e) => setU(e.target.value) })),
                React.createElement("label", null,
                    "Password",
                    React.createElement("input", { required: true, type: "password", autoComplete: "current-password", value: p, onChange: (e) => setP(e.target.value) })),
                err && React.createElement("div", { className: "alert" }, err),
                React.createElement("button", { className: "btn", disabled: busy }, busy ? 'Signing in…' : 'Sign in')))));
}
function MfaChallenge({ onDone }) {
    const [code, setCode] = useState('');
    const [err, setErr] = useState('');
    const [busy, setBusy] = useState(false);
    const submit = async (e) => {
        var _a;
        e.preventDefault();
        setBusy(true);
        setErr('');
        const { data: factors } = await sb.auth.mfa.listFactors();
        const factor = (_a = factors === null || factors === void 0 ? void 0 : factors.totp) === null || _a === void 0 ? void 0 : _a[0];
        if (!factor) {
            setBusy(false);
            return setErr('No authenticator found.');
        }
        const { data: ch, error: e1 } = await sb.auth.mfa.challenge({ factorId: factor.id });
        if (e1) {
            setBusy(false);
            return setErr(e1.message);
        }
        const { error: e2 } = await sb.auth.mfa.verify({ factorId: factor.id, challengeId: ch.id, code: code.trim() });
        setBusy(false);
        if (e2)
            return setErr('Wrong code, try again.');
        onDone();
    };
    return (React.createElement("div", { className: "wrap page" },
        React.createElement("div", { className: "card pad narrow" },
            React.createElement("h2", null, "\uD83D\uDD10 Two-factor code"),
            React.createElement("p", { className: "muted" }, "Enter the 6-digit code from your authenticator app."),
            React.createElement("form", { className: "form", onSubmit: submit },
                React.createElement("input", { required: true, autoFocus: true, inputMode: "numeric", maxLength: 6, value: code, onChange: (e) => setCode(e.target.value) }),
                err && React.createElement("div", { className: "alert" }, err),
                React.createElement("button", { className: "btn", disabled: busy }, busy ? 'Checking…' : 'Verify'),
                React.createElement("button", { type: "button", className: "btn ghost", onClick: () => sb.auth.signOut() }, "Log out")))));
}
const ALL_TABS = [['dash', '📊 Dashboard', 0], ['apps', '📦 Apps', 0], ['collections', '🗂 Collections', 0], ['categories', '🏷 Categories', 0], ['reviews', '⭐ Reviews', 0], ['comments', '💬 Q&A', 0], ['requests', '📨 Requests', 0], ['banners', '📢 Ads & banners', 1], ['notify', '📣 Announce', 1], ['team', '👥 Team', 1], ['blocklist', '🚫 Blocklist', 1], ['activity', '📜 Activity log', 1], ['settings', '⚙️ Settings', 1], ['backup', '💾 Backup', 1], ['account', '🔑 My account', 0]];
function AdminPanel({ role, session }) {
    const [tab, setTab] = useState('dash');
    const owner = role === 'owner';
    const tabs = ALL_TABS.filter((t) => owner || !t[2]);
    return (React.createElement("div", { className: "wrap page" },
        React.createElement("div", { className: "row between" },
            React.createElement("h1", null,
                "Admin ",
                React.createElement("span", { className: "chip sm" }, role)),
            React.createElement("button", { className: "btn ghost", onClick: () => sb.auth.signOut() }, "Log out")),
        React.createElement("nav", { className: "tabs" }, tabs.map(([k, l]) => React.createElement("button", { key: k, className: 'tab' + (k === tab ? ' active' : ''), onClick: () => setTab(k) }, l))),
        tab === 'dash' && React.createElement(AdminDash, null),
        tab === 'apps' && React.createElement(AdminApps, { owner: owner }),
        tab === 'collections' && React.createElement(AdminCollections, null),
        tab === 'reviews' && React.createElement(AdminReviews, null),
        tab === 'comments' && React.createElement(AdminComments, null),
        tab === 'requests' && React.createElement(AdminRequests, null),
        tab === 'banners' && owner && React.createElement(AdminBanners, null),
        tab === 'notify' && owner && React.createElement(AdminNotify, null),
        tab === 'team' && owner && React.createElement(AdminTeam, { session: session }),
        tab === 'categories' && React.createElement(AdminCategories, null),
        tab === 'blocklist' && owner && React.createElement(AdminBlocklist, null),
        tab === 'activity' && owner && React.createElement(AdminActivity, null),
        tab === 'settings' && owner && React.createElement(AdminSettings, null),
        tab === 'backup' && owner && React.createElement(AdminBackup, null),
        tab === 'account' && React.createElement(AdminAccount, { session: session, role: role })));
}
/* ---------- dashboard ---------- */
function AdminDash() {
    const [d, setD] = useState(null);
    useEffect(() => {
        (async () => {
            const since = new Date(Date.now() - 29 * 864e5);
            since.setHours(0, 0, 0, 0);
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
            (dl.data || []).forEach((r) => { const x = days.find((d) => d.k === new Date(r.created_at).toDateString()); if (x)
                x.n++; const c = r.country || '??'; countries[c] = (countries[c] || 0) + 1; });
            setD({ apps: apps.data || [], reviews: rev.count || 0, newReq: req.count || 0, days, recent: recent.data || [], ads: ads.data || [], countries: Object.entries(countries).sort((a, b) => b[1] - a[1]).slice(0, 8), month: (dl.data || []).length, pending: (pend[0].count || 0) + (pend[1].count || 0) });
        })();
    }, []);
    if (!d)
        return React.createElement(Loader, null);
    const total = d.apps.reduce((a, b) => a + Number(b.downloads), 0);
    const views = d.apps.reduce((a, b) => a + Number(b.views), 0);
    const maxD = Math.max(1, ...d.days.map((x) => x.n));
    const maxA = Math.max(1, ...d.apps.map((a) => Number(a.downloads)));
    const maxC = Math.max(1, ...d.countries.map((c) => c[1]));
    const flagged = d.apps.filter((a) => a.broken_reports > 0);
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { className: "stats" }, [['Apps', d.apps.length], ['Total downloads', fmtNum(total)], ['Last 30 days', fmtNum(d.month)], ['App views', fmtNum(views)], ['Reviews', d.reviews], ['New requests', d.newReq], ['Awaiting approval', d.pending]].map(([k, v]) => React.createElement("div", { key: k, className: "card pad stat" },
            React.createElement("b", null, v),
            React.createElement("span", { className: "muted" }, k)))),
        flagged.length > 0 && React.createElement("div", { className: "alert warn" },
            React.createElement("b", null, "\u26A0 Broken link reports:"),
            " ",
            flagged.map((a) => `${a.name} (${a.broken_reports})`).join(', '),
            " \u2014 fix the link in Apps, then press \u201CClear reports\u201D."),
        React.createElement("div", { className: "cols" },
            React.createElement("div", { className: "card pad" },
                React.createElement("h3", null, "\uD83D\uDD25 Most downloaded apps"),
                d.apps.length ? d.apps.slice(0, 10).map((a, i) => React.createElement("div", { key: a.id, className: "bar-row wide" },
                    React.createElement("span", null,
                        i + 1,
                        ". ",
                        React.createElement(Link, { to: `/${a.slug}` }, a.name)),
                    React.createElement("div", { className: "bar" },
                        React.createElement("i", { style: { width: (Number(a.downloads) / maxA) * 100 + '%' } })),
                    React.createElement("b", null, fmtNum(a.downloads)))) : React.createElement(Empty, null, "No apps yet."),
                React.createElement("h3", { style: { marginTop: 18 } }, "\uD83C\uDF0D Top countries (30 days)"),
                d.countries.length ? d.countries.map(([c, n]) => React.createElement("div", { key: c, className: "bar-row wide" },
                    React.createElement("span", null, c === '??' ? 'Unknown' : countryName(c)),
                    React.createElement("div", { className: "bar" },
                        React.createElement("i", { style: { width: (n / maxC) * 100 + '%' } })),
                    React.createElement("b", null, n))) : React.createElement("p", { className: "muted small" }, "No data yet. (Country detection works on Vercel.)")),
            React.createElement("div", { className: "card pad" },
                React.createElement("h3", null, "Downloads \u2014 last 14 days"),
                React.createElement("div", { className: "chart" }, d.days.map((x) => React.createElement("div", { key: x.k, className: "col", title: `${x.n} downloads` },
                    React.createElement("i", { style: { height: (x.n / maxD) * 100 + '%' } }),
                    React.createElement("small", null, x.label)))),
                React.createElement("h3", null, "\uD83D\uDCE2 Ad performance"),
                d.ads.length ? React.createElement("div", { className: "table-wrap" },
                    React.createElement("table", { className: "table" },
                        React.createElement("thead", null,
                            React.createElement("tr", null,
                                React.createElement("th", null, "Ad"),
                                React.createElement("th", null, "Views"),
                                React.createElement("th", null, "Clicks"),
                                React.createElement("th", null, "CTR"))),
                        React.createElement("tbody", null, d.ads.map((b) => React.createElement("tr", { key: b.id },
                            React.createElement("td", null, b.title),
                            React.createElement("td", null, fmtNum(b.impressions)),
                            React.createElement("td", null, fmtNum(b.clicks)),
                            React.createElement("td", null, b.impressions ? ((b.clicks / b.impressions) * 100).toFixed(1) + '%' : '–')))))) : React.createElement("p", { className: "muted small" }, "No ads yet."),
                React.createElement("h3", { style: { marginTop: 18 } }, "Latest reviews"),
                d.recent.length ? d.recent.map((r) => { var _a; return React.createElement("div", { key: r.id, className: "review" },
                    React.createElement("b", null, r.name),
                    " on ", (_a = r.ah_apps) === null || _a === void 0 ? void 0 :
                    _a.name,
                    " ",
                    React.createElement(Stars, { value: r.rating, size: 12 }),
                    React.createElement("p", { className: "pre small" }, r.comment)); }) : React.createElement("p", { className: "muted" }, "None yet.")))));
}
/* ---------- apps ---------- */
const blankApp = { name: '', slug: '', icon_url: '', short_desc: '', about: '', features: '', category: 'General', developer: '', version: '1.0', size: '', platform: 'Android', content_rating: 'Everyone', download_url: '', sha256: '', extra_links: '', whats_new: '', seo_keywords: '', seo_description: '', is_featured: false, is_published: true, is_verified: false, publish_at: '' };
function AdminApps({ owner }) {
    const toast = useToast();
    const [apps, setApps] = useState(null);
    const [edit, setEdit] = useState(null);
    const [q, setQ] = useState('');
    const [sel, setSel] = useState([]);
    const load = () => sb.from('ah_apps').select('*').order('created_at', { ascending: false }).then(({ data }) => setApps(data || []));
    useEffect(() => { load(); }, []);
    const del = async (ids) => { if (!confirm(`Delete ${ids.length} app(s)? Reviews and screenshots go too.`))
        return; const { error } = await sb.from('ah_apps').delete().in('id', ids); if (error)
        toast(error.message);
    else {
        sb.rpc('ah_log', { p_action: 'delete_app', p_detail: ids.length + ' app(s)' }).then(() => { });
        toast('Deleted');
        setSel([]);
        load();
    } };
    const bulk = async (patch) => { const { error } = await sb.from('ah_apps').update(patch).in('id', sel); if (error)
        toast(error.message);
    else {
        toast('Updated ' + sel.length + ' app(s)');
        setSel([]);
        load();
    } };
    if (edit)
        return React.createElement(AppForm, { app: edit === 'new' ? null : edit.dup ? edit.app : edit, dup: edit.dup, onClose: () => { setEdit(null); load(); } });
    if (!apps)
        return React.createElement(Loader, null);
    const list = apps.filter((a) => a.name.toLowerCase().includes(q.toLowerCase()));
    const allOn = list.length > 0 && list.every((a) => sel.includes(a.id));
    return (React.createElement("div", { className: "card pad" },
        React.createElement("div", { className: "row between" },
            React.createElement("h2", null,
                "Apps (",
                apps.length,
                ")"),
            React.createElement("div", { className: "row" },
                React.createElement("input", { placeholder: "Filter\u2026", value: q, onChange: (e) => setQ(e.target.value) }),
                React.createElement("button", { className: "btn", onClick: () => setEdit('new') }, "+ Add app"))),
        sel.length > 0 && React.createElement("div", { className: "bulk row" },
            React.createElement("b", null,
                sel.length,
                " selected"),
            React.createElement("button", { className: "btn sm", onClick: () => bulk({ is_published: true }) }, "Publish"),
            React.createElement("button", { className: "btn sm ghost", onClick: () => bulk({ is_published: false }) }, "Hide"),
            React.createElement("button", { className: "btn sm ghost", onClick: () => bulk({ is_featured: true }) }, "Feature"),
            React.createElement("button", { className: "btn sm ghost", onClick: () => bulk({ is_verified: true }) }, "Verify"),
            owner && React.createElement("button", { className: "btn sm danger", onClick: () => del(sel) }, "Delete")),
        !apps.length && !q && React.createElement("div", { className: "wizard card pad" },
            React.createElement("h3", null, "\uD83D\uDC4B Welcome to Appshub"),
            React.createElement("p", { className: "muted" }, "You have no apps yet. Add your first one to get your store started \u2014 you can add screenshots, set the download link, and publish it whenever you\u2019re ready."),
            React.createElement("button", { className: "btn big", onClick: () => setEdit('new') }, "+ Add your first app")),
        list.length ? React.createElement("div", { className: "table-wrap" },
            React.createElement("table", { className: "table" },
                React.createElement("thead", null,
                    React.createElement("tr", null,
                        React.createElement("th", null,
                            React.createElement("input", { type: "checkbox", checked: allOn, onChange: () => setSel(allOn ? [] : list.map((a) => a.id)) })),
                        React.createElement("th", null, "App"),
                        React.createElement("th", null, "Ver."),
                        React.createElement("th", null, "Downloads"),
                        React.createElement("th", null, "Views"),
                        React.createElement("th", null, "Status"),
                        React.createElement("th", null))),
                React.createElement("tbody", null, list.map((a) => React.createElement("tr", { key: a.id },
                    React.createElement("td", null,
                        React.createElement("input", { type: "checkbox", checked: sel.includes(a.id), onChange: () => setSel(sel.includes(a.id) ? sel.filter((x) => x !== a.id) : [...sel, a.id]) })),
                    React.createElement("td", null,
                        React.createElement("div", { className: "row" },
                            React.createElement(Icon, { app: a, size: 36 }),
                            React.createElement("div", null,
                                React.createElement("b", null, a.name),
                                " ",
                                a.is_verified && React.createElement(Verified, null),
                                React.createElement("div", { className: "muted small" },
                                    "/",
                                    a.slug)))),
                    React.createElement("td", null, a.version),
                    React.createElement("td", null, fmtNum(a.downloads)),
                    React.createElement("td", null, fmtNum(a.views)),
                    React.createElement("td", null,
                        a.is_published ? 'Live' : 'Hidden',
                        a.is_featured && ' ⭐',
                        a.broken_reports > 0 && React.createElement("span", { className: "chip sm warnchip" },
                            "\u26A0 ",
                            a.broken_reports)),
                    React.createElement("td", { className: "actions" },
                        a.broken_reports > 0 && React.createElement("button", { className: "btn sm ghost", onClick: async () => { await sb.from('ah_apps').update({ broken_reports: 0 }).eq('id', a.id); load(); } }, "Clear reports"),
                        React.createElement("button", { className: "btn sm ghost", onClick: () => { navigator.clipboard.writeText(appUrl(a.slug)); toast('Share link copied'); } }, "Copy link"),
                        React.createElement("button", { className: "btn sm ghost", onClick: () => setEdit({ dup: true, app: a }) }, "Duplicate"),
                        React.createElement("button", { className: "btn sm", onClick: () => setEdit(a) }, "Edit"),
                        owner && React.createElement("button", { className: "btn sm danger", onClick: () => del([a.id]) }, "Delete"))))))) : React.createElement(Empty, null, "No apps yet. Click \u201CAdd app\u201D to publish your first one.")));
}
function AppForm({ app, dup, onClose }) {
    const toast = useToast();
    const [saved, setSaved] = useState(dup ? null : app);
    const [f, setF] = useState(() => { if (!app)
        return blankApp; const base = { ...blankApp, ...app, features: (app.features || []).join('\n'), extra_links: (app.extra_links || []).map((l) => `${l.label} | ${l.url}`).join('\n'), publish_at: app.publish_at ? new Date(new Date(app.publish_at).getTime() - new Date(app.publish_at).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '' }; return dup ? { ...base, name: app.name + ' (copy)', slug: app.slug + '-copy', is_published: false, is_featured: false, is_verified: false, publish_at: '' } : base; });
    const [shots, setShots] = useState([]);
    const [versions, setVersions] = useState([]);
    const [busy, setBusy] = useState('');
    const [slugTouched, setSlugTouched] = useState(!!app);
    const [nv, setNv] = useState({ version: '', size: '', download_url: '', sha256: '', notes: '' });
    const dragI = useRef(null);
    const [dupeWarn, setDupeWarn] = useState('');
    useEffect(() => {
        const nm = f.name.trim();
        if (nm.length < 2)
            return setDupeWarn('');
        const t = setTimeout(() => { sb.from('ah_apps').select('id,name,slug').ilike('name', nm).limit(3).then(({ data }) => { const other = (data || []).filter((a) => a.id !== (saved === null || saved === void 0 ? void 0 : saved.id)); if (other.length)
            setDupeWarn(`An app named “${other[0].name}” already exists (/${other[0].slug}).`);
        else
            setDupeWarn(''); }); }, 400);
        return () => clearTimeout(t);
    }, [f.name, saved === null || saved === void 0 ? void 0 : saved.id]);
    const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
    const loadShots = (id) => sb.from('ah_screenshots').select('*').eq('app_id', id).order('sort').then(({ data }) => setShots(data || []));
    const loadVers = (id) => sb.from('ah_versions').select('*').eq('app_id', id).order('created_at', { ascending: false }).then(({ data }) => setVersions(data || []));
    useEffect(() => { if (saved) {
        loadShots(saved.id);
        loadVers(saved.id);
    } }, [saved === null || saved === void 0 ? void 0 : saved.id]);
    const onName = (e) => { const name = e.target.value; setF({ ...f, name, slug: slugTouched ? f.slug : slugify(name) }); };
    const up = async (file, apply, folder, hashTo) => { if (!file)
        return; setBusy('Uploading ' + file.name + '…'); try {
        apply(await uploadFile(file, folder));
        if (hashTo) {
            setBusy('Calculating checksum…');
            hashTo(await sha256File(file));
        }
        toast('Uploaded');
    }
    catch (e) {
        toast('Upload failed: ' + e.message);
    } setBusy(''); };
    const hashOnly = async (file, apply) => { if (!file)
        return; setBusy('Calculating checksum…'); try {
        apply(await sha256File(file));
        toast('Checksum filled in');
    }
    catch (e) {
        toast(e.message);
    } setBusy(''); };
    const save = async (e) => {
        e.preventDefault();
        const slug = slugify(f.slug || f.name);
        if (!slug || RESERVED.includes(slug))
            return toast('That link name is reserved or empty — pick another.');
        const extra = lines(f.extra_links).map((l) => { const [label, ...u] = l.split('|'); return { label: (label || '').trim() || 'Mirror', url: u.join('|').trim() }; }).filter((l) => safeUrl(l.url));
        const row = { name: f.name.trim(), slug, icon_url: f.icon_url || null, short_desc: f.short_desc, about: f.about, features: lines(f.features), category: f.category.trim() || 'General', developer: f.developer, version: f.version, size: f.size, platform: f.platform, content_rating: f.content_rating, download_url: f.download_url.trim(), sha256: (f.sha256 || '').trim().toLowerCase(), extra_links: extra, whats_new: f.whats_new, seo_keywords: f.seo_keywords || '', seo_description: f.seo_description || '', is_featured: f.is_featured, is_published: f.is_published, is_verified: f.is_verified, publish_at: f.publish_at ? new Date(f.publish_at).toISOString() : null };
        setBusy('Saving…');
        const { data, error } = await (saved ? sb.from('ah_apps').update(row).eq('id', saved.id).select().single() : sb.from('ah_apps').insert(row).select().single());
        setBusy('');
        if (error)
            return toast(error.code === '23505' ? 'That link name is already used by another app.' : error.message);
        sb.rpc('ah_log', { p_action: saved ? 'edit_app' : 'create_app', p_detail: data.name }).then(() => { });
        setSaved(data);
        setF((x) => ({ ...x, slug }));
        toast(saved ? 'Changes saved' : 'App created — now add screenshots and versions below');
    };
    const addShots = async (files) => { let sort = shots.length ? Math.max(...shots.map((s) => s.sort)) + 1 : 0; for (const file of files) {
        setBusy('Uploading ' + file.name + '…');
        try {
            const url = await uploadFile(file, 'screenshots');
            await sb.from('ah_screenshots').insert({ app_id: saved.id, url, sort: sort++ });
        }
        catch (e) {
            toast('Failed: ' + e.message);
        }
    } setBusy(''); loadShots(saved.id); };
    const reorder = async (from, to) => { if (to < 0 || to >= shots.length || from === to)
        return; const arr = [...shots]; const [m] = arr.splice(from, 1); arr.splice(to, 0, m); setShots(arr); await Promise.all(arr.map((s, i) => sb.from('ah_screenshots').update({ sort: i }).eq('id', s.id))); };
    const delShot = async (s) => { await sb.from('ah_screenshots').delete().eq('id', s.id); loadShots(saved.id); };
    const releaseNew = async () => {
        if (!nv.version.trim())
            return toast('Enter the new version number');
        await sb.from('ah_versions').insert({ app_id: saved.id, version: saved.version, size: saved.size, download_url: saved.download_url, sha256: saved.sha256 || '', notes: saved.whats_new });
        const patch = { version: nv.version.trim(), size: nv.size || saved.size, download_url: nv.download_url || saved.download_url, sha256: nv.download_url ? nv.sha256 : saved.sha256, whats_new: nv.notes };
        const { data, error } = await sb.from('ah_apps').update(patch).eq('id', saved.id).select().single();
        if (error)
            return toast(error.message);
        setSaved(data);
        setF((x) => ({ ...x, ...patch }));
        setNv({ version: '', size: '', download_url: '', sha256: '', notes: '' });
        loadVers(saved.id);
        toast('New version released — old one moved to history. Use “Announce” to notify subscribers.');
    };
    const addOld = async () => { if (!nv.version.trim() || !nv.download_url.trim())
        return toast('Older version needs a version number and download link'); await sb.from('ah_versions').insert({ app_id: saved.id, ...nv }); setNv({ version: '', size: '', download_url: '', sha256: '', notes: '' }); loadVers(saved.id); toast('Added to version history'); };
    return (React.createElement("div", { className: "card pad" },
        React.createElement("div", { className: "row between" },
            React.createElement("h2", null, saved ? `Edit ${saved.name}` : dup ? 'Duplicate app' : 'Add app'),
            React.createElement("button", { className: "btn ghost", onClick: onClose }, "\u2190 Back to apps")),
        saved && React.createElement("p", { className: "muted small" },
            "Share link: ",
            React.createElement("a", { href: appUrl(saved.slug), target: "_blank", rel: "noreferrer" }, appUrl(saved.slug))),
        dup && !saved && React.createElement("p", { className: "muted small" },
            "Copy of \u201C",
            app.name,
            "\u201D. Change the name, then Create. (Screenshots and versions are not copied.)"),
        React.createElement("form", { className: "form two", onSubmit: save },
            React.createElement("div", { className: "full" }, dupeWarn && React.createElement("div", { className: "alert warn" },
                React.createElement(Ico, { n: "warn", s: 16 }),
                " ",
                dupeWarn)),
            React.createElement("label", null,
                "App name",
                React.createElement("input", { required: true, value: f.name, onChange: onName })),
            React.createElement("label", null,
                "Link name (URL)",
                React.createElement("input", { required: true, value: f.slug, onChange: (e) => { setSlugTouched(true); setF({ ...f, slug: slugify(e.target.value) }); } }),
                React.createElement("small", { className: "muted" },
                    location.origin,
                    "/",
                    f.slug || 'appname',
                    "/reviews \u2026")),
            React.createElement("label", null,
                "Category",
                React.createElement(CategoryPicker, { value: f.category, onChange: (v) => setF({ ...f, category: v }) })),
            React.createElement("label", null,
                "Developer",
                React.createElement("input", { value: f.developer, onChange: set('developer') })),
            React.createElement("label", null,
                "Version",
                React.createElement("input", { value: f.version, onChange: set('version') })),
            React.createElement("label", null,
                "Size",
                React.createElement("input", { value: f.size, onChange: set('size'), placeholder: "e.g. 48 MB" })),
            React.createElement("label", null,
                "Platform",
                React.createElement("input", { value: f.platform, onChange: set('platform') })),
            React.createElement("label", null,
                "Content rating",
                React.createElement("input", { value: f.content_rating, onChange: set('content_rating'), placeholder: "Everyone, 12+, 18+" })),
            React.createElement("label", { className: "full" },
                "Icon",
                React.createElement("input", { value: f.icon_url || '', onChange: set('icon_url'), placeholder: "URL or upload \u2193" }),
                React.createElement("input", { type: "file", accept: "image/*", onChange: (e) => up(e.target.files[0], (u) => setF((x) => ({ ...x, icon_url: u })), 'icons') })),
            React.createElement("label", { className: "full" },
                "Short description",
                React.createElement("input", { value: f.short_desc, onChange: set('short_desc'), maxLength: 200 })),
            React.createElement("div", { className: "full" },
                React.createElement("label", null,
                    "About this app ",
                    React.createElement("small", { className: "muted" }, "(supports bold, lists, links \u2014 use the toolbar)")),
                React.createElement(MdEditor, { rows: 8, value: f.about, onChange: (v) => setF((x) => ({ ...x, about: v })) })),
            React.createElement("label", { className: "full" },
                "Features (one per line)",
                React.createElement("textarea", { rows: 5, value: f.features, onChange: set('features') })),
            React.createElement("div", { className: "full" },
                React.createElement("label", null, "What\u2019s new (update notes)"),
                React.createElement(MdEditor, { rows: 4, value: f.whats_new, onChange: (v) => setF((x) => ({ ...x, whats_new: v })) })),
            React.createElement("label", { className: "full" },
                "Download link",
                React.createElement("input", { value: f.download_url, onChange: set('download_url'), placeholder: "https://\u2026 or upload a file \u2193" }),
                React.createElement("input", { type: "file", onChange: (e) => up(e.target.files[0], (u) => setF((x) => ({ ...x, download_url: u })), 'files', (h) => setF((x) => ({ ...x, sha256: h }))) }),
                React.createElement("small", { className: "muted" }, "Uploads up to 100 MB (checksum is calculated automatically). For bigger files paste an external link.")),
            React.createElement("label", { className: "full" },
                "SHA-256 checksum ",
                React.createElement("small", { className: "muted" }, "(shown to visitors + used for the VirusTotal button)"),
                React.createElement("input", { value: f.sha256 || '', onChange: set('sha256'), placeholder: "auto-filled on upload, or pick your file \u2193 to calculate" }),
                React.createElement("input", { type: "file", onChange: (e) => hashOnly(e.target.files[0], (h) => setF((x) => ({ ...x, sha256: h }))) })),
            React.createElement("label", { className: "full" },
                "Extra download links / mirrors (Label | URL, one per line)",
                React.createElement("textarea", { rows: 3, value: f.extra_links, onChange: set('extra_links') })),
            React.createElement("label", { className: "full" },
                "SEO keywords (comma separated)",
                React.createElement("input", { value: f.seo_keywords || '', onChange: set('seo_keywords'), placeholder: "free vpn, secure browser, \u2026" })),
            React.createElement("label", { className: "full" },
                "SEO description (shown on Google & link previews; falls back to the short description)",
                React.createElement("input", { value: f.seo_description || '', onChange: set('seo_description'), maxLength: 200 })),
            React.createElement("label", null,
                "Publish at (optional \u2014 leave empty to publish immediately once \u201CPublished\u201D is on)",
                React.createElement("input", { type: "datetime-local", value: f.publish_at, onChange: set('publish_at') })),
            React.createElement("label", { className: "check" },
                React.createElement("input", { type: "checkbox", checked: f.is_featured, onChange: set('is_featured') }),
                " Featured on home"),
            React.createElement("label", { className: "check" },
                React.createElement("input", { type: "checkbox", checked: f.is_published, onChange: set('is_published') }),
                " Published"),
            React.createElement("label", { className: "check" },
                React.createElement("input", { type: "checkbox", checked: f.is_verified, onChange: set('is_verified') }),
                " Verified by Appshub badge"),
            React.createElement("div", { className: "full row" },
                React.createElement("button", { className: "btn", disabled: !!busy }, saved ? 'Save changes' : 'Create app'),
                busy && React.createElement("span", { className: "muted" }, busy))),
        saved && React.createElement(React.Fragment, null,
            React.createElement("hr", null),
            React.createElement("h3", null,
                "Screenshots ",
                React.createElement("span", { className: "muted small" }, "(drag or use \u25C0 \u25B6 to reorder)")),
            React.createElement("input", { type: "file", accept: "image/*", multiple: true, onChange: (e) => { addShots([...e.target.files]); e.target.value = ''; } }),
            React.createElement("div", { className: "shots-admin" }, shots.map((s, i) => React.createElement("div", { key: s.id, draggable: true, onDragStart: () => (dragI.current = i), onDragOver: (e) => e.preventDefault(), onDrop: () => { reorder(dragI.current, i); dragI.current = null; } },
                React.createElement("img", { src: s.url, alt: "" }),
                React.createElement("div", { className: "row" },
                    React.createElement("button", { className: "btn sm ghost", onClick: () => reorder(i, i - 1) }, "\u25C0"),
                    React.createElement("button", { className: "btn sm ghost", onClick: () => reorder(i, i + 1) }, "\u25B6"),
                    React.createElement("button", { className: "btn sm danger", onClick: () => delShot(s) }, "\u2715"))))),
            React.createElement("hr", null),
            React.createElement("h3", null, "Version history"),
            React.createElement("p", { className: "muted small" },
                "Current version: ",
                React.createElement("b", null, saved.version),
                ". \u201CRelease new version\u201D moves the current one into history and updates the app."),
            React.createElement("div", { className: "form two" },
                React.createElement("label", null,
                    "Version",
                    React.createElement("input", { value: nv.version, onChange: (e) => setNv({ ...nv, version: e.target.value }), placeholder: "e.g. 2.1" })),
                React.createElement("label", null,
                    "Size",
                    React.createElement("input", { value: nv.size, onChange: (e) => setNv({ ...nv, size: e.target.value }) })),
                React.createElement("label", { className: "full" },
                    "Download link",
                    React.createElement("input", { value: nv.download_url, onChange: (e) => setNv({ ...nv, download_url: e.target.value }) }),
                    React.createElement("input", { type: "file", onChange: (e) => up(e.target.files[0], (u) => setNv((x) => ({ ...x, download_url: u })), 'files', (h) => setNv((x) => ({ ...x, sha256: h }))) })),
                React.createElement("div", { className: "full" },
                    React.createElement("label", null, "Notes"),
                    React.createElement(MdEditor, { rows: 3, value: nv.notes, onChange: (v) => setNv((x) => ({ ...x, notes: v })) })),
                React.createElement("div", { className: "full row" },
                    React.createElement("button", { className: "btn", type: "button", onClick: releaseNew }, "Release new version"),
                    React.createElement("button", { className: "btn ghost", type: "button", onClick: addOld }, "Add as older version"))),
            versions.map((v) => React.createElement("div", { key: v.id, className: "review row between" },
                React.createElement("div", null,
                    React.createElement("b", null,
                        "v",
                        v.version),
                    " ",
                    React.createElement("span", { className: "muted small" },
                        new Date(v.created_at).toLocaleDateString(),
                        " ",
                        v.size),
                    React.createElement("div", { className: "muted small" }, v.download_url)),
                React.createElement("button", { className: "btn sm danger", onClick: async () => { await sb.from('ah_versions').delete().eq('id', v.id); loadVers(saved.id); } }, "Delete"))))));
}
/* ---------- managed categories ---------- */
function CategoryPicker({ value, onChange }) {
    const [cats, setCats] = useState([]);
    const [adding, setAdding] = useState(false);
    const [nv, setNv] = useState('');
    useEffect(() => { sb.from('ah_categories').select('name').order('sort').then(({ data }) => setCats((data || []).map((c) => c.name))); }, []);
    if (adding)
        return React.createElement("div", { className: "row" },
            React.createElement("input", { autoFocus: true, value: nv, onChange: (e) => setNv(e.target.value), placeholder: "New category name" }),
            React.createElement("button", { type: "button", className: "btn sm", onClick: async () => { const name = nv.trim(); if (!name)
                    return; await sb.from('ah_categories').insert({ name, sort: cats.length }).select().then(() => { }); setCats([...cats, name]); onChange(name); setAdding(false); setNv(''); } }, "Add"),
            React.createElement("button", { type: "button", className: "btn sm ghost", onClick: () => setAdding(false) }, "Cancel"));
    return React.createElement("select", { value: value, onChange: (e) => { if (e.target.value === '__new')
            return setAdding(true); onChange(e.target.value); } },
        !cats.includes(value) && value && React.createElement("option", { value: value }, value),
        cats.map((c) => React.createElement("option", { key: c, value: c }, c)),
        React.createElement("option", { value: "__new" }, "+ Add new category\u2026"));
}
function AdminCategories() {
    const toast = useToast();
    const [rows, setRows] = useState(null);
    const [nv, setNv] = useState('');
    const [ren, setRen] = useState({});
    const load = () => sb.from('ah_categories').select('*').order('sort').then(({ data }) => setRows(data || []));
    useEffect(() => { load(); }, []);
    if (!rows)
        return React.createElement(Loader, null);
    const add = async () => { const name = nv.trim(); if (!name)
        return; const { error } = await sb.from('ah_categories').insert({ name, sort: rows.length }); if (error)
        return toast(error.code === '23505' ? 'Already exists' : error.message); setNv(''); load(); };
    const rename = async (old) => { const name = (ren[old] || '').trim(); if (!name || name === old)
        return setRen({ ...ren, [old]: undefined }); const { error } = await sb.rpc('ah_rename_category', { p_old: old, p_new: name }); if (error)
        return toast(error.message); toast('Renamed everywhere'); setRen({ ...ren, [old]: undefined }); load(); };
    const move = async (i, d) => { const j = i + d; if (j < 0 || j >= rows.length)
        return; const a = [...rows]; [a[i], a[j]] = [a[j], a[i]]; setRows(a); await Promise.all(a.map((c, k) => sb.from('ah_categories').update({ sort: k }).eq('id', c.id))); };
    const del = async (c) => { if (!confirm(`Delete “${c.name}”? Apps keep this category text, but it won’t appear as a filter chip until re-created.`))
        return; await sb.from('ah_categories').delete().eq('id', c.id); load(); };
    return (React.createElement("div", { className: "card pad narrow" },
        React.createElement("h2", null, "\uD83C\uDFF7 Categories"),
        React.createElement("p", { className: "muted small" }, "Rename merges every app using the old name; order controls the home page chip order."),
        React.createElement("div", { className: "row" },
            React.createElement("input", { value: nv, onChange: (e) => setNv(e.target.value), placeholder: "New category" }),
            React.createElement("button", { className: "btn sm", onClick: add }, "Add")),
        React.createElement("hr", null),
        rows.map((c, i) => React.createElement("div", { key: c.id, className: "review row between" },
            React.createElement("div", { className: "row" }, ren[c.name] !== undefined ? React.createElement(React.Fragment, null,
                React.createElement("input", { value: ren[c.name], onChange: (e) => setRen({ ...ren, [c.name]: e.target.value }) }),
                React.createElement("button", { className: "btn sm", onClick: () => rename(c.name) }, "Save")) : React.createElement("b", null, c.name)),
            React.createElement("div", { className: "actions" },
                React.createElement("button", { className: "btn sm ghost", onClick: () => move(i, -1) }, "\u25B2"),
                React.createElement("button", { className: "btn sm ghost", onClick: () => move(i, 1) }, "\u25BC"),
                ren[c.name] === undefined && React.createElement("button", { className: "btn sm ghost", onClick: () => setRen({ ...ren, [c.name]: c.name }) }, "Rename"),
                React.createElement("button", { className: "btn sm danger", onClick: () => del(c) }, "Delete"))))));
}
/* ---------- collections ---------- */
function AdminCollections() {
    const toast = useToast();
    const [rows, setRows] = useState(null);
    const [apps, setApps] = useState([]);
    const [f, setF] = useState(null);
    const load = () => sb.from('ah_collections').select('*').order('sort').then(({ data }) => setRows(data || []));
    useEffect(() => { load(); sb.from('ah_apps').select('id,name,slug,icon_url').order('name').then(({ data }) => setApps(data || [])); }, []);
    const save = async (e) => { e.preventDefault(); const { id, created_at, ...row } = f; row.sort = Number(row.sort) || 0; const { error } = id ? await sb.from('ah_collections').update(row).eq('id', id) : await sb.from('ah_collections').insert(row); if (error)
        return toast(error.message); toast('Saved'); setF(null); load(); };
    if (!rows)
        return React.createElement(Loader, null);
    if (f) {
        const move = (i, d) => { const a = [...f.app_ids]; const j = i + d; if (j < 0 || j >= a.length)
            return; [a[i], a[j]] = [a[j], a[i]]; setF({ ...f, app_ids: a }); };
        const byId = Object.fromEntries(apps.map((a) => [a.id, a]));
        return (React.createElement("div", { className: "card pad" },
            React.createElement("h2", null,
                f.id ? 'Edit' : 'New',
                " collection"),
            React.createElement("form", { className: "form", onSubmit: save },
                React.createElement("label", null,
                    "Title (e.g. \u201CEditor\u2019s choice\u201D, \u201CBest tools\u201D)",
                    React.createElement("input", { required: true, value: f.title, onChange: (e) => setF({ ...f, title: e.target.value }) })),
                React.createElement("div", { className: "form two" },
                    React.createElement("label", null,
                        "Order (lower shows first)",
                        React.createElement("input", { type: "number", value: f.sort, onChange: (e) => setF({ ...f, sort: e.target.value }) })),
                    React.createElement("label", { className: "check" },
                        React.createElement("input", { type: "checkbox", checked: f.active, onChange: (e) => setF({ ...f, active: e.target.checked }) }),
                        " Show on home page")),
                React.createElement("h3", null, "Apps in this collection"),
                f.app_ids.length ? f.app_ids.map((id, i) => { var _a; return React.createElement("div", { key: id, className: "row" },
                    React.createElement("span", { className: "grow" },
                        i + 1,
                        ". ",
                        ((_a = byId[id]) === null || _a === void 0 ? void 0 : _a.name) || '(deleted)'),
                    React.createElement("button", { type: "button", className: "btn sm ghost", onClick: () => move(i, -1) }, "\u25B2"),
                    React.createElement("button", { type: "button", className: "btn sm ghost", onClick: () => move(i, 1) }, "\u25BC"),
                    React.createElement("button", { type: "button", className: "btn sm danger", onClick: () => setF({ ...f, app_ids: f.app_ids.filter((x) => x !== id) }) }, "\u2715")); }) : React.createElement("p", { className: "muted small" }, "Nothing yet \u2014 add apps below."),
                React.createElement("h3", null, "Add apps"),
                React.createElement("div", { className: "chips inline" }, apps.filter((a) => !f.app_ids.includes(a.id)).map((a) => React.createElement("button", { type: "button", key: a.id, className: "chip", onClick: () => setF({ ...f, app_ids: [...f.app_ids, a.id] }) },
                    "+ ",
                    a.name))),
                React.createElement("div", { className: "row" },
                    React.createElement("button", { className: "btn" }, "Save"),
                    React.createElement("button", { type: "button", className: "btn ghost", onClick: () => setF(null) }, "Cancel")))));
    }
    return (React.createElement("div", { className: "card pad" },
        React.createElement("div", { className: "row between" },
            React.createElement("h2", null, "Collections"),
            React.createElement("button", { className: "btn", onClick: () => setF({ title: '', app_ids: [], sort: rows.length, active: true }) }, "+ New collection")),
        React.createElement("p", { className: "muted small" }, "Hand-picked shelves shown on the home page, like \u201CEditor\u2019s choice\u201D or \u201CBest tools\u201D."),
        rows.length ? rows.map((c) => React.createElement("div", { key: c.id, className: "review row between" },
            React.createElement("div", null,
                React.createElement("b", null, c.title),
                " ",
                !c.active && React.createElement("span", { className: "chip sm" }, "hidden"),
                React.createElement("div", { className: "muted small" },
                    c.app_ids.length,
                    " apps \u00B7 order ",
                    c.sort)),
            React.createElement("div", { className: "actions" },
                React.createElement("button", { className: "btn sm", onClick: () => setF(c) }, "Edit"),
                React.createElement("button", { className: "btn sm danger", onClick: async () => { if (confirm('Delete collection?')) {
                        await sb.from('ah_collections').delete().eq('id', c.id);
                        load();
                    } } }, "Delete")))) : React.createElement(Empty, null, "No collections yet.")));
}
/* ---------- reviews & Q&A moderation ---------- */
function AdminReviews() {
    const toast = useToast();
    const [rows, setRows] = useState(null);
    const [draft, setDraft] = useState({});
    const [flt, setFlt] = useState('all');
    const load = () => sb.from('ah_reviews').select('*, ah_apps(name,slug)').order('created_at', { ascending: false }).limit(300).then(({ data }) => setRows(data || []));
    useEffect(() => { load(); }, []);
    if (!rows)
        return React.createElement(Loader, null);
    const list = rows.filter((r) => flt === 'all' || (flt === 'pending' && !r.approved) || (flt === 'reported' && r.reports > 0));
    const reply = async (r, text) => { const { error } = await sb.from('ah_reviews').update({ admin_reply: text || null, replied_at: text ? new Date().toISOString() : null }).eq('id', r.id); if (error)
        return toast(error.message); toast(text ? 'Reply posted' : 'Reply removed'); setDraft({ ...draft, [r.id]: undefined }); load(); };
    return (React.createElement("div", { className: "card pad" },
        React.createElement("div", { className: "row between" },
            React.createElement("h2", null,
                "Reviews (",
                rows.length,
                ")"),
            React.createElement("div", { className: "chips" }, [['all', 'All'], ['pending', 'Awaiting approval'], ['reported', 'Reported']].map(([k, l]) => React.createElement("button", { key: k, className: 'chip' + (k === flt ? ' active' : ''), onClick: () => setFlt(k) }, l)))),
        list.length ? list.map((r) => {
            var _a, _b;
            return React.createElement("div", { key: r.id, className: "review" },
                React.createElement("div", { className: "row between" },
                    React.createElement("div", null,
                        React.createElement("b", null, r.name),
                        " on ",
                        React.createElement(Link, { to: `/${(_a = r.ah_apps) === null || _a === void 0 ? void 0 : _a.slug}/reviews` }, (_b = r.ah_apps) === null || _b === void 0 ? void 0 : _b.name),
                        " ",
                        React.createElement(Stars, { value: r.rating, size: 13 }),
                        " ",
                        React.createElement("span", { className: "muted small" }, timeAgo(r.created_at)),
                        " ",
                        !r.approved && React.createElement("span", { className: "chip sm warnchip" }, "hidden / pending"),
                        " ",
                        r.reports > 0 && React.createElement("span", { className: "chip sm warnchip" },
                            "\u2691 ",
                            r.reports)),
                    React.createElement("div", { className: "actions" },
                        !r.approved ? React.createElement("button", { className: "btn sm", onClick: async () => { await sb.from('ah_reviews').update({ approved: true, reports: 0 }).eq('id', r.id); load(); } }, "Approve") : React.createElement("button", { className: "btn sm ghost", onClick: async () => { await sb.from('ah_reviews').update({ approved: false }).eq('id', r.id); load(); } }, "Hide"),
                        React.createElement("button", { className: "btn sm danger", onClick: async () => { if (!confirm('Delete this review?'))
                                return; await sb.from('ah_reviews').delete().eq('id', r.id); toast('Deleted'); load(); } }, "Delete"))),
                React.createElement("p", { className: "pre" }, r.comment),
                r.admin_reply && draft[r.id] === undefined && React.createElement("div", { className: "reply" },
                    React.createElement("b", null, "Your reply"),
                    React.createElement("p", { className: "pre" }, r.admin_reply),
                    React.createElement("button", { className: "btn sm ghost", onClick: () => setDraft({ ...draft, [r.id]: r.admin_reply }) }, "Edit"),
                    " ",
                    React.createElement("button", { className: "btn sm danger", onClick: () => reply(r, '') }, "Remove")),
                !r.admin_reply && draft[r.id] === undefined && React.createElement("button", { className: "btn sm ghost", onClick: () => setDraft({ ...draft, [r.id]: '' }) }, "Reply"),
                draft[r.id] !== undefined && React.createElement("div", { className: "form" },
                    React.createElement("textarea", { rows: 3, value: draft[r.id], onChange: (e) => setDraft({ ...draft, [r.id]: e.target.value }), placeholder: "Write a public reply\u2026" }),
                    React.createElement("div", { className: "row" },
                        React.createElement("button", { className: "btn sm", onClick: () => reply(r, draft[r.id].trim()) }, "Post reply"),
                        React.createElement("button", { className: "btn sm ghost", onClick: () => setDraft({ ...draft, [r.id]: undefined }) }, "Cancel"))));
        }) : React.createElement(Empty, null, "Nothing here.")));
}
function AdminComments() {
    const toast = useToast();
    const [rows, setRows] = useState(null);
    const [draft, setDraft] = useState({});
    const [flt, setFlt] = useState('all');
    const load = () => sb.from('ah_comments').select('*, ah_apps(name,slug)').order('created_at', { ascending: false }).limit(400).then(({ data }) => setRows(data || []));
    useEffect(() => { load(); }, []);
    if (!rows)
        return React.createElement(Loader, null);
    const list = rows.filter((r) => flt === 'all' || (flt === 'pending' && !r.approved) || (flt === 'reported' && r.reports > 0) || (flt === 'open' && !r.is_admin && !r.parent_id && !rows.some((x) => x.parent_id === r.id && x.is_admin)));
    const reply = async (c) => { const message = (draft[c.id] || '').trim(); if (!message)
        return; const { error } = await sb.from('ah_comments').insert({ app_id: c.app_id, parent_id: c.parent_id || c.id, name: 'Developer', message, is_admin: true }); if (error)
        return toast(error.message); setDraft({ ...draft, [c.id]: undefined }); toast('Reply posted'); load(); };
    return (React.createElement("div", { className: "card pad" },
        React.createElement("div", { className: "row between" },
            React.createElement("h2", null,
                "Questions & comments (",
                rows.length,
                ")"),
            React.createElement("div", { className: "chips" }, [['all', 'All'], ['open', 'Unanswered'], ['pending', 'Awaiting approval'], ['reported', 'Reported']].map(([k, l]) => React.createElement("button", { key: k, className: 'chip' + (k === flt ? ' active' : ''), onClick: () => setFlt(k) }, l)))),
        list.length ? list.map((c) => {
            var _a, _b;
            return React.createElement("div", { key: c.id, className: "review" },
                React.createElement("div", { className: "row between" },
                    React.createElement("div", null,
                        React.createElement("b", null, c.name),
                        " ",
                        c.is_admin && React.createElement("span", { className: "chip sm" }, "Developer"),
                        " on ",
                        React.createElement(Link, { to: `/${(_a = c.ah_apps) === null || _a === void 0 ? void 0 : _a.slug}/questions` }, (_b = c.ah_apps) === null || _b === void 0 ? void 0 : _b.name),
                        " ",
                        React.createElement("span", { className: "muted small" }, timeAgo(c.created_at)),
                        " ",
                        !c.approved && React.createElement("span", { className: "chip sm warnchip" }, "hidden / pending"),
                        " ",
                        c.reports > 0 && React.createElement("span", { className: "chip sm warnchip" },
                            "\u2691 ",
                            c.reports)),
                    React.createElement("div", { className: "actions" },
                        !c.approved ? React.createElement("button", { className: "btn sm", onClick: async () => { await sb.from('ah_comments').update({ approved: true, reports: 0 }).eq('id', c.id); load(); } }, "Approve") : !c.is_admin && React.createElement("button", { className: "btn sm ghost", onClick: async () => { await sb.from('ah_comments').update({ approved: false }).eq('id', c.id); load(); } }, "Hide"),
                        React.createElement("button", { className: "btn sm danger", onClick: async () => { if (!confirm('Delete?'))
                                return; await sb.from('ah_comments').delete().eq('id', c.id); load(); } }, "Delete"))),
                React.createElement("p", { className: "pre" }, c.message),
                draft[c.id] === undefined ? React.createElement("button", { className: "btn sm ghost", onClick: () => setDraft({ ...draft, [c.id]: '' }) }, "Reply as developer") : React.createElement("div", { className: "form" },
                    React.createElement("textarea", { rows: 3, value: draft[c.id], onChange: (e) => setDraft({ ...draft, [c.id]: e.target.value }) }),
                    React.createElement("div", { className: "row" },
                        React.createElement("button", { className: "btn sm", onClick: () => reply(c) }, "Post reply"),
                        React.createElement("button", { className: "btn sm ghost", onClick: () => setDraft({ ...draft, [c.id]: undefined }) }, "Cancel"))));
        }) : React.createElement(Empty, null, "Nothing here.")));
}
/* ---------- requests ---------- */
function AdminRequests() {
    const [rows, setRows] = useState(null);
    const [kind, setKind] = useState('all');
    const load = () => sb.from('ah_requests').select('*').order('created_at', { ascending: false }).limit(300).then(({ data }) => setRows(data || []));
    useEffect(() => { load(); }, []);
    if (!rows)
        return React.createElement(Loader, null);
    const list = rows.filter((r) => kind === 'all' || r.kind === kind);
    const label = { app: '🆕 App request', update: '🔄 Update request', contact: '✉️ Contact', report: '⚠️ Broken link' };
    return (React.createElement("div", { className: "card pad" },
        React.createElement("div", { className: "row between" },
            React.createElement("h2", null, "Requests & messages"),
            React.createElement("div", { className: "chips" }, ['all', 'app', 'update', 'report', 'contact'].map((k) => React.createElement("button", { key: k, className: 'chip' + (k === kind ? ' active' : ''), onClick: () => setKind(k) }, k === 'all' ? 'All' : label[k])))),
        list.length ? list.map((r) => React.createElement("div", { key: r.id, className: 'review req' + (r.status === 'done' ? ' done' : '') },
            React.createElement("div", { className: "row between" },
                React.createElement("b", null,
                    label[r.kind],
                    r.app_name && ` — ${r.app_name}`),
                React.createElement("span", { className: "muted small" }, timeAgo(r.created_at))),
            React.createElement("div", { className: "muted small" },
                r.name || 'Anonymous',
                " ",
                r.email && React.createElement(React.Fragment, null,
                    "\u00B7 ",
                    React.createElement("a", { href: `mailto:${r.email}` }, r.email)),
                " ",
                r.app_slug && React.createElement(React.Fragment, null,
                    "\u00B7 ",
                    React.createElement(Link, { to: `/${r.app_slug}` }, "open app"))),
            React.createElement("p", { className: "pre" }, r.message),
            React.createElement("div", { className: "row" },
                React.createElement("button", { className: "btn sm ghost", onClick: async () => { await sb.from('ah_requests').update({ status: r.status === 'done' ? 'new' : 'done' }).eq('id', r.id); load(); } }, r.status === 'done' ? 'Mark as new' : '✓ Mark done'),
                React.createElement("button", { className: "btn sm danger", onClick: async () => { await sb.from('ah_requests').delete().eq('id', r.id); load(); } }, "Delete")))) : React.createElement(Empty, null, "Nothing here.")));
}
/* ---------- ads & banners (owner) ---------- */
function AdminBanners() {
    const toast = useToast();
    const [rows, setRows] = useState(null);
    const [f, setF] = useState(null);
    const [busy, setBusy] = useState(false);
    const load = () => sb.from('ah_banners').select('*').order('created_at', { ascending: false }).then(({ data }) => setRows(data || []));
    useEffect(() => { load(); }, []);
    const save = async (e) => {
        e.preventDefault();
        const { id, created_at, clicks, impressions, ...row } = f;
        row.link_url = row.link_url || null;
        row.image_url = row.image_url || null;
        row.starts_at = row.starts_at ? new Date(row.starts_at).toISOString() : null;
        row.ends_at = row.ends_at ? new Date(row.ends_at).toISOString() : null;
        const { error } = id ? await sb.from('ah_banners').update(row).eq('id', id) : await sb.from('ah_banners').insert(row);
        if (error)
            return toast(error.message);
        toast('Saved');
        setF(null);
        load();
    };
    if (!rows)
        return React.createElement(Loader, null);
    if (f)
        return (React.createElement("div", { className: "card pad" },
            React.createElement("h2", null,
                f.id ? 'Edit' : 'New',
                " banner / ad"),
            React.createElement("form", { className: "form", onSubmit: save },
                React.createElement("label", null,
                    "Placement",
                    React.createElement("select", { value: f.placement, onChange: (e) => setF({ ...f, placement: e.target.value }) },
                        React.createElement("option", { value: "popup" }, "Pop-up before download"),
                        React.createElement("option", { value: "banner" }, "Banner on home page"))),
                React.createElement("label", null,
                    "Title",
                    React.createElement("input", { required: true, value: f.title, onChange: (e) => setF({ ...f, title: e.target.value }) })),
                React.createElement("label", null,
                    "Text",
                    React.createElement("textarea", { rows: 3, value: f.message, onChange: (e) => setF({ ...f, message: e.target.value }) })),
                React.createElement("label", null,
                    "Image",
                    React.createElement("input", { value: f.image_url || '', onChange: (e) => setF({ ...f, image_url: e.target.value }), placeholder: "URL or upload \u2193" }),
                    React.createElement("input", { type: "file", accept: "image/*", onChange: async (e) => { const file = e.target.files[0]; if (!file)
                            return; setBusy(true); try {
                            setF({ ...f, image_url: await uploadFile(file, 'banners') });
                        }
                        catch (er) {
                            toast(er.message);
                        } setBusy(false); } })),
                React.createElement("label", null,
                    "Link when clicked (optional)",
                    React.createElement("input", { value: f.link_url || '', onChange: (e) => setF({ ...f, link_url: e.target.value }), placeholder: "https://\u2026" })),
                React.createElement("div", { className: "form two" },
                    React.createElement("label", null,
                        "Start showing (optional)",
                        React.createElement("input", { type: "datetime-local", value: toLocalInput(f.starts_at), onChange: (e) => setF({ ...f, starts_at: e.target.value }) })),
                    React.createElement("label", null,
                        "Stop showing (optional)",
                        React.createElement("input", { type: "datetime-local", value: toLocalInput(f.ends_at), onChange: (e) => setF({ ...f, ends_at: e.target.value }) }))),
                React.createElement("label", { className: "check" },
                    React.createElement("input", { type: "checkbox", checked: f.active, onChange: (e) => setF({ ...f, active: e.target.checked }) }),
                    " Active"),
                React.createElement("div", { className: "row" },
                    React.createElement("button", { className: "btn", disabled: busy }, busy ? 'Uploading…' : 'Save'),
                    React.createElement("button", { type: "button", className: "btn ghost", onClick: () => setF(null) }, "Cancel")))));
    return (React.createElement("div", { className: "card pad" },
        React.createElement("div", { className: "row between" },
            React.createElement("h2", null, "Ads & banners"),
            React.createElement("button", { className: "btn", onClick: () => setF({ placement: 'popup', title: '', message: '', image_url: '', link_url: '', starts_at: null, ends_at: null, active: true }) }, "+ New")),
        React.createElement("p", { className: "muted small" }, "Pop-up ads appear before every download (a random live one is shown). With none live, downloads start immediately."),
        rows.length ? rows.map((b) => {
            const live = isLive(b);
            return (React.createElement("div", { key: b.id, className: "review row between" },
                React.createElement("div", { className: "row" },
                    b.image_url && React.createElement("img", { className: "thumb", src: b.image_url, alt: "" }),
                    React.createElement("div", null,
                        React.createElement("b", null, b.title),
                        " ",
                        React.createElement("span", { className: "chip sm" }, b.placement),
                        " ",
                        React.createElement("span", { className: 'chip sm' + (live ? '' : ' warnchip') }, live ? 'live' : b.active ? 'scheduled/expired' : 'off'),
                        React.createElement("p", { className: "muted small" }, b.message),
                        React.createElement("p", { className: "small" },
                            "\uD83D\uDC41 ",
                            fmtNum(b.impressions),
                            " \u00B7 \uD83D\uDDB1 ",
                            fmtNum(b.clicks),
                            " \u00B7 CTR ",
                            b.impressions ? ((b.clicks / b.impressions) * 100).toFixed(1) : 0,
                            "%",
                            b.starts_at && ` · from ${new Date(b.starts_at).toLocaleDateString()}`,
                            b.ends_at && ` · until ${new Date(b.ends_at).toLocaleDateString()}`))),
                React.createElement("div", { className: "actions" },
                    React.createElement("button", { className: "btn sm ghost", onClick: async () => { await sb.from('ah_banners').update({ active: !b.active }).eq('id', b.id); load(); } }, b.active ? 'Turn off' : 'Turn on'),
                    React.createElement("button", { className: "btn sm", onClick: () => setF(b) }, "Edit"),
                    React.createElement("button", { className: "btn sm danger", onClick: async () => { if (confirm('Delete?')) {
                            await sb.from('ah_banners').delete().eq('id', b.id);
                            load();
                        } } }, "Delete"))));
        }) : React.createElement(Empty, null, "No banners yet.")));
}
/* ---------- announcements: push + email + Telegram channel ---------- */
function AdminNotify() {
    const toast = useToast();
    const [apps, setApps] = useState([]);
    const [counts, setCounts] = useState(null);
    const [busy, setBusy] = useState(false);
    const [result, setResult] = useState(null);
    const [f, setF] = useState({ app: '', title: '', body: '', url: '', audience: 'followers', push: true, email: true, telegram: false });
    useEffect(() => {
        sb.from('ah_apps').select('id,name,slug,category,short_desc,whats_new,version').eq('is_published', true).order('name').then(({ data }) => setApps(data || []));
        Promise.all([sb.from('ah_push_subs').select('id', { count: 'exact', head: true }), sb.from('ah_subscribers').select('id', { count: 'exact', head: true })]).then(([p, e]) => setCounts({ push: p.count || 0, email: e.count || 0 }));
    }, []);
    const app = apps.find((a) => a.id === f.app);
    const fill = (type) => { if (!app)
        return toast('Choose an app first'); setF({ ...f, url: '/' + app.slug, title: type === 'new' ? `New app: ${app.name}` : `${app.name} updated to v${app.version}`, body: (type === 'new' ? app.short_desc : (app.whats_new || app.short_desc) || '').replace(/[*#_`]/g, '').slice(0, 140) || `${app.name} is now available on Appshub.` }); };
    const send = async () => {
        if (!f.title.trim() || !f.body.trim())
            return toast('Add a title and a message');
        if (!f.push && !f.email && !f.telegram)
            return toast('Pick at least one channel');
        if (!confirm('Send this announcement now?'))
            return;
        setBusy(true);
        setResult(null);
        try {
            const { data: { session } } = await sb.auth.getSession();
            const r = await fetch('/api/notify', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + session.access_token }, body: JSON.stringify({ title: f.title.trim(), body: f.body.trim(), url: f.url, slug: app === null || app === void 0 ? void 0 : app.slug, category: app === null || app === void 0 ? void 0 : app.category, audience: f.audience, channels: { push: f.push, email: f.email, telegram: f.telegram } }) });
            const j = await r.json().catch(() => ({ error: r.status === 404 ? 'Announcements only work on your deployed (Vercel) site.' : 'Server error' }));
            if (!r.ok)
                toast(j.error || 'Failed');
            else {
                setResult(j);
                toast('Sent!');
            }
        }
        catch (e) {
            toast(e.message);
        }
        setBusy(false);
    };
    return (React.createElement("div", { className: "cols" },
        React.createElement("div", { className: "card pad" },
            React.createElement("h2", null, "\uD83D\uDCE3 Announce"),
            React.createElement("p", { className: "muted small" }, "Send a notice about a new app or new version to visitors who saved the app or follow its category. Works on your deployed site."),
            React.createElement("div", { className: "form" },
                React.createElement("label", null,
                    "About which app? (optional)",
                    React.createElement("select", { value: f.app, onChange: (e) => setF({ ...f, app: e.target.value }) },
                        React.createElement("option", { value: "" }, "\u2014 none (general message) \u2014"),
                        apps.map((a) => React.createElement("option", { key: a.id, value: a.id }, a.name)))),
                app && React.createElement("div", { className: "row" },
                    React.createElement("button", { type: "button", className: "btn sm ghost", onClick: () => fill('new') }, "Fill: new app"),
                    React.createElement("button", { type: "button", className: "btn sm ghost", onClick: () => fill('ver') }, "Fill: new version")),
                React.createElement("label", null,
                    "Title",
                    React.createElement("input", { value: f.title, onChange: (e) => setF({ ...f, title: e.target.value }) })),
                React.createElement("label", null,
                    "Message",
                    React.createElement("textarea", { rows: 4, value: f.body, onChange: (e) => setF({ ...f, body: e.target.value }) })),
                React.createElement("label", null,
                    "Opens page (optional)",
                    React.createElement("input", { value: f.url, onChange: (e) => setF({ ...f, url: e.target.value }), placeholder: "/appname" })),
                React.createElement("label", null,
                    "Send to",
                    React.createElement("select", { value: f.audience, onChange: (e) => setF({ ...f, audience: e.target.value }) },
                        React.createElement("option", { value: "followers" }, "Followers of this app / its category"),
                        React.createElement("option", { value: "everyone" }, "Everyone who subscribed"))),
                React.createElement("div", { className: "row" },
                    React.createElement("label", { className: "check" },
                        React.createElement("input", { type: "checkbox", checked: f.push, onChange: (e) => setF({ ...f, push: e.target.checked }) }),
                        " Push"),
                    React.createElement("label", { className: "check" },
                        React.createElement("input", { type: "checkbox", checked: f.email, onChange: (e) => setF({ ...f, email: e.target.checked }) }),
                        " Email"),
                    React.createElement("label", { className: "check" },
                        React.createElement("input", { type: "checkbox", checked: f.telegram, onChange: (e) => setF({ ...f, telegram: e.target.checked }) }),
                        " Telegram channel")),
                React.createElement("button", { className: "btn", disabled: busy, onClick: send }, busy ? 'Sending…' : 'Send announcement')),
            result && React.createElement("div", { className: "card pad", style: { marginTop: 12 } },
                React.createElement("b", null, "Result"),
                result.push && React.createElement("p", { className: "small" },
                    "Push: ",
                    result.push.sent,
                    " sent, ",
                    result.push.failed,
                    " failed (",
                    result.push.audience,
                    " matched)"),
                result.email && React.createElement("p", { className: "small" },
                    "Email: ",
                    result.email.sent,
                    " sent, ",
                    result.email.failed,
                    " failed (",
                    result.email.audience,
                    " matched)"),
                result.telegram && React.createElement("p", { className: "small" },
                    "Telegram: ",
                    result.telegram.ok ? 'posted' : 'failed'))),
        React.createElement("aside", null,
            React.createElement("div", { className: "card pad" },
                React.createElement("h3", null, "Audience"),
                counts ? React.createElement(React.Fragment, null,
                    React.createElement("p", null,
                        "\uD83D\uDD14 ",
                        counts.push,
                        " push subscribers"),
                    React.createElement("p", null,
                        "\u2709\uFE0F ",
                        counts.email,
                        " email subscribers")) : React.createElement(Loader, null),
                React.createElement("p", { className: "muted small" }, "Email needs a Resend API key and Telegram needs a bot token + channel ID (Settings).")))));
}
/* ---------- team (owner) ---------- */
function AdminTeam({ session }) {
    const toast = useToast();
    const [rows, setRows] = useState(null);
    const [f, setF] = useState({ username: '', password: '', role: 'editor' });
    const [busy, setBusy] = useState(false);
    const load = () => sb.from('ah_admins').select('*').order('created_at').then(({ data }) => setRows(data || []));
    useEffect(() => { load(); }, []);
    const uname = (email) => email.replace('@appshub.app', '');
    if (!rows)
        return React.createElement(Loader, null);
    return (React.createElement("div", { className: "cols" },
        React.createElement("div", { className: "card pad" },
            React.createElement("h2", null, "\uD83D\uDC65 Team"),
            rows.map((a) => React.createElement("div", { key: a.email, className: "review row between" },
                React.createElement("div", null,
                    React.createElement("b", null, uname(a.email)),
                    " ",
                    React.createElement("span", { className: "chip sm" }, a.role),
                    a.email === session.user.email && React.createElement("span", { className: "muted small" }, " (you)")),
                React.createElement("div", { className: "actions" },
                    React.createElement("button", { className: "btn sm ghost", onClick: async () => { const p = prompt(`New password for ${uname(a.email)} (min 8 characters)`); if (!p)
                            return; const { error } = await sb.rpc('ah_set_admin_password', { p_username: uname(a.email), p_password: p }); toast(error ? error.message : 'Password changed'); } }, "Reset password"),
                    a.email !== session.user.email && a.email !== 'symoh@appshub.app' && React.createElement("button", { className: "btn sm danger", onClick: async () => { if (!confirm('Remove ' + uname(a.email) + '?'))
                            return; const { error } = await sb.rpc('ah_delete_admin', { p_username: uname(a.email) }); toast(error ? error.message : 'Removed'); load(); } }, "Remove"))))),
        React.createElement("aside", null,
            React.createElement("div", { className: "card pad" },
                React.createElement("h3", null, "Add a team member"),
                React.createElement("form", { className: "form", onSubmit: async (e) => { e.preventDefault(); setBusy(true); const { error } = await sb.rpc('ah_create_admin', { p_username: f.username.trim(), p_password: f.password, p_role: f.role }); setBusy(false); if (error)
                        return toast(error.message); toast('Account created'); setF({ username: '', password: '', role: 'editor' }); load(); } },
                    React.createElement("label", null,
                        "Username",
                        React.createElement("input", { required: true, value: f.username, onChange: (e) => setF({ ...f, username: e.target.value }) })),
                    React.createElement("label", null,
                        "Password (min 8)",
                        React.createElement("input", { required: true, type: "password", autoComplete: "new-password", value: f.password, onChange: (e) => setF({ ...f, password: e.target.value }) })),
                    React.createElement("label", null,
                        "Role",
                        React.createElement("select", { value: f.role, onChange: (e) => setF({ ...f, role: e.target.value }) },
                            React.createElement("option", { value: "editor" }, "Editor \u2014 apps, reviews, Q&A, requests"),
                            React.createElement("option", { value: "owner" }, "Owner \u2014 everything"))),
                    React.createElement("button", { className: "btn", disabled: busy }, "Create account"))))));
}
function AdminAccount({ session, role }) {
    const toast = useToast();
    const [p1, setP1] = useState('');
    const [p2, setP2] = useState('');
    return (React.createElement("div", { className: "cols" },
        React.createElement("div", { className: "card pad narrow" },
            React.createElement("h2", null, "\uD83D\uDD11 My account"),
            React.createElement("p", { className: "muted" },
                "Signed in as ",
                React.createElement("b", null, session.user.email.replace('@appshub.app', '')),
                " (",
                role,
                ")."),
            React.createElement("form", { className: "form", onSubmit: async (e) => { e.preventDefault(); if (p1.length < 8)
                    return toast('Use at least 8 characters'); if (p1 !== p2)
                    return toast('Passwords do not match'); const { error } = await sb.auth.updateUser({ password: p1 }); toast(error ? error.message : 'Password changed'); if (!error) {
                    setP1('');
                    setP2('');
                } } },
                React.createElement("label", null,
                    "New password",
                    React.createElement("input", { type: "password", autoComplete: "new-password", value: p1, onChange: (e) => setP1(e.target.value) })),
                React.createElement("label", null,
                    "Repeat new password",
                    React.createElement("input", { type: "password", autoComplete: "new-password", value: p2, onChange: (e) => setP2(e.target.value) })),
                React.createElement("button", { className: "btn" }, "Change password"))),
        React.createElement(TwoFactorCard, null)));
}
function TwoFactorCard() {
    const toast = useToast();
    const [factors, setFactors] = useState(null);
    const [enroll, setEnroll] = useState(null);
    const [code, setCode] = useState('');
    const [busy, setBusy] = useState(false);
    const load = () => sb.auth.mfa.listFactors().then(({ data }) => setFactors((data === null || data === void 0 ? void 0 : data.totp) || []));
    useEffect(() => { load(); }, []);
    const start = async () => { setBusy(true); const { data, error } = await sb.auth.mfa.enroll({ factorType: 'totp' }); setBusy(false); if (error)
        return toast(error.message); setEnroll(data); };
    const verify = async (e) => { e.preventDefault(); setBusy(true); const { data: ch, error: e1 } = await sb.auth.mfa.challenge({ factorId: enroll.id }); if (e1) {
        setBusy(false);
        return toast(e1.message);
    } const { error: e2 } = await sb.auth.mfa.verify({ factorId: enroll.id, challengeId: ch.id, code: code.trim() }); setBusy(false); if (e2)
        return toast('Wrong code, try again'); toast('Two-factor login enabled'); setEnroll(null); setCode(''); load(); };
    const remove = async (id) => { if (!confirm('Turn off two-factor login?'))
        return; const { error } = await sb.auth.mfa.unenroll({ factorId: id }); if (error)
        return toast(error.message); toast('Two-factor login turned off'); load(); };
    if (!factors)
        return React.createElement(Loader, null);
    return (React.createElement("div", { className: "card pad" },
        React.createElement("h2", null, "\uD83D\uDD10 Two-factor login"),
        factors.length > 0 ? React.createElement("p", null,
            "Enabled \u2713 ",
            React.createElement("button", { className: "btn sm danger", onClick: () => remove(factors[0].id) }, "Turn off")) : enroll ? (React.createElement("form", { className: "form", onSubmit: verify },
            React.createElement("p", { className: "muted small" }, "Scan this in your authenticator app (Google Authenticator, Authy\u2026), or enter the code manually."),
            React.createElement("img", { src: enroll.totp.qr_code, alt: "QR code for two-factor setup", style: { background: '#fff', padding: 8, borderRadius: 8, width: 180 } }),
            React.createElement("p", { className: "muted small" },
                "Manual code: ",
                React.createElement("code", null, enroll.totp.secret)),
            React.createElement("label", null,
                "Enter the 6-digit code to confirm",
                React.createElement("input", { required: true, inputMode: "numeric", maxLength: 6, value: code, onChange: (e) => setCode(e.target.value) })),
            React.createElement("div", { className: "row" },
                React.createElement("button", { className: "btn", disabled: busy }, "Confirm"),
                React.createElement("button", { type: "button", className: "btn ghost", onClick: () => setEnroll(null) }, "Cancel")))) : React.createElement(React.Fragment, null,
            React.createElement("p", { className: "muted" }, "Add an authenticator app code as a second step when logging in."),
            React.createElement("button", { className: "btn", disabled: busy, onClick: start }, "Set up two-factor login"))));
}
/* ---------- blocklist (owner) ---------- */
function AdminBlocklist() {
    const toast = useToast();
    const [rows, setRows] = useState(null);
    const [kind, setKind] = useState('email');
    const [value, setValue] = useState('');
    const [note, setNote] = useState('');
    const load = () => sb.from('ah_blocklist').select('*').order('created_at', { ascending: false }).then(({ data }) => setRows(data || []));
    useEffect(() => { load(); }, []);
    if (!rows)
        return React.createElement(Loader, null);
    const add = async (e) => { e.preventDefault(); if (!value.trim())
        return; const { error } = await sb.from('ah_blocklist').insert({ kind, value: value.trim(), note: note.trim() }); if (error)
        return toast(error.code === '23505' ? 'Already blocked' : error.message); setValue(''); setNote(''); toast('Blocked'); load(); };
    return (React.createElement("div", { className: "card pad narrow" },
        React.createElement("h2", null, "\uD83D\uDEAB Blocklist"),
        React.createElement("p", { className: "muted small" }, "Block an email address or IP from posting reviews, questions and requests. This is in addition to auto-hiding at 5 reports."),
        React.createElement("form", { className: "form two", onSubmit: add },
            React.createElement("label", null,
                "Type",
                React.createElement("select", { value: kind, onChange: (e) => setKind(e.target.value) },
                    React.createElement("option", { value: "email" }, "Email"),
                    React.createElement("option", { value: "ip" }, "IP address"))),
            React.createElement("label", null,
                "Value",
                React.createElement("input", { required: true, value: value, onChange: (e) => setValue(e.target.value), placeholder: kind === 'email' ? 'name@example.com' : '203.0.113.5' })),
            React.createElement("label", { className: "full" },
                "Note (optional)",
                React.createElement("input", { value: note, onChange: (e) => setNote(e.target.value), placeholder: "Why blocked" })),
            React.createElement("div", { className: "full" },
                React.createElement("button", { className: "btn" }, "Block"))),
        React.createElement("hr", null),
        rows.length ? rows.map((b) => React.createElement("div", { key: b.id, className: "review row between" },
            React.createElement("div", null,
                React.createElement("span", { className: "chip sm" }, b.kind),
                " ",
                React.createElement("b", null, b.value),
                b.note && React.createElement("div", { className: "muted small" }, b.note)),
            React.createElement("button", { className: "btn sm danger", onClick: async () => { await sb.from('ah_blocklist').delete().eq('id', b.id); load(); } }, "Remove"))) : React.createElement(Empty, null, "Nothing blocked.")));
}
/* ---------- activity log (owner) ---------- */
function AdminActivity() {
    const [rows, setRows] = useState(null);
    useEffect(() => { sb.from('ah_activity').select('*').order('created_at', { ascending: false }).limit(200).then(({ data }) => setRows(data || [])); }, []);
    if (!rows)
        return React.createElement(Loader, null);
    return (React.createElement("div", { className: "card pad" },
        React.createElement("h2", null, "\uD83D\uDCDC Activity log"),
        React.createElement("p", { className: "muted small" }, "Actions taken by team members (last 200)."),
        rows.length ? React.createElement("div", { className: "table-wrap" },
            React.createElement("table", { className: "table" },
                React.createElement("thead", null,
                    React.createElement("tr", null,
                        React.createElement("th", null, "Who"),
                        React.createElement("th", null, "Action"),
                        React.createElement("th", null, "Detail"),
                        React.createElement("th", null, "When"))),
                React.createElement("tbody", null, rows.map((r) => React.createElement("tr", { key: r.id },
                    React.createElement("td", null, r.actor.replace('@appshub.app', '')),
                    React.createElement("td", null, r.action),
                    React.createElement("td", null, r.detail),
                    React.createElement("td", { className: "muted small" }, timeAgo(r.created_at))))))) : React.createElement(Empty, null, "No activity yet.")));
}
/* ---------- settings (owner) ---------- */
function AdminSettings() {
    const toast = useToast();
    const [s, setS] = useState(null);
    const [sec, setSec] = useState(null);
    useEffect(() => { sb.from('ah_settings').select('*').then(({ data }) => setS(Object.fromEntries((data || []).map((r) => [r.key, r.value])))); sb.from('ah_secrets').select('*').then(({ data }) => setSec(Object.fromEntries((data || []).map((r) => [r.key, r.value])))); }, []);
    if (!s || !sec)
        return React.createElement(Loader, null);
    const fields = [['site_name', 'Site name'], ['tagline', 'Tagline'], ['announcement', 'Announcement bar (empty = hidden)'], ['popup_seconds', 'Seconds to wait in the download ad pop-up'], ['popup_message', 'Message in the ad pop-up'], ['donate_label', 'Donate button text'], ['donate_url', 'Donate link (PayPal, Buy Me a Coffee…)'], ['analytics_id', 'Analytics ID (GA: G-XXXXXXX, Plausible: yourdomain.com)']];
    const nfields = [['telegram_bot_token', 'Telegram bot token'], ['telegram_chat_id', 'Telegram chat ID (alerts to you)'], ['telegram_channel_id', 'Telegram channel ID or @channel (announcements)'], ['resend_api_key', 'Resend API key (for email)'], ['notify_email_to', 'Send alerts to email'], ['notify_email_from', 'Email “from” (e.g. Appshub <alerts@yourdomain.com>)'], ['discord_webhook_url', 'Discord webhook URL'], ['slack_webhook_url', 'Slack webhook URL']];
    const saveLegal = async () => { const { error } = await sb.from('ah_settings').upsert([{ key: 'terms_content', value: s.terms_content || '' }, { key: 'privacy_content', value: s.privacy_content || '' }]); toast(error ? error.message : 'Saved'); };
    return (React.createElement("div", { className: "cols" },
        React.createElement("div", null,
            React.createElement("div", { className: "card pad" },
                React.createElement("h2", null, "Site settings"),
                React.createElement("form", { className: "form", onSubmit: async (e) => { e.preventDefault(); const keys = [...fields.map((x) => x[0]), 'donate_text', 'review_mode', 'download_captcha', 'analytics_provider', 'cookie_notice']; const { error } = await sb.from('ah_settings').upsert(keys.map((k) => ({ key: k, value: s[k] || '' }))); toast(error ? error.message : 'Saved — refresh the site to see changes'); } },
                    fields.map(([k, l]) => React.createElement("label", { key: k },
                        l,
                        React.createElement("input", { value: s[k] || '', onChange: (e) => setS({ ...s, [k]: e.target.value }) }))),
                    React.createElement("label", null,
                        "Donate instructions (e.g. mobile money number)",
                        React.createElement("textarea", { rows: 3, value: s.donate_text || '', onChange: (e) => setS({ ...s, donate_text: e.target.value }) })),
                    React.createElement("label", null,
                        "New reviews & questions",
                        React.createElement("select", { value: s.review_mode || 'auto', onChange: (e) => setS({ ...s, review_mode: e.target.value }) },
                            React.createElement("option", { value: "auto" }, "Publish immediately"),
                            React.createElement("option", { value: "manual" }, "Hold until I approve"))),
                    React.createElement("label", null,
                        "Human check before downloads",
                        React.createElement("select", { value: s.download_captcha || 'off', onChange: (e) => setS({ ...s, download_captcha: e.target.value }) },
                            React.createElement("option", { value: "off" }, "Off"),
                            React.createElement("option", { value: "on" }, "On (small maths question)"))),
                    React.createElement("label", null,
                        "Analytics",
                        React.createElement("select", { value: s.analytics_provider || 'none', onChange: (e) => setS({ ...s, analytics_provider: e.target.value }) },
                            React.createElement("option", { value: "none" }, "None"),
                            React.createElement("option", { value: "ga" }, "Google Analytics"),
                            React.createElement("option", { value: "plausible" }, "Plausible"))),
                    React.createElement("label", { className: "check" },
                        React.createElement("input", { type: "checkbox", checked: s.cookie_notice !== 'off', onChange: (e) => setS({ ...s, cookie_notice: e.target.checked ? 'on' : 'off' }) }),
                        " Show a cookie consent banner when analytics is on"),
                    React.createElement("button", { className: "btn" }, "Save settings"))),
            React.createElement("div", { className: "card pad" },
                React.createElement("h2", null, "Terms of Service"),
                React.createElement(MdEditor, { rows: 8, value: s.terms_content, onChange: (v) => setS({ ...s, terms_content: v }) }),
                React.createElement("button", { className: "btn", style: { marginTop: 10 }, onClick: saveLegal }, "Save legal pages")),
            React.createElement("div", { className: "card pad" },
                React.createElement("h2", null, "Privacy Policy"),
                React.createElement(MdEditor, { rows: 8, value: s.privacy_content, onChange: (v) => setS({ ...s, privacy_content: v }) }),
                React.createElement("button", { className: "btn", style: { marginTop: 10 }, onClick: saveLegal }, "Save legal pages"))),
        React.createElement("div", { className: "card pad" },
            React.createElement("h2", null, "\uD83D\uDD14 Alerts & notifications"),
            React.createElement("p", { className: "muted small" }, "Instant alerts to you (Telegram/email) plus keys for announcements. Stored privately \u2014 only owners can read them."),
            React.createElement("form", { className: "form", onSubmit: async (e) => { e.preventDefault(); const { error } = await sb.from('ah_secrets').upsert(nfields.map(([k]) => ({ key: k, value: (sec[k] || '').trim() }))); toast(error ? error.message : 'Saved'); } },
                nfields.map(([k, l]) => React.createElement("label", { key: k },
                    l,
                    React.createElement("input", { type: /token|key/.test(k) ? 'password' : 'text', autoComplete: "off", value: sec[k] || '', onChange: (e) => setSec({ ...sec, [k]: e.target.value }) }))),
                React.createElement("div", { className: "row" },
                    React.createElement("button", { className: "btn" }, "Save"),
                    React.createElement("button", { type: "button", className: "btn ghost", onClick: async () => { const { error } = await sb.from('ah_requests').insert({ kind: 'contact', name: 'Appshub', message: 'This is a test notification 🎉' }); toast(error ? error.message : 'Test sent — check Telegram / email'); } }, "Send test alert"))))));
}
/* ---------- backup (owner) ---------- */
function AdminBackup() {
    const toast = useToast();
    const [busy, setBusy] = useState('');
    const tables = [['ah_apps', 'Apps'], ['ah_versions', 'Versions'], ['ah_screenshots', 'Screenshots'], ['ah_reviews', 'Reviews'], ['ah_comments', 'Q&A'], ['ah_requests', 'Requests'], ['ah_banners', 'Banners'], ['ah_collections', 'Collections'], ['ah_subscribers', 'Email subscribers'], ['ah_downloads', 'Downloads log']];
    const csv = async (t) => { setBusy(t); try {
        saveFile(`${t}-${new Date().toISOString().slice(0, 10)}.csv`, toCSV(await fetchAll(t)));
    }
    catch (e) {
        toast(e.message);
    } setBusy(''); };
    const all = async () => { setBusy('all'); try {
        const out = {};
        for (const [t] of tables)
            out[t] = await fetchAll(t);
        saveFile(`appshub-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(out, null, 2), 'application/json');
    }
    catch (e) {
        toast(e.message);
    } setBusy(''); };
    return (React.createElement("div", { className: "cols" },
        React.createElement("div", { className: "card pad narrow" },
            React.createElement("h2", null, "\uD83D\uDCBE Backup & export"),
            React.createElement("p", { className: "muted" }, "Download your data as CSV (opens in Excel/Sheets) or everything as one JSON file."),
            React.createElement("div", { className: "dl-list" },
                tables.map(([t, l]) => React.createElement("button", { key: t, className: "btn ghost", disabled: !!busy, onClick: () => csv(t) }, busy === t ? 'Exporting…' : `Export ${l} (CSV)`)),
                React.createElement("button", { className: "btn", disabled: !!busy, onClick: all }, busy === 'all' ? 'Preparing…' : 'Download full backup (JSON)'))),
        React.createElement(AdminImport, null)));
}
/* ---------- parse our own CSV format (matches toCSV's quoting) ---------- */
function parseCSV(text) {
    const rows = [];
    let row = [], field = '', inQ = false;
    for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (inQ) {
            if (c === '"') {
                if (text[i + 1] === '"') {
                    field += '"';
                    i++;
                }
                else
                    inQ = false;
            }
            else
                field += c;
        }
        else if (c === '"')
            inQ = true;
        else if (c === ',') {
            row.push(field);
            field = '';
        }
        else if (c === '\n' || c === '\r') {
            if (c === '\r' && text[i + 1] === '\n')
                i++;
            row.push(field);
            rows.push(row);
            row = [];
            field = '';
        }
        else
            field += c;
    }
    if (field || row.length) {
        row.push(field);
        rows.push(row);
    }
    if (!rows.length)
        return [];
    const head = rows[0];
    return rows.slice(1).filter((r) => r.length > 1 || r[0]).map((r) => Object.fromEntries(head.map((h, i) => [h, r[i]])));
}
const APP_IMPORT_COLS = ['name', 'slug', 'icon_url', 'short_desc', 'about', 'features', 'category', 'developer', 'version', 'size', 'platform', 'content_rating', 'download_url', 'sha256', 'extra_links', 'whats_new', 'seo_keywords', 'seo_description', 'is_featured', 'is_published', 'is_verified'];
function AdminImport() {
    const toast = useToast();
    const [busy, setBusy] = useState(false);
    const [result, setResult] = useState(null);
    const onFile = async (file) => {
        if (!file)
            return;
        setBusy(true);
        setResult(null);
        try {
            const text = await file.text();
            const rows = parseCSV(text);
            const clean = rows.map((r) => {
                const row = {};
                for (const c of APP_IMPORT_COLS)
                    if (r[c] !== undefined)
                        row[c] = r[c];
                row.slug = slugify(row.slug || row.name || '');
                row.name = (row.name || '').trim();
                if (!row.slug || !row.name || RESERVED.includes(row.slug))
                    return null;
                for (const b of ['is_featured', 'is_published', 'is_verified'])
                    if (row[b] !== undefined)
                        row[b] = String(row[b]).toLowerCase() === 'true';
                for (const j of ['features'])
                    if (row[j]) {
                        try {
                            row.features = JSON.parse(row.features);
                        }
                        catch {
                            row.features = lines(row.features);
                        }
                    }
                if (row.extra_links) {
                    try {
                        row.extra_links = JSON.parse(row.extra_links);
                    }
                    catch {
                        row.extra_links = [];
                    }
                }
                return row;
            }).filter(Boolean);
            if (!clean.length) {
                toast('No valid rows found — check the column headers match an exported Apps CSV.');
                setBusy(false);
                return;
            }
            const { error, count } = await sb.from('ah_apps').upsert(clean, { onConflict: 'slug' }).select('id', { count: 'exact' });
            setBusy(false);
            if (error)
                return toast(error.message);
            sb.rpc('ah_log', { p_action: 'import_csv', p_detail: clean.length + ' apps' }).then(() => { });
            setResult({ total: rows.length, imported: clean.length });
            toast('Import complete');
        }
        catch (e) {
            setBusy(false);
            toast(e.message);
        }
    };
    return (React.createElement("div", { className: "card pad narrow" },
        React.createElement("h2", null, "\uD83D\uDCE5 Import apps from CSV"),
        React.createElement("p", { className: "muted small" }, "Use a CSV with the same columns as \u201CExport Apps (CSV)\u201D. Matching an existing app\u2019s link name updates it instead of duplicating it. Screenshots and version history are not imported."),
        React.createElement("input", { type: "file", accept: ".csv,text/csv", disabled: busy, onChange: (e) => { onFile(e.target.files[0]); e.target.value = ''; } }),
        busy && React.createElement("p", { className: "muted small" }, "Importing\u2026"),
        result && React.createElement("p", { className: "small" },
            "Read ",
            result.total,
            " row(s), imported ",
            result.imported,
            ".")));
}
/* Entry: re-mounts the app when the language changes */
function Root() {
    const [k, setK] = useState(0);
    useEffect(() => { const f = () => setK((x) => x + 1); addEventListener('ah-lang', f); return () => removeEventListener('ah-lang', f); }, []);
    return React.createElement(ToastHost, { key: k },
        React.createElement(Router, null,
            React.createElement(App, null)));
}
ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(Root, null));

})();