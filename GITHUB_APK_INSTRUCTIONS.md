# Fountain Stream APK — No Vercel Needed!

The APK is fully self-contained. The website is bundled inside the app.
TMDB data is fetched live from the app at runtime.

## Changes made
- ✅ Sources shown as flat buttons — no dropdown
- ✅ Download button per source  
- ✅ Offline detection banner
- ✅ Service Worker + PWA manifest
- ✅ All pages converted to client-side (works with static export)
- ✅ Subtitle API calls go directly to SubDL (no server needed)
- ✅ GitHub Actions builds a fully bundled APK

---

## Steps (takes ~10 minutes total)

### 1. Create a GitHub repo
- Go to github.com → New repository → name it anything
- Upload this entire zip contents to the repo

### 2. Add your TMDB API key as a secret
- Repo → Settings → Secrets and variables → Actions → New repository secret
- Name: `TMDB_API_KEY`
- Value: your key from themoviedb.org (free account)

### 3. Run the workflow
- Go to Actions tab → "Build Android APK" → Run workflow → Run workflow

### 4. Download the APK (~5 min build time)
- Click the finished workflow run
- Download the "Fountain-Stream-debug" artifact
- Unzip it — you'll find `app-debug.apk`

### 5. Install on your phone
- Copy the APK to your Android phone
- Settings → Apps → Install unknown apps → allow your browser/file manager
- Open the APK to install

---

## Getting a free TMDB API key
1. Go to themoviedb.org → sign up (free)
2. Settings → API → Request an API Key → choose Developer
3. Copy the "API Key (v3 auth)" value
