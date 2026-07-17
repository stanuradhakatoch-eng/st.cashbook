import { useState, useRef, useEffect } from 'react';
import { Play, ChevronRight, ArrowLeft } from 'lucide-react';
import { useApp } from '../../context/AppContext';

/* ── Dashed connector line ─────────────────────────────── */
function DashedLine({ length = 40 }) {
  return (
    <svg width="4" height={length} style={{ margin: '0 auto', display: 'block' }}>
      <line x1="2" y1="0" x2="2" y2={length} stroke="#93C5FD" strokeWidth="3" strokeDasharray="0 8" strokeLinecap="round" />
    </svg>
  );
}

/* ── Flow nodes ────────────────────────────────────────── */
function AdminNode() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        background: '#3B82F6', overflow: 'hidden', position: 'relative',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(59,130,246,0.25)',
      }}>
         <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ position: 'absolute', bottom: -10 }}>
           <path d="M 32 40 C 32 15 68 15 68 40 L 68 45 C 68 25 32 25 32 45 Z" fill="#1E3A8A" />
           <circle cx="50" cy="40" r="18" fill="#FCA5A5" />
           <path d="M 25 90 C 25 60 75 60 75 90 Z" fill="#60A5FA" />
         </svg>
      </div>
      <span style={{ fontSize: 14, color: '#111827', fontWeight: 500, marginTop: 8 }}>Primary Admin</span>
    </div>
  );
}

