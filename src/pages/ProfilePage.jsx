import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Pencil, LogOut, ChevronDown, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AppDownloadButtons from '../components/shared/AppDownloadButtons';

/* ── Simple Toggle switch ─────────────────────────────── */
function Toggle({ on, onChange }) {
  return (
    <div
      onClick={() => onChange(!on)}
      style={{
        width: 42, height: 24, borderRadius: 12, cursor: 'pointer',
        background: on ? '#2563EB' : '#D1D5DB',
        position: 'relative', transition: 'background 200ms', flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute', top: 3, left: on ? 21 : 3,
        width: 18, height: 18, borderRadius: '50%', background: 'white',
        boxShadow: '0 1px 4px rgba(0,0,0,0.2)', transition: 'left 200ms',
      }} />
    </div>
  );
}

/* ── Inline editable field ────────────────────────────── */
function EditableField({ label, value, onChange, placeholder = '', type = 'text' }) {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  return (
    <div style={{ padding: '16px 0', borderBottom: '1px solid #F3F4F6' }}>
      <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 6, fontWeight: 500 }}>{label}</div>
      <div
        onClick={() => !editing && setEditing(true)}
        style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: editing ? 'default' : 'text' }}
      >
        {editing ? (
          <>
            <input
              ref={inputRef}
              type={type}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === 'Escape') setEditing(false); }}
              onBlur={() => setEditing(false)}
              placeholder={placeholder}
              style={{
                flex: 1, fontSize: 14, padding: '6px 0',
                border: 'none', borderBottom: '1.5px solid #2563EB',
                outline: 'none', background: 'transparent', color: '#111827',
              }}
            />
            <div onClick={() => setEditing(false)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 4 }}>
              <Check size={15} color="#2563EB" />
            </div>
          </>
        ) : (
          <>
            <span style={{ flex: 1, fontSize: 14, color: value ? '#111827' : '#9CA3AF' }}>
              {value || placeholder}
            </span>
            <div
              onClick={() => setEditing(true)}
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 4, borderRadius: 4 }}
              onMouseEnter={e => e.currentTarget.style.background = '#F3F4F6'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <Pencil size={14} color="#6B7280" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Phone mockup for the app banner ─────────────────── */
function PhoneMockup() {
  const rows = [
    { date: 'Feb 16, 9 PM', label: 'Petrol', amount: '+1280', balance: '28000', color: '#22C55E' },
    { date: 'Feb 1, 1 PM', label: 'Payment', amount: '+450', balance: '29280', color: '#22C55E' },
    { date: 'Feb 1, 1 PM', label: 'Grocery', amount: '-450', balance: '', color: '#EF4444' },
  ];

  return (
    <div style={{
      width: 160, background: '#1F2937', borderRadius: 18,
      padding: '10px 8px', border: '2px solid #374151',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    }}>
      {/* Notch */}
      <div style={{ width: 40, height: 5, background: '#374151', borderRadius: 4, margin: '0 auto 8px' }} />
      {/* App content */}
      <div style={{ background: 'white', borderRadius: 10, overflow: 'hidden', padding: '10px 8px' }}>
        <div style={{ fontSize: 9, fontWeight: 500, color: '#111827', marginBottom: 8 }}>Business Expenses</div>
        <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
          {[['Cash In', '+', '#22C55E', '30000'], ['Cash Out', '-', '#EF4444', '2000']].map(([lbl, icon, clr, val]) => (
            <div key={lbl} style={{ flex: 1, background: '#F9FAFB', borderRadius: 4, padding: '4px 5px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 2 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: clr, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 6, color: 'white', fontWeight: 500 }}>{icon}</div>
                <span style={{ fontSize: 7, color: '#6B7280' }}>{lbl}</span>
              </div>
              <div style={{ fontSize: 9, fontWeight: 500, color: '#111827' }}>{val}</div>
            </div>
          ))}
        </div>
        {rows.map((r, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 0', borderBottom: i < rows.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
            <div>
              <div style={{ fontSize: 7, color: '#9CA3AF' }}>{r.date}</div>
              <div style={{ fontSize: 8, fontWeight: 600, color: '#374151' }}>{r.label}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 8, fontWeight: 500, color: r.color }}>{r.amount}</div>
              {r.balance && <div style={{ fontSize: 7, color: '#9CA3AF' }}>{r.balance}</div>}
            </div>
          </div>
        ))}
        {/* skeleton rows */}
        {[1, 2].map((i) => (
          <div key={i} style={{ height: 6, background: '#F3F4F6', borderRadius: 3, marginTop: 5 }} />
        ))}
      </div>
    </div>
  );
}

/* ── Mobile App Banner ────────────────────────────────── */
function MobileAppBanner() {
  return (
    <div style={{
      marginTop: 16, borderRadius: 12, overflow: 'hidden',
      display: 'flex', background: '#3D52D5',
      minHeight: 180,
    }}>
      {/* Left — phone mockup */}
      <div style={{
        width: '45%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        padding: '20px 0 0', background: 'linear-gradient(135deg, #4F63E0 0%, #3D52D5 100%)',
      }}>
        <PhoneMockup />
      </div>

      {/* Right — info */}
      <div style={{ flex: 1, padding: '24px 24px 24px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ fontSize: 12, color: '#BAC4FF', marginBottom: 4 }}>Checkout the</div>
        <div style={{ fontSize: 20, fontWeight: 600, color: 'white', marginBottom: 12 }}>Mobile App</div>
        {['Offline Support', 'Book Sharing', 'Data Backup'].map((f) => (
          <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
            <div style={{
              width: 14, height: 14, borderRadius: '50%', background: '#22C55E',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Check size={8} color="white" strokeWidth={3} />
            </div>
            <span style={{ fontSize: 12, color: '#E0E7FF' }}>{f}</span>
          </div>
        ))}
        <button style={{
          marginTop: 14, display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 16px', borderRadius: 8,
          background: 'white', color: '#3D52D5',
          border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500,
          width: 'fit-content',
        }}>
          <Download size={13} />
          Download Now
        </button>
      </div>
    </div>
  );
}

/* ── Mini header for profile page ────────────────────── */
function ProfileHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDrop, setShowDrop] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setShowDrop(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const displayName = user?.name || user?.email?.split('@')[0] || 'User';
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, height: 52,
      background: 'white', borderBottom: '1px solid #E5E7EB',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 20px', zIndex: 100,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }} onClick={() => navigate(-1)}>
        <div style={{ width: 26, height: 26, borderRadius: 5, background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 13, fontWeight: 600 }}>C</div>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#1E3A8A' }}>CASHBOOK</span>
      </div>

      <div ref={ref} style={{ position: 'relative' }}>
        <div
          onClick={() => setShowDrop((v) => !v)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', padding: '4px 8px', borderRadius: 6, border: '1px solid #E5E7EB' }}
        >
          <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#2563EB', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 500 }}>{initials}</div>
          <span style={{ fontSize: 13, fontWeight: 500 }}>{displayName}</span>
          <ChevronDown size={13} />
        </div>

        {showDrop && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 6px)', right: 0,
            background: 'white', border: '1px solid #E5E7EB', borderRadius: 10,
            boxShadow: '0 4px 20px rgba(0,0,0,0.12)', minWidth: 220, zIndex: 200, overflow: 'hidden',
          }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #F3F4F6', display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#2563EB', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 500 }}>{initials}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{displayName}</div>
                <div style={{ color: '#6B7280', fontSize: 12 }}>{user?.mobile || user?.email}</div>
                <div style={{ color: '#2563EB', fontSize: 12, marginTop: 2, fontWeight: 500 }}>Your Profile &gt;</div>
              </div>
            </div>
            <div style={{ padding: '4px 0' }}>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', cursor: 'pointer', fontSize: 13 }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                onClick={() => { logout(); navigate('/login'); }}
              >
                <LogOut size={15} color="#EF4444" />
                <span style={{ color: '#EF4444' }}>Logout</span>
              </div>
            </div>
            <div style={{ padding: '8px 16px', borderTop: '1px solid #F3F4F6', fontSize: 11, color: '#9CA3AF', textAlign: 'center' }}>
              © CashBook • Version 4.6.0
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
/* ── Main Profile Page ────────────────────────────────── */
export default function ProfilePage() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState(true);
  const [profileError, setProfileError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Draft state for edits
  const [draftProfile, setDraftProfile] = useState({ name: '', mobile: '', email: '' });

  // OTP Modal State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpMobile, setOtpMobile] = useState('');
  const [otpEmail, setOtpEmail] = useState('');
  const [otpError, setOtpError] = useState('');

  useEffect(() => {
    if (user) {
      setDraftProfile({
        name: user.name || '',
        mobile: user.mobile || '',
        email: user.email || ''
      });
    }
  }, [user]);

  const hasChanges = draftProfile.name !== (user?.name || '') ||
    draftProfile.mobile !== (user?.mobile || '') ||
    draftProfile.email !== (user?.email || '');

  const handleSaveChangesClick = async () => {
    setProfileError(null);
    setOtpError('');
    const mobileChanged = draftProfile.mobile !== (user?.mobile || '');
    const emailChanged = draftProfile.email !== (user?.email || '');

    if (mobileChanged || emailChanged) {
      setIsSaving(true);
      try {
        if (mobileChanged) await fetch('/api/auth/send-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mobile: draftProfile.mobile }) });
        if (emailChanged) await fetch('/api/auth/send-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: draftProfile.email }) });
        setShowOtpModal(true);
      } catch (err) {
        setProfileError('Failed to send OTPs. Please try again.');
      }
      setIsSaving(false);
    } else {
      saveProfileToBackend();
    }
  };

  const saveProfileToBackend = async () => {
    setIsSaving(true);
    setProfileError(null);
    setOtpError('');
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: draftProfile.name,
          mobile: draftProfile.mobile,
          email: draftProfile.email,
          otpMobile: otpMobile || undefined,
          otpEmail: otpEmail || undefined
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');

      updateUser(data.user);
      setShowOtpModal(false);
      setOtpMobile('');
      setOtpEmail('');
    } catch (err) {
      if (showOtpModal) {
        setOtpError(err.message);
      } else {
        setProfileError(err.message);
      }
    }
    setIsSaving(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F3F4F6' }}>
      <ProfileHeader />

      <div style={{ paddingTop: 52 + 32, paddingBottom: 40, display: 'flex', justifyContent: 'center', padding: `${52 + 24}px 16px 40px` }}>
        <div style={{ width: '100%', maxWidth: 620 }}>

          {/* Profile card */}
          <div style={{ background: 'white', borderRadius: 12, padding: '20px 24px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
            {/* Title row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, paddingBottom: 12, borderBottom: '1px solid #F3F4F6' }}>
              <button
                onClick={() => navigate(-1)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0, color: '#374151' }}
              >
                <ArrowLeft size={18} />
              </button>
              <span style={{ fontSize: 16, fontWeight: 500, color: '#111827' }}>Your Profile Details</span>
            </div>

            {/* Error banner */}
            {profileError && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8,
                marginBottom: 4,
              }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span style={{ fontSize: 13, color: '#DC2626', flex: 1 }}>{profileError}</span>
                <button onClick={() => setProfileError(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#DC2626', fontSize: 16, lineHeight: 1, padding: 0 }}>×</button>
              </div>
            )}

            {/* Name */}
            <EditableField
              label="Name"
              value={draftProfile.name}
              placeholder="Enter your name"
              onChange={(name) => setDraftProfile(p => ({ ...p, name }))}
            />

            {/* Mobile */}
            <EditableField
              label="Mobile Number"
              value={draftProfile.mobile}
              placeholder="Enter mobile number"
              type="tel"
              onChange={(mobile) => setDraftProfile(p => ({ ...p, mobile }))}
            />

            {/* Email */}
            <div style={{ padding: '16px 0', borderBottom: '1px solid #F3F4F6' }}>
              <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 6, fontWeight: 500 }}>Email</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <EmailField value={draftProfile.email} onChange={(email) => setDraftProfile(p => ({ ...p, email }))} />
              </div>
            </div>

            {/* Notifications */}
            <div style={{ padding: '16px 0', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 2 }}>Notifications</div>
                <div style={{ fontSize: 12, color: '#6B7280' }}>Get notified for entries from group books</div>
              </div>
              <Toggle on={notifications} onChange={setNotifications} />
            </div>

            {/* Logout */}
            <div
              style={{ padding: '14px 0', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
              onClick={() => { logout(); navigate('/login'); }}
            >
              <LogOut size={16} color="#DC2626" />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#DC2626' }}>Logout</span>
            </div>

            {hasChanges && (
              <div style={{ marginTop: 20 }}>
                <button
                  onClick={handleSaveChangesClick}
                  disabled={isSaving}
                  style={{
                    width: '100%', padding: '12px', borderRadius: 8,
                    background: '#2563EB', color: 'white', fontWeight: 600,
                    border: 'none', cursor: 'pointer', opacity: isSaving ? 0.7 : 1
                  }}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>

          {/* Mobile App banner */}
        </div>
      </div>

      {/* OTP Modal */}
      {showOtpModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ background: 'white', padding: 24, borderRadius: 12, width: '90%', maxWidth: 400 }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 18, color: '#111827' }}>Verify Changes</h3>
            <p style={{ margin: '0 0 20px', fontSize: 14, color: '#6B7280' }}>
              Please enter the OTP sent to your new contact details to verify the changes.
            </p>

            {otpError && (
              <div style={{ color: '#DC2626', fontSize: 13, marginBottom: 16 }}>{otpError}</div>
            )}

            {draftProfile.mobile !== (user?.mobile || '') && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, color: '#374151', marginBottom: 6 }}>Mobile OTP</label>
                <input
                  type="text"
                  value={otpMobile}
                  onChange={e => setOtpMobile(e.target.value)}
                  placeholder="Enter SMS OTP"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #E5E7EB', fontSize: 14 }}
                />
              </div>
            )}

            {draftProfile.email !== (user?.email || '') && (
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, color: '#374151', marginBottom: 6 }}>Email OTP</label>
                <input
                  type="text"
                  value={otpEmail}
                  onChange={e => setOtpEmail(e.target.value)}
                  placeholder="Enter Email OTP"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #E5E7EB', fontSize: 14 }}
                />
              </div>
            )}

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setShowOtpModal(false)}
                style={{ flex: 1, padding: 12, borderRadius: 8, border: '1.5px solid #E5E7EB', background: 'white', color: '#374151', cursor: 'pointer', fontWeight: 500 }}
              >
                Cancel
              </button>
              <button
                onClick={saveProfileToBackend}
                disabled={isSaving}
                style={{ flex: 1, padding: 12, borderRadius: 8, border: 'none', background: '#2563EB', color: 'white', cursor: 'pointer', fontWeight: 500 }}
              >
                {isSaving ? 'Verifying...' : 'Verify & Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Email field with pencil ──────────────────────────── */
function EmailField({ value, onChange }) {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  return (
    <div
      onClick={() => !editing && setEditing(true)}
      style={{
        flex: 1, display: 'flex', alignItems: 'center', gap: 8,
        border: `1.5px solid ${editing ? '#2563EB' : '#E5E7EB'}`,
        borderRadius: 7, padding: '7px 10px', transition: 'border-color 150ms',
        cursor: editing ? 'default' : 'text'
      }}
    >
      {editing ? (
        <input
          ref={inputRef}
          type="email"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === 'Escape') setEditing(false); }}
          onBlur={() => setEditing(false)}
          placeholder="Enter your email"
          style={{ flex: 1, border: 'none', outline: 'none', fontSize: 13, color: '#111827', background: 'transparent' }}
        />
      ) : (
        <span style={{ flex: 1, fontSize: 13, color: value ? '#111827' : '#9CA3AF' }}>
          {value || 'Enter your email'}
        </span>
      )}
      <div
        style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}
      >
        <Pencil size={13} color={editing ? '#2563EB' : '#6B7280'} />
      </div>
    </div>
  );
}

/* ── Google G icon ────────────────────────────────────── */
function GoogleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}
