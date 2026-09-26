# How to deploy Appshub

## Option 1 — Vercel (all features)
Vercel has no drag-and-drop. Use ONE of these:

### A) Vercel CLI (fastest, needs Node.js on your computer)
1. Unzip the folder, open a terminal inside it.
2. `npx vercel login`   (follow the email link)
3. `npx vercel --prod`  — answer: Set up and deploy? Y · Link to existing project? N · Directory? ./ · Override settings? N

### B) GitHub
1. Create a repo on github.com, upload ALL files from inside the unzipped folder (index.html must be at the repo's top level).
2. vercel.com/new → Import that repo → Framework Preset: Other → leave Build/Output/Install commands empty → Deploy.

## Option 2 — Netlify Drop (easiest, no account tools needed)
app.netlify.com/drop → drag the unzipped folder in. Site works (apps, admin, reviews, downloads, PWA).
Not available there: link previews, country stats, sitemap, and Announce (push/email/Telegram).

## Option 3 — Cloudflare Pages
dash.cloudflare.com → Workers & Pages → Create → Pages → Upload assets → drag the folder. Same limits as Netlify.
