import { useState } from 'react';
import { Smartphone, Apple } from 'lucide-react';
import { downloadApp } from '../../utils/appDownload';

/**
 * Reusable "Download the app" buttons (Android APK + iOS IPA).
 * Shared by the landing page, profile page and the mobile-block screen.
 *
 * variant:
 *   'onLight' — for light backgrounds (blue filled APK, outlined IPA)
 *   'onBlue'  — for blue/dark backgrounds (white filled APK, translucent IPA)
 */
export default function AppDownloadButtons({ variant = 'onLight' }) {
  const [busy, setBusy] = useState(null); // 'android' | 'ios' | null
  const [note, setNote] = useState(null); // { ok, text }

  const handle = async (platform) => {
    setNote(null);
    setBusy(platform);
    const res = await downloadApp(platform);
    setBusy(null);
    if (!res.ok) setNote({ ok: false, text: res.reason });
  };

  const onBlue = variant === 'onBlue';

  const base = {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: '11px 18px', borderRadius: 8, fontSize: 13, fontWeight: 700,
    cursor: 'pointer', whiteSpace: 'nowrap', flex: '1 1 auto',
    fontFamily: 'inherit', transition: 'opacity 150ms, background 150ms',
  };

  const apkStyle = onBlue
    ? { ...base, background: '#fff', color: '#1D4ED8', border: '1.5px solid #fff' }
    : { ...base, background: '#2563EB', color: '#fff', border: '1.5px solid #2563EB' };

  const ipaStyle = onBlue
    ? { ...base, background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.55)' }
    : { ...base, background: '#fff', color: '#2563EB', border: '1.5px solid #2563EB' };

  const noteColor = onBlue ? '#FCA5A5' : '#DC2626';

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button
          type="button"
          style={{ ...apkStyle, opacity: busy === 'android' ? 0.6 : 1 }}
          disabled={busy === 'android'}
          onClick={() => handle('android')}
        >
          <Smartphone size={15} />
          {busy === 'android' ? 'Preparing…' : 'Android (APK)'}
        </button>
        <button
          type="button"
          style={{ ...ipaStyle, opacity: busy === 'ios' ? 0.6 : 1 }}
          disabled={busy === 'ios'}
          onClick={() => handle('ios')}
        >
          <Apple size={15} />
          {busy === 'ios' ? 'Preparing…' : 'iOS (IPA)'}
        </button>
      </div>
      {note && (
        <div style={{ marginTop: 8, fontSize: 12, color: noteColor, lineHeight: 1.4 }}>
          {note.text}
        </div>
      )}
    </div>
  );
}
