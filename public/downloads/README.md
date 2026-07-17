# App download binaries

The **Download** buttons on the Profile page (`/profile`) link to files served from
this folder (Vite serves everything under `public/` at the site root):

| Button        | Expected file                    | Served at            |
| ------------- | -------------------------------- | -------------------- |
| Android (APK) | `cashbook/public/downloads/CashBook.apk` | `/downloads/CashBook.apk` |
| iOS (IPA)     | `cashbook/public/downloads/CashBook.ipa` | `/downloads/CashBook.ipa` |

## How to produce these files

The binaries are **built from the `cashbook-app` project** (Expo / React Native) — see
`cashbook-app/BUILD.md`. In short:

```bash
cd ../cashbook-app
npm run build:apk   # → downloads a CashBook.apk from EAS
npm run build:ipa   # → downloads a CashBook.ipa from EAS (needs an Apple Developer account)
```

Then copy the produced artifacts here and rename them to `CashBook.apk` / `CashBook.ipa`.

> Until the real binaries are placed here, the download buttons show a clean
> **"not published yet"** message instead of downloading anything. (They no longer save
> the SPA's `index.html` as `CashBook.apk.html` — the download helper checks the response
> content-type first.) No placeholder binaries are committed, because a fake `.apk`/`.ipa`
> would fail to install on a real device.

## Hosting the binary elsewhere (instead of this folder)

If you host the built app on a CDN / the backend / an EAS artifact URL, point the buttons
there with build-time env vars (no code change needed) — e.g. in `cashbook/.env.production`:

```
VITE_APK_URL=https://your-host/CashBook.apk
VITE_IPA_URL=https://your-host/CashBook.ipa
```

The download logic lives in `cashbook/src/utils/appDownload.js`.
