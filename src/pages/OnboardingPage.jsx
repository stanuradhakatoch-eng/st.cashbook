import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES, BUSINESS_TYPES, CATEGORY_ICONS, TYPE_ICONS } from '../constants/businessIcons';

/* ─── Category / Type card ──────────────────────────────────── */
function SelectCard({ label, icon, selected, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '14px 18px', borderRadius: 8, cursor: 'pointer',
        border: `1.5px solid ${selected ? '#2563EB' : hover ? '#93C5FD' : '#E5E7EB'}`,
        background: selected ? '#EFF6FF' : hover ? '#F8FAFF' : 'white',
        position: 'relative', transition: 'all 0.12s',
      }}
    >
      {icon}
      <span style={{ fontSize: 14, fontWeight: 500, color: selected ? '#1D4ED8' : '#111827', textAlign: 'left' }}>{label}</span>
      {selected && (
        <div style={{
          position: 'absolute', top: 6, right: 6,
          width: 16, height: 16, borderRadius: '50%', background: '#2563EB',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
            <path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}
    </div>
  );
}

/* ─── Main Onboarding Page ──────────────────────────────────── */
export default function OnboardingPage() {
  const { businesses, addBusiness, loadingBiz, currentBusinessId } = useApp();
  const { updateUser, token, user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(null); // null=loading, 'done', 'details', 'category', 'type'
  const [fullName, setFullName] = useState(user?.name || '');
  const [bizName, setBizName] = useState('');
  const [category, setCategory] = useState('');
  const [bizType, setBizType] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // After AppContext loads, decide which step to show
  useEffect(() => {
    if (loadingBiz) return;
    if (businesses.length > 0) {
      const bizId = currentBusinessId || businesses[0]?.id;
      navigate(`/businesses/${bizId}/cashbooks`, { replace: true });
    } else {
      setStep('details');
    }
  }, [loadingBiz, businesses.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const goToDashboard = () => {
    const bizId = currentBusinessId || businesses[0]?.id;
    if (bizId) navigate(`/businesses/${bizId}/cashbooks`, { replace: true });
  };

  const handleGetStarted = () => {
    setError('');
    if (!fullName.trim()) { setError('Please enter your full name'); return; }
    if (!bizName.trim()) { setError('Please enter your business name'); return; }
    setStep('category');
  };

  const handleCategorySelect = (cat) => {
    setCategory(cat);
    setStep('type');
  };

  const handleCategorySkip = () => {
    setCategory('');
    setStep('type');
  };

  const handleFinish = async (skipType = false) => {
    if (saving) return;
    setSaving(true);
    try {
      // Save full name to user profile
      if (fullName.trim()) {
        updateUser({ name: fullName.trim() });
        fetch('/api/auth/me', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ name: fullName.trim() }),
        }).catch(() => {});
      }

      const bizId = await addBusiness({
        name: bizName.trim(),
        category: category || null,
        businessType: skipType ? null : (bizType || null),
      });
      navigate(`/businesses/${bizId}/cashbooks`, { replace: true });
    } catch (err) {
      setError('Failed to create business: ' + err.message);
      setSaving(false);
    }
  };

  // Loading
  if (step === null || loadingBiz) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
        <div style={{ width: 36, height: 36, border: '3px solid #E5E7EB', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <span style={{ fontSize: 13, color: '#6B7280' }}>Loading…</span>
      </div>
    );
  }

  /* ── Shared header ── */
  const Header = ({ showBack, onBack }) => (
    <div style={{ height: 56, borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', padding: '0 24px', background: 'white' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 26, height: 26, borderRadius: 5, background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 13, fontWeight: 600 }}>C</div>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#1E3A8A' }}>CASHBOOK</span>
      </div>
    </div>
  );

  /* ── Already done ── */
  if (step === 'done') {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#F9FAFB' }}>
        <Header />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', borderRadius: 12, padding: '32px 40px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', textAlign: 'center', minWidth: 340 }}>
            <CheckCircle size={40} color="#16A34A" style={{ marginBottom: 12 }} />
            <div style={{ fontSize: 16, fontWeight: 500, color: '#111827', marginBottom: 20 }}>
              You cashbook profile is already completed
            </div>
            <button
              onClick={goToDashboard}
              style={{
                width: '100%', padding: '12px', borderRadius: 8, border: 'none',
                background: '#2563EB', color: 'white', fontSize: 14, fontWeight: 500, cursor: 'pointer',
              }}
            >
              Visit Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Step 1: Name + Business ── */
  if (step === 'details') {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#F3F4F6' }}>
        <Header />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ background: 'white', borderRadius: 12, padding: '36px 40px', width: '100%', maxWidth: 460, boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
            <h2 style={{ fontSize: 22, fontWeight: 600, color: '#111827', marginBottom: 6 }}>Welcome to CashBook</h2>
            <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 28 }}>Please fill the below details</p>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
                Your Full Name <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input
                autoFocus
                value={fullName}
                onChange={(e) => { setFullName(e.target.value); setError(''); }}
                placeholder="Your Full Name"
                onKeyDown={(e) => { if (e.key === 'Enter') handleGetStarted(); }}
                style={{
                  width: '100%', padding: '10px 14px',
                  border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box',
                }}
                onFocus={(e) => e.target.style.borderColor = '#2563EB'}
                onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
                Business Name <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input
                value={bizName}
                onChange={(e) => { setBizName(e.target.value); setError(''); }}
                placeholder="Business Name"
                onKeyDown={(e) => { if (e.key === 'Enter') handleGetStarted(); }}
                style={{
                  width: '100%', padding: '10px 14px',
                  border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box',
                }}
                onFocus={(e) => e.target.style.borderColor = '#2563EB'}
                onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
              />
            </div>

            {error && <p style={{ fontSize: 12, color: '#DC2626', marginBottom: 12 }}>{error}</p>}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={handleGetStarted}
                disabled={!fullName.trim() || !bizName.trim()}
                style={{
                  padding: '11px 32px', borderRadius: 8, border: 'none',
                  background: fullName.trim() && bizName.trim() ? '#2563EB' : '#D1D5DB',
                  color: fullName.trim() && bizName.trim() ? 'white' : '#9CA3AF',
                  fontSize: 14, fontWeight: 500,
                  cursor: fullName.trim() && bizName.trim() ? 'pointer' : 'not-allowed',
                }}
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Step 2: Business Category ── */
  if (step === 'category') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F9FAFB' }}>
        <Header />
        <div style={{ flex: 1, padding: '32px 40px', maxWidth: 1100, margin: '0 auto', width: '100%' }}>
          {/* Title row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                onClick={() => setStep('details')}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 8, border: '1.5px solid #E5E7EB', background: 'white', cursor: 'pointer' }}
              >
                <ArrowLeft size={16} color="#374151" />
              </button>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 600, color: '#111827', display: 'flex', alignItems: 'center', gap: 8 }}>
                  Select Business Category
                  {bizName && <span style={{ fontSize: 13, fontWeight: 500, color: '#6B7280' }}>({bizName})</span>}
                </h2>
                <p style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>This will help us personalize your app experience</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: '#6B7280' }}>Business Setup:</span>
              <span style={{ padding: '4px 12px', borderRadius: 20, border: '1.5px solid #E5E7EB', background: 'white', fontSize: 12, fontWeight: 500, color: '#374151' }}>Step 1/2</span>
            </div>
          </div>

          {/* Category grid */}
          <div style={{ background: 'white', borderRadius: 12, padding: '24px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {CATEGORIES.map((c) => (
                <SelectCard
                  key={c}
                  label={c}
                  icon={CATEGORY_ICONS[c]}
                  selected={category === c}
                  onClick={() => setCategory(c)}
                />
              ))}
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24, paddingTop: 16, borderTop: '1px solid #F3F4F6' }}>
              <button
                onClick={handleCategorySkip}
                style={{ padding: '10px 24px', border: 'none', background: 'none', fontSize: 14, fontWeight: 600, color: '#2563EB', cursor: 'pointer' }}
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Step 3: Business Type ── */
  if (step === 'type') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F9FAFB' }}>
        <Header />
        <div style={{ flex: 1, padding: '32px 40px', maxWidth: 1100, margin: '0 auto', width: '100%' }}>
          {/* Title row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                onClick={() => setStep('category')}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 8, border: '1.5px solid #E5E7EB', background: 'white', cursor: 'pointer' }}
              >
                <ArrowLeft size={16} color="#374151" />
              </button>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 600, color: '#111827', display: 'flex', alignItems: 'center', gap: 8 }}>
                  Select Business Type
                  {(category || bizName) && <span style={{ fontSize: 13, fontWeight: 500, color: '#6B7280' }}>({category || bizName})</span>}
                </h2>
                <p style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>This will help us personalize your app experience</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: '#6B7280' }}>Business Setup:</span>
              <span style={{ padding: '4px 12px', borderRadius: 20, border: '1.5px solid #E5E7EB', background: 'white', fontSize: 12, fontWeight: 500, color: '#374151' }}>Step 2/2</span>
            </div>
          </div>

          {/* Type grid */}
          <div style={{ background: 'white', borderRadius: 12, padding: '24px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {BUSINESS_TYPES.map((t) => (
                <SelectCard
                  key={t}
                  label={t}
                  icon={TYPE_ICONS[t]}
                  selected={bizType === t}
                  onClick={() => setBizType(t)}
                />
              ))}
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12, marginTop: 24, paddingTop: 16, borderTop: '1px solid #F3F4F6' }}>
              <button
                onClick={() => handleFinish(true)}
                disabled={saving}
                style={{ padding: '10px 24px', border: 'none', background: 'none', fontSize: 14, fontWeight: 600, color: '#2563EB', cursor: 'pointer' }}
              >
                Skip
              </button>
              <button
                onClick={() => handleFinish(false)}
                disabled={saving || !bizType}
                style={{
                  padding: '11px 32px', borderRadius: 8, border: 'none',
                  background: bizType && !saving ? '#2563EB' : '#D1D5DB',
                  color: bizType && !saving ? 'white' : '#9CA3AF',
                  fontSize: 14, fontWeight: 500,
                  cursor: bizType && !saving ? 'pointer' : 'not-allowed',
                }}
              >
                {saving ? 'Creating…' : 'Next'}
              </button>
            </div>
            {error && <p style={{ fontSize: 12, color: '#DC2626', marginTop: 8, textAlign: 'center' }}>{error}</p>}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
