# Fountain Stream

A streaming app for movies, TV shows, and anime. Built with Next.js and packaged as a native Android APK using Capacitor.

## Features

- Browse trending movies, TV shows, and anime
- Multiple streaming sources per title (VidSrc, 2Embed, AutoEmbed, SuperEmbed)
- Sources displayed as selectable buttons — switch instantly if one fails, auto-switches on error
- Download button per source
- Subtitle support via SubDL
- Continue watching — picks up where you left off
- Offline detection with banner alert
- Service worker caching for shell and visited pages
- Dark mode

## Building the APK

The GitHub Actions workflow in `.github/workflows/build-apk.yml` handles everything automatically.

1. Push this repo to GitHub
2. Go to Actions → "Build Android APK" → Run workflow
3. Download the APK from Artifacts when done (~5-8 min)
4. Install on Android (enable "Install unknown apps" first)

No server or hosting required. The app is fully self-contained — TMDB data and subtitles are fetched live from inside the app.

## Tech Stack

- **Next.js** — framework, static export
- **Capacitor** — wraps the static build into a native Android APK
- **TMDB API** — movie and TV metadata
- **SubDL API** — subtitles
- **Tailwind CSS + shadcn/ui** — styling

## Streaming Sources

| Source | Used for |
|---|---|
| VidSrc | Primary |
| 2Embed | Fallback 1 |
| AutoEmbed | Fallback 2 |
| SuperEmbed | Fallback 3 |

The player auto-switches to the next source if the current one fails to load.