function VirtualAccountNode() {
  return (
    <div style={{
      background: 'white', borderRadius: 6,
      padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 12,
      border: '4px solid #EFF6FF', minWidth: 200, justifyContent: 'center'
    }}>
      <div style={{ position: 'relative' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="#3B82F6">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
        <div style={{ position: 'absolute', bottom: -4, right: -4, background: 'white', borderRadius: '50%', padding: 2 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="#22C55E">
            <circle cx="12" cy="12" r="12" />
            <path d="M8 12h8m-4-4l4 4-4 4" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <span style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>Virtual Account</span>
    </div>
  );
}

function WalletNode({ label }) {
  return (
    <div style={{
      border: '4px solid #EFF6FF', borderRadius: 12,
      padding: '16px 12px', background: 'white',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, minWidth: 100,
    }}>
      <div style={{ position: 'relative' }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="#3B82F6">
          <path d="M20 4H4C2.89 4 2.01 4.89 2.01 6L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 8h-4v-2h4v2z" />
        </svg>
        <div style={{ position: 'absolute', bottom: 6, right: 0, background: 'white', borderRadius: 2, padding: 1 }}>
           <div style={{ width: 6, height: 6, background: '#22C55E', borderRadius: 1 }} />
        </div>
      </div>
      <span style={{ fontSize: 11, fontWeight: 500, color: '#111827', textAlign: 'center', lineHeight: 1.3 }}>
        {label}<br />Wallet
      </span>
    </div>
  );
}

function PhoneNode() {
  return (
    <div style={{ position: 'relative', width: 44, height: 60, marginTop: 4 }}>
      {/* Phone */}
      <div style={{
        width: 36, height: 56, background: '#475569', borderRadius: 4,
        position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
         <div style={{ width: 28, height: 42, background: 'white', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, padding: 4 }}>
               <div style={{ width: 8, height: 8, background: '#10B981' }} />
               <div style={{ width: 8, height: 8, background: '#10B981' }} />
               <div style={{ width: 8, height: 8, background: '#10B981' }} />
               <div style={{ width: 8, height: 8, background: '#10B981' }} />
            </div>
         </div>
      </div>
      {/* Hand */}
      <svg style={{ position: 'absolute', bottom: -12, right: -12, zIndex: 2 }} width="36" height="36" viewBox="0 0 24 24">
        <path d="M12 20v-6c0-1.5 1-2.5 2.5-2.5H19v9H12z" fill="#FCA5A5" />
        <path d="M14.5 20v6h6v-6" fill="#3B82F6" />
      </svg>
    </div>
  );
}

/* ── Mobile Verification step ──────────────────────────── */
function MobileVerification({ onBack, onSendOtp }) {
  const { user } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: user.mobile }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'OTP send karne mein problem'); return; }
      onSendOtp();
    } catch {
      setError('Server se connect nahi ho pa raha. Dobara try karein.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      padding: '40px 24px', minHeight: 'calc(100vh - 120px)',
    }}>
      <div style={{
        width: '100%', maxWidth: 560,
        border: '1px solid #E5E7EB', borderRadius: 12,
        background: 'white', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ padding: '28px 32px 20px', textAlign: 'center', borderBottom: '1px solid #F3F4F6' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 8 }}>
            <button
              onClick={onBack}
              style={{
                position: 'absolute', left: 32,
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#374151', display: 'flex', alignItems: 'center',
                fontSize: 18, padding: 0,
              }}
            >
              ←
            </button>
            <h2 style={{ fontSize: 18, fontWeight: 500, color: '#111827' }}>Mobile Number Verification</h2>
          </div>
          <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>For CashBook UPI Activation</p>
        </div>

        {/* Body */}
        <div style={{ padding: '28px 40px 36px' }}>
          <div style={{
            border: '1px solid #E5E7EB', borderRadius: 10,
            padding: '24px 20px', textAlign: 'center',
          }}>
            {/* Mobile number box */}
            <div style={{
              background: '#EEF2FF', borderRadius: 8,
              padding: '16px 20px', marginBottom: 16,
            }}>
              <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 6, fontWeight: 500 }}>
                Registered Mobile Number
              </div>
              <div style={{ fontSize: 16, fontWeight: 500, color: '#1E293B', letterSpacing: 0.5 }}>
                {user.mobile}
              </div>
            </div>

            {/* Info text */}
            <p style={{ fontSize: 13, color: '#374151', marginBottom: 20, lineHeight: 1.6 }}>
              We will send <strong>One Time Password</strong> on your<br />
              CashBook registered mobile number
            </p>

            {error && (
              <p style={{ fontSize: 12, color: '#EF4444', marginBottom: 12, background: '#FEF2F2', padding: '10px 14px', borderRadius: 8, border: '1px solid #FECACA' }}>
                {error}
              </p>
            )}

            {/* Send OTP button */}
            <button
              onClick={handleSend}
              disabled={loading}
              style={{
                width: '100%', padding: '13px',
                background: loading ? '#9CA3AF' : '#3D52D5', color: 'white',
                border: 'none', borderRadius: 8,
                fontSize: 14, fontWeight: 500,
                cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: 0.3,
                transition: 'background 200ms',
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#2563EB'; }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = '#3D52D5'; }}
            >
              {loading ? 'Sending…' : 'Send OTP'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── OTP Entry step ────────────────────────────────────── */
function OtpVerification({ onBack, onVerify }) {
  const { user } = useApp();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (timer > 0) {
      const t = setTimeout(() => setTimer((v) => v - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [timer]);

  const handleChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    setError('');
    if (val && i < 5) inputRefs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) {
      inputRefs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) {
      setOtp(pasted.split('').concat(Array(6).fill('')).slice(0, 6));
      inputRefs.current[Math.min(pasted.length, 5)]?.focus();
    }
    e.preventDefault();
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) { setError('Please enter the 6-digit OTP'); return; }
    setVerifying(true);
    setError('');
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: user.mobile, otp: code }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'OTP galat hai'); setVerifying(false); return; }
      onVerify();
    } catch {
      setError('Server se connect nahi ho pa raha. Dobara try karein.');
      setVerifying(false);
    }
  };

  const filled = otp.every((d) => d !== '');

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      padding: '40px 24px', minHeight: 'calc(100vh - 120px)',
    }}>
      <div style={{
        width: '100%', maxWidth: 560,
        border: '1px solid #E5E7EB', borderRadius: 12,
        background: 'white', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ padding: '28px 32px 20px', textAlign: 'center', borderBottom: '1px solid #F3F4F6', position: 'relative' }}>
          <button
            onClick={onBack}
            style={{
              position: 'absolute', left: 28, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#374151', display: 'flex', alignItems: 'center', fontSize: 18, padding: 0,
            }}
          >
            ←
          </button>
          <h2 style={{ fontSize: 18, fontWeight: 500, color: '#111827', marginBottom: 6 }}>Enter OTP</h2>
          <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>For CashBook UPI Activation</p>
        </div>

        {/* Body */}
        <div style={{ padding: '28px 40px 36px' }}>
          <div style={{
            border: '1px solid #E5E7EB', borderRadius: 10,
            padding: '28px 24px', textAlign: 'center',
          }}>
            <p style={{ fontSize: 13, color: '#374151', marginBottom: 20, lineHeight: 1.6 }}>
              OTP sent to <strong>{user.mobile}</strong>
            </p>

            {/* 6-digit OTP boxes */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 20 }}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (inputRefs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  onPaste={handlePaste}
                  style={{
                    width: 48, height: 52,
                    textAlign: 'center', fontSize: 20, fontWeight: 500,
                    border: error ? '2px solid #EF4444' : digit ? '2px solid #2563EB' : '1.5px solid #D1D5DB',
                    borderRadius: 8, outline: 'none',
                    background: digit ? '#EFF6FF' : 'white',
                    color: '#111827',
                    transition: 'border-color 150ms',
                  }}
                />
              ))}
            </div>

            {error && (
              <p style={{ fontSize: 12, color: '#EF4444', marginBottom: 12 }}>{error}</p>
            )}

            {/* Resend timer */}
            <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 20 }}>
              {timer > 0
                ? <>Resend OTP in <strong style={{ color: '#374151' }}>00:{String(timer).padStart(2, '0')}</strong></>
                : <span
                    style={{ color: '#2563EB', cursor: 'pointer', fontWeight: 600 }}
                    onClick={async () => {
                      setTimer(30);
                      setError('');
                      try {
                        await fetch('/api/auth/send-otp', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ mobile: user.mobile }),
                        });
                      } catch { /* silent — timer already reset */ }
                    }}
                  >Resend OTP</span>
              }
            </p>

            {/* Verify button */}
            <button
              onClick={handleVerify}
              disabled={!filled || verifying}
              style={{
                width: '100%', padding: '13px',
                background: filled && !verifying ? '#3D52D5' : '#9CA3AF',
                color: 'white', border: 'none', borderRadius: 8,
                fontSize: 14, fontWeight: 500,
                cursor: filled && !verifying ? 'pointer' : 'not-allowed',
                transition: 'background 200ms',
              }}
              onMouseEnter={(e) => { if (filled && !verifying) e.currentTarget.style.background = '#2563EB'; }}
              onMouseLeave={(e) => { if (filled && !verifying) e.currentTarget.style.background = '#3D52D5'; }}
            >
              {verifying ? 'Verifying…' : 'Verify OTP'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Activation Success step ───────────────────────────── */
function ActivationSuccess({ onDone }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      padding: '40px 24px',
    }}>
      <div style={{
        width: '100%', maxWidth: 560,
        border: '1px solid #E5E7EB', borderRadius: 12,
        background: 'white', padding: '48px 40px',
        textAlign: 'center',
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: '#DCFCE7', margin: '0 auto 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path d="M20 6L9 17l-5-5" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 500, color: '#111827', marginBottom: 8 }}>Activation Initiated!</h2>
        <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 28, lineHeight: 1.6 }}>
          Your CashBook UPI activation request has been submitted.<br />
          Our team will verify and activate your account within 24 hours.
        </p>
        <button
          onClick={onDone}
          style={{
            padding: '12px 32px', background: '#3D52D5', color: 'white',
            border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer',
          }}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

