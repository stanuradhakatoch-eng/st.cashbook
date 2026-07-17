import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Smartphone, ArrowRight, ShieldCheck, CheckCircle2, QrCode, TrendingUp, SmartphoneNfc } from 'lucide-react';

/* ── Injecting Global Styles & Keyframes ── */
const styles = `
  @keyframes slideUpFade {
    0% { opacity: 0; transform: translateY(15px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
  }
  @keyframes pulseSoft {
    0%, 100% { transform: scale(1); opacity: 0.8; }
    50% { transform: scale(1.05); opacity: 1; }
  }
  .animate-slideUpFade {
    animation: slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  .input-transition {
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .input-focus-ring:focus {
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
    border-color: #3b82f6;
  }
  .btn-hover {
    transition: all 0.2s ease;
  }
  .btn-hover:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
  }
  .btn-hover:active:not(:disabled) {
    transform: translateY(0);
  }
  .glass-card {
    background: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255,255,255,0.8);
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.04);
  }
`;

/* ── Left panel slides data ──────────────────────────────── */
const SLIDES = [
  {
    icon: <SmartphoneNfc size={40} className="text-blue-600" />,
    title: 'UPI wallets for employees',
    desc: 'Add your team on CashBook and issue digital UPI wallets for all business expenses with built-in controls.',
  },
  {
    icon: <QrCode size={40} className="text-blue-600" />,
    title: 'Spend via UPI & track',
    desc: 'Scan & pay any UPI QR. You get real-time visibility and control, eliminating manual reconciliation.',
  },
  {
    icon: <TrendingUp size={40} className="text-blue-600" />,
    title: 'Instant expense reports',
    desc: 'Download detailed reports with receipts automatically attached. No more chasing bills at month end.',
  },
  {
    icon: <ShieldCheck size={40} className="text-blue-600" />,
    title: 'Set spending limits & controls',
    desc: 'Control how much each employee spends, pause wallets anytime from your dashboard with bank-grade security.',
  },
];

