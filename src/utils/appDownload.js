// Centralised app-download logic for the web app.
//
// The binaries are served from cashbook/public/downloads/ by default, but you can
// point the buttons at a hosted build (e.g. an EAS artifact URL, the backend, or a
// CDN) by setting VITE_APK_URL / VITE_IPA_URL at build time.
//
// IMPORTANT: when the binary does not exist, the dev/preview server answers with the
// SPA's index.html (text/html). A naive `<a download>` then saves that HTML as
// "CashBook.apk" (which the phone renames to CashBook.apk.html and cannot install).
// downloadApp() guards against exactly that by inspecting the response content-type
// before saving anything.

export const APK_URL = import.meta.env.VITE_APK_URL || '/downloads/CashBook.apk';
export const IPA_URL = import.meta.env.VITE_IPA_URL || '/downloads/CashBook.ipa';

const META = {
  android: { url: APK_URL, label: 'Android', file: 'CashBook.apk' },
  ios:     { url: IPA_URL, label: 'iOS',     file: 'CashBook.ipa' },
};

function triggerAnchorDownload(url, filename) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/**
 * Download the platform build.
 * @param {'android'|'ios'} platform
 * @returns {Promise<{ok: boolean, reason?: string}>}
 */
export async function downloadApp(platform) {
  const meta = META[platform] || META.android;
  const { url, label, file } = meta;

  // External (cross-origin) URL: can't inspect via fetch (CORS) — open directly.
  if (!url.startsWith('/')) {
    window.open(url, '_blank', 'noopener,noreferrer');
    return { ok: true };
  }

  try {
    const res = await fetch(url, { cache: 'no-store' });
    const type = (res.headers.get('content-type') || '').toLowerCase();

    // Missing file → server returns the SPA shell (index.html) instead of a binary.
    if (!res.ok || type.includes('text/html')) {
      try { await res.body?.cancel(); } catch { /* noop */ }
      return { ok: false, reason: `The ${label} app isn't published yet. Please check back soon.` };
    }

    // Real binary confirmed. Abort this probe stream and let the browser download it
    // natively (streamed, with progress) so large APKs aren't held in memory.
    try { await res.body?.cancel(); } catch { /* noop */ }
    triggerAnchorDownload(url, file);
    return { ok: true };
  } catch {
    return { ok: false, reason: `Couldn't start the ${label} download. Please try again.` };
  }
}