/* ── Main Dashboard ────────────────────────────────────── */
export default function PaymentsDashboard() {
  const { currentBusiness } = useApp();
  const [step, setStep] = useState('dashboard'); // dashboard | verify | otp | success

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes slideUpFade {
        0% { transform: translateY(40px); opacity: 0; }
        100% { transform: translateY(0); opacity: 1; }
      }
      .animate-diagram {
        animation: slideUpFade 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); }
  }, []);

  /* ── Verification / OTP screens ── */
  if (step === 'verify') {
    return (
      <div style={{ background: 'white', minHeight: '100%' }}>
        <div style={{ padding: '20px 24px 0', borderBottom: '1px solid #E5E7EB' }}>
          <h1 style={{ fontSize: 20, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 16 }}>
            Payments
            <span style={{ fontSize: 13, fontWeight: 400, color: '#6B7280', background: '#F3F4F6', padding: '2px 8px', borderRadius: 4 }}>
              ({currentBusiness?.name})
            </span>
          </h1>
        </div>
        <MobileVerification onBack={() => setStep('dashboard')} onSendOtp={() => setStep('otp')} />
      </div>
    );
  }

  if (step === 'otp') {
    return (
      <div style={{ background: 'white', minHeight: '100%' }}>
        <div style={{ padding: '20px 24px 0', borderBottom: '1px solid #E5E7EB' }}>
          <h1 style={{ fontSize: 20, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 16 }}>
            Payments
            <span style={{ fontSize: 13, fontWeight: 400, color: '#6B7280', background: '#F3F4F6', padding: '2px 8px', borderRadius: 4 }}>
              ({currentBusiness?.name})
            </span>
          </h1>
        </div>
        <OtpVerification onBack={() => setStep('verify')} onVerify={() => setStep('success')} />
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div style={{ background: 'white', minHeight: '100%' }}>
        <div style={{ padding: '20px 24px 0', borderBottom: '1px solid #E5E7EB' }}>
          <h1 style={{ fontSize: 20, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 16 }}>
            Payments
            <span style={{ fontSize: 13, fontWeight: 400, color: '#6B7280', background: '#F3F4F6', padding: '2px 8px', borderRadius: 4 }}>
              ({currentBusiness?.name})
            </span>
          </h1>
        </div>
        <ActivationSuccess onDone={() => setStep('dashboard')} />
      </div>
    );
  }

  /* ── Main dashboard view ── */
  return (
    <div style={{ padding: '20px 24px', background: 'white', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Page header */}
      <div style={{ paddingBottom: 16, marginBottom: 20, borderBottom: '1px solid #E5E7EB' }}>
        <h1 style={{ fontSize: 20, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
          Payments
          <span style={{ fontSize: 13, fontWeight: 400, color: '#6B7280', background: '#F3F4F6', padding: '2px 8px', borderRadius: 4 }}>
            ({currentBusiness?.name})
          </span>
        </h1>
      </div>

      {/* Two-column grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, flex: 1, padding: '20px 0' }}>

        {/* ── LEFT PANEL ── */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Heading */}
          <h2 style={{ fontSize: 24, fontWeight: 500, lineHeight: 1.4, marginBottom: 24, color: '#111827' }}>
            Manage Business Expenses with{' '}
            <span style={{ color: '#0D9488' }}>CashBook UPI</span>
            <svg fill="none" viewBox="0 0 12 13" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block', marginLeft: 8, width: 20, height: 20, verticalAlign: 'middle' }}>
              <path d="M7.21627 0.5L10.2337 6.50081L3.89062 12.5L7.21627 0.5Z" fill="#26803B"></path>
              <path d="M5.10012 0.5L8.11517 6.50081L1.76953 12.5L5.10012 0.5Z" fill="#E9661C"></path>
            </svg>
          </h2>

          <div style={{ border: '1px solid #E5E7EB', borderRadius: 12, padding: '32px', background: 'white', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: 24 }}>
            {/* Phone + features */}
            <div style={{ display: 'flex', gap: 24, alignItems: 'center', marginBottom: 24 }}>
              {/* Phone mockup */}
              <div style={{
                width: 140, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 130,
              }}>
                <div>
                  <div style={{
                    width: 80, height: 130, background: '#1E293B', borderRadius: 12,
                    display: 'flex', flexDirection: 'column', overflow: 'hidden',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                  }}>
                    <div style={{
                      flex: 1, background: 'white', margin: '6px 4px 4px',
                      borderRadius: 8, display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center', padding: 4,
                    }}>
                      <div style={{ fontSize: 8, fontWeight: 600, color: '#2563EB', letterSpacing: 1, marginBottom: 4 }}>UPI</div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,6px)', gap: 1, marginBottom: 6 }}>
                        {Array.from({ length: 25 }).map((_, i) => (
                          <div key={i} style={{
                            width: 6, height: 6, borderRadius: 1,
                            background: [0,1,5,6,10,14,15,16,17,18,19,20,24,3,4,9,8,23,22].includes(i) ? '#1E293B' : '#F3F4F6',
                          }} />
                        ))}
                      </div>
                      <div style={{ fontSize: 7, color: '#6B7280', fontWeight: 600 }}>Scan & Pay</div>
                    </div>
                    <div style={{ height: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', paddingBottom: 4 }}>
                      <div style={{ width: 24, height: 2, background: '#475569', borderRadius: 2 }} />
                    </div>
                  </div>
                  <div style={{ width: 50, height: 8, background: '#374151', margin: '0 auto', borderRadius: '0 0 6px 6px' }} />
                </div>
              </div>

              {/* Features */}
              <div style={{ flex: 1 }}>
                {[
                  { bg: '#DBEAFE', text: 'Recharge Employee Wallets', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="2" y="6" width="20" height="14" rx="2" stroke="#2563EB" strokeWidth="1.8" fill="none"/><path d="M16 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" fill="#2563EB"/><path d="M2 10h20" stroke="#2563EB" strokeWidth="1.8"/><path d="M12 3v3M10 4l2-1 2 1" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round"/></svg> },
                  { bg: '#DCFCE7', text: 'Get notified of every expense', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="#16A34A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/><path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="#16A34A" strokeWidth="1.8" strokeLinecap="round"/></svg> },
                  { bg: '#CCFBF1', text: 'Set limits on wallets', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#0D9488" strokeWidth="1.8" fill="none"/><path d="M12 8v4l3 3" stroke="#0D9488" strokeWidth="1.8" strokeLinecap="round"/></svg> },
                ].map(({ bg, text, icon }) => (
                  <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</div>
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing */}
            <div>
              <p style={{ fontSize: 13, color: '#374151', marginBottom: 4 }}>
                UPI Wallets at{' '}
                <span style={{ textDecoration: 'line-through', color: '#9CA3AF' }}>₹4,788.00</span>
                {' '}<strong style={{ color: '#111827', fontSize: 14 }}>₹3,499.00</strong>
                {' '}<span style={{ color: '#6B7280' }}>per wallet per year plus GST.</span>
              </p>
              <p style={{ fontSize: 13, color: '#0D9488', fontWeight: 600 }}>
                Bulk Buying Offer: Buy in bulk to save up to 47%.
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20 }}>
            <button style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '12px 24px', border: '1px solid #D1D5DB',
              borderRadius: 8, background: 'white',
              fontSize: 14, fontWeight: 600, color: '#3D52D5', cursor: 'pointer',
            }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
            >
              <Play size={16} fill="currentColor" />
              Watch 1-min Video
            </button>
            <button
              onClick={() => setStep('verify')}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '12px 24px', background: '#3D52D5', color: 'white',
                border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500,
                cursor: 'pointer', boxShadow: '0 2px 8px rgba(61,82,213,0.3)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#2563EB'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#3D52D5'}
            >
              Activate Payments
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Note */}
          <p style={{ fontSize: 13, color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#9CA3AF" strokeWidth="1.8"/>
              <path d="M12 8v4M12 16h.01" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            You can enable CashBook UPI in only 1 business
          </p>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 10 }}>
          <h3 style={{ fontSize: 20, fontWeight: 500, textAlign: 'center', marginBottom: 40, color: '#111827' }}>
            How does CashBook UPI work?
          </h3>
          <div className="animate-diagram" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, width: '100%' }}>
            <AdminNode />
            <DashedLine length={28} />
            <VirtualAccountNode />

            {/* Three-way split */}
            <svg width="80%" height="40" style={{ marginTop: 4, overflow: 'visible' }}>
              <line x1="50%" y1="0" x2="50%" y2="20" stroke="#93C5FD" strokeWidth="3" strokeDasharray="0 8" strokeLinecap="round" />
              <line x1="15%" y1="20" x2="85%" y2="20" stroke="#93C5FD" strokeWidth="3" strokeDasharray="0 8" strokeLinecap="round" />
              <line x1="15%" y1="20" x2="15%" y2="40" stroke="#93C5FD" strokeWidth="3" strokeDasharray="0 8" strokeLinecap="round" />
              <line x1="50%" y1="20" x2="50%" y2="40" stroke="#93C5FD" strokeWidth="3" strokeDasharray="0 8" strokeLinecap="round" />
              <line x1="85%" y1="20" x2="85%" y2="40" stroke="#93C5FD" strokeWidth="3" strokeDasharray="0 8" strokeLinecap="round" />
            </svg>

            <div style={{ display: 'flex', width: '80%', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 4 }}>
              {['Employee A', 'Employee B', 'Employee C'].map((name) => (
                <WalletNode key={name} label={name} />
              ))}
            </div>

            <div style={{ display: 'flex', width: '80%', justifyContent: 'space-between', marginTop: 0 }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 100 }}>
                  <DashedLine length={22} />
                  <PhoneNode />
                </div>
              ))}
            </div>

            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 8, fontWeight: 500 }}>Powered By:</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                {[
                  { label: 'UPI', color: '#F97316', bg: '#FFF7ED' },
                  { label: 'NPCI', color: '#2563EB', bg: '#EFF6FF' },
                  { label: 'OBOPAY', color: '#7C3AED', bg: '#F5F3FF' },
                ].map(({ label, color, bg }) => (
                  <div key={label} style={{ padding: '4px 12px', background: bg, border: `1px solid ${color}30`, borderRadius: 6, fontSize: 11, fontWeight: 600, color, letterSpacing: 0.5 }}>
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