/* ── Abstract Art for Slides ─────────────────────────────── */
function SlideVisual({ slideIndex }) {
  return (
    <div style={{ position: 'relative', width: 280, height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Decorative Blobs */}
      <div style={{
        position: 'absolute', top: '10%', left: '10%', width: 140, height: 140,
        background: 'linear-gradient(135deg, #60A5FA, #3B82F6)', borderRadius: '50%',
        filter: 'blur(40px)', opacity: 0.4, animation: 'float 6s infinite ease-in-out'
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', right: '10%', width: 160, height: 160,
        background: 'linear-gradient(135deg, #A78BFA, #8B5CF6)', borderRadius: '50%',
        filter: 'blur(50px)', opacity: 0.3, animation: 'float 8s infinite ease-in-out reverse'
      }} />
      
      {/* Central Glass Element */}
      <div className="glass-card" style={{
        width: 180, height: 180, borderRadius: 24,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        position: 'relative', zIndex: 10, animation: 'float 4s infinite ease-in-out'
      }}>
        <div style={{ padding: 20, background: 'rgba(255,255,255,0.8)', borderRadius: 20, boxShadow: '0 8px 32px rgba(0,0,0,0.05)' }}>
           {SLIDES[slideIndex].icon}
        </div>
      </div>
    </div>
  );
}

/* ── Toast notification ───────────────────────────────── */
function Toast({ message, onHide }) {
  useEffect(() => {
    const t = setTimeout(onHide, 3500);
    return () => clearTimeout(t);
  }, [onHide]);

  return (
    <div style={{
      position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
      background: '#0F172A', color: 'white',
      padding: '14px 24px', borderRadius: 100,
      display: 'flex', alignItems: 'center', gap: 12,
      fontSize: 14, fontWeight: 500, zIndex: 999,
      boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
      animation: 'slideUpFade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
    }}>
      <CheckCircle2 size={18} color="#22C55E" />
      {message}
    </div>
  );
}

/* ── Main Login Page ──────────────────────────────────── */
export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const [slide, setSlide] = useState(0);
  const [step, setStep] = useState('input'); // input | otp
  const [identifier, setIdentifier] = useState(''); // email or mobile
  const [identifierMode, setIdentifierMode] = useState('email');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [timer, setTimer] = useState(0);
  const otpRef = useRef(null);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) navigate('/onboarding', { replace: true });
  }, [isAuthenticated, navigate]);

  // Auto-advance slides
  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);

  // OTP countdown timer
  useEffect(() => {
    if (timer <= 0) return;
    const t = setTimeout(() => setTimer((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  const getPayload = () => {
    const trimmed = identifier.trim();
    if (trimmed.includes('@') || /[a-zA-Z]/.test(trimmed)) {
      return { email: trimmed };
    }
    return { mobile: trimmed };
  };

  const handleSendOtp = async () => {
    setError('');
    const trimmed = identifier.trim();
    if (!trimmed) { setError('Please enter your email or mobile number.'); return; }
    
    setLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(getPayload()),
      });
      let data;
      try { data = await res.json(); } catch { throw new Error('Server connection failed. Please try again.'); }
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');

      setStep('otp');
      setTimer(30);
      setToast(data.message || `OTP sent to ${trimmed}`);
      setTimeout(() => otpRef.current?.focus(), 150);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError('');
    if (otp.length < 6) { setError('Please enter a valid 6-digit OTP'); return; }
    setLoading(true);
    try {
      const payload = { ...getPayload(), otp };
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      let data;
      try { data = await res.json(); } catch { throw new Error('Server connection failed. Please try again.'); }
      if (!res.ok) throw new Error(data.error || 'OTP verification failed');

      login(data.user);
      navigate('/onboarding', { replace: true });
    } catch (err) {
      setError(err.message);
      setOtp('');
      setTimeout(() => otpRef.current?.focus(), 50);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setOtp('');
    setError('');
    await handleSendOtp();
  };

  const currentSlide = SLIDES[slide];
  const canSend = identifier.trim().length >= 5;
  const isEmailInput = identifierMode === 'email';

  return (
    <>
      <style>{styles}</style>
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', backgroundColor: '#F8FAFC' }}>

        {/* ── LEFT PANEL (Branding & Features) ── */}
        <div style={{
          width: '45%', minWidth: 400,
          background: 'linear-gradient(135deg, #F0Fdf4 0%, #E0E7FF 50%, #EDE9FE 100%)',
          display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between', padding: '48px',
          position: 'relative', overflow: 'hidden',
          borderRight: '1px solid rgba(255,255,255,0.4)'
        }}>
          {/* Logo */}
          <div className="animate-slideUpFade" style={{ display: 'flex', alignItems: 'center', gap: 12, zIndex: 10 }}>
            <div style={{ 
              width: 36, height: 36, borderRadius: 10, 
              background: 'linear-gradient(135deg, #2563EB, #1D4ED8)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              color: 'white', fontSize: 18, fontWeight: 600,
              boxShadow: '0 4px 12px rgba(37,99,235,0.3)'
            }}>C</div>
            <span style={{ fontSize: 20, fontWeight: 600, color: '#1E3A8A', letterSpacing: '0.15em' }}>CASHBOOK</span>
          </div>

          {/* Slide Visual */}
          <div className="animate-slideUpFade" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', animationDelay: '0.1s' }}>
            <SlideVisual slideIndex={slide} />
          </div>

          {/* Slide Text & Navigation */}
          <div className="glass-card animate-slideUpFade" style={{ padding: '32px', borderRadius: '24px', animationDelay: '0.2s', zIndex: 10 }}>
            <div style={{ minHeight: 90 }}>
              <h3 style={{ fontSize: 22, fontWeight: 500, color: '#0F172A', marginBottom: 12, letterSpacing: '-0.01em' }}>
                {currentSlide.title}
              </h3>
              <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.6 }}>
                {currentSlide.desc}
              </p>
            </div>

            {/* Pagination Dots */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 24 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                {SLIDES.map((_, i) => (
                  <div
                    key={i}
                    onClick={() => setSlide(i)}
                    style={{
                      width: i === slide ? 24 : 8, height: 8,
                      borderRadius: 4, cursor: 'pointer',
                      background: i === slide ? '#2563EB' : 'rgba(37, 99, 235, 0.2)',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL (Auth Form) ── */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '40px 24px', background: '#FFFFFF', overflowY: 'auto',
          position: 'relative'
        }}>
          
          <div className="animate-slideUpFade" style={{ width: '100%', maxWidth: 420, animationDelay: '0.1s' }}>
            {/* Header */}
            <div style={{ marginBottom: 36 }}>
              <h1 style={{ fontSize: 32, fontWeight: 600, color: '#0F172A', marginBottom: 8, letterSpacing: '-0.03em' }}>
                Welcome to CashBook
              </h1>
              <p style={{ fontSize: 16, color: '#64748B' }}>
                Sign in or register to manage your business expenses seamlessly.
              </p>
            </div>

            {/* Form card */}
            <div style={{ 
              background: '#FFFFFF', 
              borderRadius: 20, 
              padding: '0', 
            }}>
              {step === 'input' ? (
                <>
                  {/* Switcher */}
                  <div style={{
                    display: 'flex',
                    background: '#F1F5F9',
                    borderRadius: 12,
                    padding: 4,
                    marginBottom: 24,
                    position: 'relative',
                  }}>
                    {/* Sliding Background */}
                    <div style={{
                      position: 'absolute',
                      top: 4,
                      bottom: 4,
                      left: isEmailInput ? '50%' : 4,
                      width: 'calc(50% - 4px)',
                      background: '#FFFFFF',
                      borderRadius: 10,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      zIndex: 1
                    }} />
                    
                    <button
                      onClick={() => { setIdentifier(''); setError(''); setIdentifierMode('mobile'); }}
                      style={{
                        flex: 1,
                        padding: '10px 0',
                        border: 'none',
                        background: 'transparent',
                        fontSize: 14,
                        fontWeight: 600,
                        color: !isEmailInput ? '#0F172A' : '#64748B',
                        cursor: 'pointer',
                        zIndex: 2,
                        transition: 'color 0.3s'
                      }}
                    >
                      Mobile
                    </button>
                    <button
                      onClick={() => { setIdentifier(''); setError(''); setIdentifierMode('email'); }}
                      style={{
                        flex: 1,
                        padding: '10px 0',
                        border: 'none',
                        background: 'transparent',
                        fontSize: 14,
                        fontWeight: 600,
                        color: isEmailInput ? '#0F172A' : '#64748B',
                        cursor: 'pointer',
                        zIndex: 2,
                        transition: 'color 0.3s'
                      }}
                    >
                      Email
                    </button>
                  </div>

                  {/* Email / Mobile input */}
                  <div style={{ marginBottom: 24 }}>
                    <label style={{ fontSize: 14, fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                      {isEmailInput ? 'Email Address' : 'Mobile Number'}
                    </label>
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}>
                        {isEmailInput ? <Mail size={18} /> : <Smartphone size={18} />}
                      </div>
                      <input
                        type={isEmailInput ? "email" : "tel"}
                        value={identifier}
                        onChange={(e) => { 
                          const val = e.target.value;
                          if (!isEmailInput) {
                            setIdentifier(val.replace(/\D/g, '').slice(0, 10));
                          } else {
                            setIdentifier(val);
                          }
                          setError(''); 
                        }}
                        onKeyDown={(e) => { if (e.key === 'Enter' && canSend) handleSendOtp(); }}
                        placeholder={isEmailInput ? "name@company.com" : "e.g. 9876543210"}
                        className="input-transition input-focus-ring"
                        autoFocus
                        style={{
                          width: '100%', padding: '14px 14px 14px 42px',
                          border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC',
                          borderRadius: 12, fontSize: 15, outline: 'none',
                          boxSizing: 'border-box', color: '#0F172A', fontWeight: 500
                        }}
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="animate-slideUpFade" style={{ padding: '10px 14px', background: '#FEF2F2', borderRadius: 8, border: '1px solid #FECACA', marginBottom: 20 }}>
                      <p style={{ fontSize: 13, color: '#EF4444', fontWeight: 500, margin: 0 }}>{error}</p>
                    </div>
                  )}

                  {/* Send OTP button */}
                  <button
                    onClick={handleSendOtp}
                    disabled={!canSend || loading}
                    className="btn-hover"
                    style={{
                      width: '100%', padding: '16px',
                      background: canSend && !loading ? '#1E40AF' : '#E2E8F0',
                      color: canSend && !loading ? 'white' : '#94A3B8',
                      border: 'none', borderRadius: 12,
                      fontSize: 16, fontWeight: 600,
                      cursor: canSend && !loading ? 'pointer' : 'not-allowed',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                    }}
                  >
                    {loading ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                        Sending OTP...
                      </span>
                    ) : (
                      <>Continue <ArrowRight size={18} /></>
                    )}
                  </button>
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </>
              ) : (
                /* OTP Entry step */
                <div className="animate-slideUpFade">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                    <button
                      onClick={() => { setStep('input'); setOtp(''); setError(''); }}
                      style={{ 
                        background: '#F1F5F9', border: 'none', cursor: 'pointer', 
                        width: 36, height: 36, borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#475569', transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => { e.currentTarget.style.background = '#E2E8F0'; e.currentTarget.style.color = '#0F172A'; }}
                      onMouseOut={(e) => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.color = '#475569'; }}
                    >←</button>
                    <span style={{ fontSize: 18, fontWeight: 500, color: '#0F172A' }}>Verification</span>
                  </div>

                  <p style={{ fontSize: 14, color: '#64748B', marginBottom: 24, lineHeight: 1.5 }}>
                    Enter the 6-digit code sent to <br/>
                    <strong style={{ color: '#0F172A' }}>{identifier}</strong>
                  </p>

                  {/* OTP single input */}
                  <div style={{ marginBottom: 20 }}>
                    <input
                      ref={otpRef}
                      type="text"
                      inputMode="numeric"
                      value={otp}
                      onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }}
                      onKeyDown={(e) => { if (e.key === 'Enter' && otp.length === 6) handleVerifyOtp(); }}
                      placeholder="• • • • • •"
                      className="input-transition input-focus-ring"
                      maxLength={6}
                      style={{
                        width: '100%', padding: '16px',
                        border: `1px solid ${error ? '#EF4444' : '#E2E8F0'}`, backgroundColor: '#F8FAFC',
                        borderRadius: 12, fontSize: 24, fontWeight: 500,
                        outline: 'none', letterSpacing: '0.4em',
                        boxSizing: 'border-box', textAlign: 'center', color: '#0F172A'
                      }}
                    />
                  </div>

                  {error && (
                    <div className="animate-slideUpFade" style={{ padding: '10px 14px', background: '#FEF2F2', borderRadius: 8, border: '1px solid #FECACA', marginBottom: 20 }}>
                      <p style={{ fontSize: 13, color: '#EF4444', fontWeight: 500, margin: 0 }}>{error}</p>
                    </div>
                  )}

                  {/* Verify button */}
                  <button
                    onClick={handleVerifyOtp}
                    disabled={otp.length < 6 || loading}
                    className="btn-hover"
                    style={{
                      width: '100%', padding: '16px',
                      background: otp.length === 6 && !loading ? '#1E40AF' : '#E2E8F0',
                      color: otp.length === 6 && !loading ? 'white' : '#94A3B8',
                      border: 'none', borderRadius: 12,
                      fontSize: 16, fontWeight: 600,
                      cursor: otp.length === 6 && !loading ? 'pointer' : 'not-allowed',
                      marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                  >
                    {loading ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                        Verifying...
                      </span>
                    ) : 'Verify & Continue'}
                  </button>

                  {/* Resend */}
                  <div style={{ textAlign: 'center' }}>
                    {timer > 0 ? (
                      <span style={{ fontSize: 14, color: '#64748B', fontWeight: 500 }}>
                        Resend code in <strong style={{ color: '#1E40AF' }}>00:{String(timer).padStart(2, '0')}</strong>
                      </span>
                    ) : (
                      <button
                        onClick={handleResend}
                        style={{ 
                          background: 'none', border: 'none', color: '#2563EB', 
                          fontSize: 14, fontWeight: 600, cursor: 'pointer',
                          padding: '4px 8px', borderRadius: 6
                        }}
                      >
                        Resend Code
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Terms (input step) */}
            {step === 'input' && (
              <div className="animate-slideUpFade" style={{ marginTop: 32, animationDelay: '0.2s' }}>
                <p style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center', lineHeight: 1.6 }}>
                  By continuing, you agree to our{' '}
                  <a href="#" style={{ color: '#64748B', fontWeight: 500, textDecoration: 'underline' }}>Terms of Service</a> and{' '}
                  <a href="#" style={{ color: '#64748B', fontWeight: 500, textDecoration: 'underline' }}>Privacy Policy</a>.
                </p>
              </div>
            )}

            {/* Footer link */}
            <div className="animate-slideUpFade" style={{ marginTop: 'auto', paddingTop: 40, animationDelay: '0.3s' }}>
              <p style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center' }}>
                Secure, reliable, and built for businesses. <br/>
                <a href="https://cashbook.in" target="_blank" rel="noreferrer" style={{ color: '#3B82F6', fontWeight: 600, textDecoration: 'none', marginTop: 4, display: 'inline-block' }}>
                  Learn more at cashbook.in →
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && <Toast message={toast} onHide={() => setToast('')} />}
    </>
  );
}

