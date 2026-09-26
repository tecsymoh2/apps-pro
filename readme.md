# Appshub v3
Play-Store style app download site — React + Supabase, deployed on Vercel.

## Deploy


## Files
- index.html, style.css, app.js (precompiled — this is what runs), sw.js, manifest.webmanifest, icons/
- src/ — readable source (i18n.js, app.jsx, features.jsx, admin.jsx, main.jsx)
- build.js — after editing src/, run `npm install` then `node build.js` to regenerate app.js
- api/page.js (link previews + SEO), api/geo.js (country), api/sitemap.js, api/notify.js (announcements)

## Admin
/admin — owner can do everything; "editor" accounts (Team tab) manage apps, reviews, Q&A and requests only.
