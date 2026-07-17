import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppDownloadButtons from '../components/shared/AppDownloadButtons';

const COMPANY_LOGOS = ['REGO', 'ROASTERY', 'rocket', 'RodBez', 'RUNGTA', 'SPACEZ', 'SS RAIL'];

const NAV_LINKS = ['Home', 'Security', 'Pricing', 'Book-Keeping', 'Integrations', 'Resources'];

export default function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <div style={{ fontFamily: 'var(--font)', background: 'white', minHeight: '100vh' }}>
      {/* ── Navbar ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'white',
        borderBottom: scrolled ? '1px solid #E5E7EB' : 'none',
        boxShadow: scrolled ? '0 1px 8px rgba(0,0,0,0.06)' : 'none',
        padding: '0 40px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        transition: 'box-shadow 200ms',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <div style={{
            width: 30, height: 30, borderRadius: 7,
            background: '#2563EB', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: 14, fontWeight: 600,
          }}>C</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#111827', lineHeight: 1 }}>CASHBOOK</div>
            <div style={{ fontSize: 8, color: '#7C3AED', fontWeight: 500, letterSpacing: 1 }}>OBOPAY ✦</div>
          </div>
        </div>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          {NAV_LINKS.map((link, i) => (
            <span key={link} style={{
              fontSize: 14, fontWeight: i === 0 ? 600 : 400,
              color: i === 0 ? '#2563EB' : '#374151',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 4,
            }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#2563EB'}
              onMouseLeave={(e) => e.currentTarget.style.color = i === 0 ? '#2563EB' : '#374151'}
            >
              {link}
              {link === 'Resources' && <span style={{ fontSize: 10 }}>▼</span>}
            </span>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate('/login')}
          style={{
            padding: '10px 20px', borderRadius: 24,
            background: '#111827', color: 'white',
            border: 'none', fontSize: 14, fontWeight: 600,
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#1F2937'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#111827'}
        >
          Login/Register
        </button>
      </nav>

      {/* ── Hero Section ── */}
      <section style={{
        maxWidth: 1200, margin: '0 auto',
        padding: '60px 40px 40px',
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: 40, alignItems: 'center', minHeight: 'calc(100vh - 64px - 100px)',
      }}>
        {/* Left */}
        <div>
          {/* Badges */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
            {[
              { prefix: 'UPI', suffix: 'Based Expense Management' },
              { prefix: 'NPCI', suffix: 'Certified UPI Wallets' },
            ].map(({ prefix, suffix }) => (
              <div key={suffix} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 14px', border: '1px solid #E5E7EB',
                borderRadius: 20, fontSize: 12, color: '#374151',
              }}>
                <span style={{ fontWeight: 600, color: '#F97316', fontSize: 11 }}>{prefix}▶</span>
                {suffix}
              </div>
            ))}
          </div>

          {/* Headline */}
          <h1 style={{ fontSize: 52, fontWeight: 600, lineHeight: 1.15, marginBottom: 20, color: '#111827' }}>
            UPI Wallets for<br />
            <span style={{ color: '#2563EB' }}>Business Expenses</span>
          </h1>

          <p style={{ fontSize: 16, color: '#6B7280', marginBottom: 36, lineHeight: 1.6 }}>
            Issue UPI-powered digital wallets for employees, set limits<br />and control spend.
          </p>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 14, marginBottom: 32 }}>
            <button
              onClick={() => navigate('/login')}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '13px 24px', borderRadius: 30,
                background: '#111827', color: 'white',
                border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#1F2937'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#111827'}
            >
              <span>📅</span> Book A Demo
            </button>
            <button style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '13px 24px', borderRadius: 30,
              background: 'white', color: '#111827',
              border: '1.5px solid #D1D5DB', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#F9FAFB'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; }}
            >
              <span>▶️</span> Watch Video
            </button>
          </div>

          {/* Trust badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', border: '1px solid #E5E7EB',
            borderRadius: 20, fontSize: 13, color: '#374151',
          }}>
            ✓ Trusted by <strong>3,500+</strong> Businesses
          </div>
        </div>

        {/* Right — Phone Mockup */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{
            width: 240, height: 480,
            background: '#0F172A', borderRadius: 36,
            padding: '12px 8px',
            boxShadow: '0 24px 60px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.1)',
            position: 'relative',
          }}>
            {/* Notch */}
            <div style={{
              width: 80, height: 20, background: '#0F172A',
              borderRadius: 10, margin: '0 auto 4px',
              border: '1px solid #1E293B', position: 'relative', zIndex: 2,
            }} />
            {/* Screen */}
            <div style={{
              background: 'white', borderRadius: 24,
              height: 'calc(100% - 28px)', overflow: 'hidden',
              display: 'flex', flexDirection: 'column',
            }}>
              {/* App header */}
              <div style={{ padding: '10px 14px 6px', background: 'white', borderBottom: '1px solid #F3F4F6' }}>
                <div style={{ fontSize: 8, fontWeight: 500, color: '#2563EB', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 14, height: 14, background: '#2563EB', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 8, fontWeight: 600 }}>C</div>
                  CASHBOOK UPI
                </div>
              </div>
              {/* Payment success */}
              <div style={{ padding: '12px', flex: 1 }}>
                <div style={{
                  background: '#16A34A', borderRadius: 10, padding: '12px',
                  textAlign: 'center', color: 'white', marginBottom: 10,
                }}>
                  <div style={{ fontSize: 16, fontWeight: 600 }}>₹550 ●</div>
                  <div style={{ fontSize: 8, opacity: 0.85, marginTop: 2 }}>Paid Successfully</div>
                  <div style={{ fontSize: 7, opacity: 0.7, marginTop: 1 }}>14-04-2025 at 11:23 AM</div>
                </div>
                {/* Details */}
                {[
                  { label: 'Paid To', value: 'Vikram Hotel', sub: '● vikramhotel@upi' },
                  { label: 'From', value: 'Mango Traders', sub: '● https://mango.upi...' },
                ].map(({ label, value, sub }) => (
                  <div key={label} style={{ marginBottom: 8, padding: '6px 8px', background: '#F9FAFB', borderRadius: 6 }}>
                    <div style={{ fontSize: 7, color: '#9CA3AF', marginBottom: 2 }}>{label}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7 }}>V</div>
                      <div>
                        <div style={{ fontSize: 8, fontWeight: 600 }}>{value}</div>
                        <div style={{ fontSize: 7, color: '#9CA3AF' }}>{sub}</div>
                      </div>
                    </div>
                  </div>
                ))}
                <div style={{ fontSize: 8, color: '#2563EB', textAlign: 'center', cursor: 'pointer', marginBottom: 8 }}>View More Details ›</div>
                {/* Attachment */}
                <div style={{ padding: '6px 8px', background: '#F9FAFB', borderRadius: 6, marginBottom: 6 }}>
                  <div style={{ fontSize: 7, color: '#9CA3AF', marginBottom: 4 }}>Attachment</div>
                  <div style={{ width: 20, height: 20, border: '1px dashed #D1D5DB', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>+</div>
                </div>
                {/* Category */}
                <div style={{ padding: '6px 8px', background: '#F9FAFB', borderRadius: 6, marginBottom: 10 }}>
                  <div style={{ fontSize: 7, color: '#9CA3AF', marginBottom: 2 }}>Category</div>
                  <div style={{ fontSize: 8, fontWeight: 600 }}>Travel</div>
                </div>
                {/* Done button */}
                <button style={{ width: '100%', padding: '8px', background: '#2563EB', color: 'white', border: 'none', borderRadius: 8, fontSize: 9, fontWeight: 500, cursor: 'pointer' }}>
                  DONE
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Company Logos ── */}
      <section style={{
        borderTop: '1px solid #F3F4F6', padding: '28px 40px',
        background: '#FAFAFA',
      }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto',
          display: 'flex', alignItems: 'center', gap: 40,
          overflowX: 'auto',
        }}>
          {COMPANY_LOGOS.map((logo) => (
            <div key={logo} style={{
              fontSize: logo === 'RodBez' ? 18 : 14,
              fontWeight: logo === 'RodBez' ? 900 : 700,
              color: '#9CA3AF', whiteSpace: 'nowrap', flexShrink: 0,
              letterSpacing: logo === 'rocket' ? 1 : 0,
            }}>
              {logo === 'ROASTERY' ? (
                <span>R<span style={{ fontStyle: 'italic' }}>O</span>ASTERY<br /><span style={{ fontSize: 9, fontWeight: 400 }}>Coffee House</span></span>
              ) : logo === 'RodBez' ? (
                <span>Rod<span style={{ color: '#FBBF24' }}>Bez</span></span>
              ) : logo === 'RUNGTA' ? (
                <span style={{ color: '#DC2626', fontSize: 12 }}>● RUNGTA<br /><span style={{ fontSize: 9, fontWeight: 400 }}>UNIVERSITY</span></span>
              ) : logo}
            </div>
          ))}
        </div>
      </section>

      {/* ── Get the app ── */}
      <section style={{ padding: '48px 40px 64px', background: 'white' }}>
        <div style={{
          maxWidth: 760, margin: '0 auto',
          background: 'linear-gradient(135deg, #4F63E0 0%, #3D52D5 100%)',
          borderRadius: 16, padding: '32px 28px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
          boxShadow: '0 12px 40px rgba(61,82,213,0.25)',
        }}>
          <div style={{ fontSize: 13, color: '#BAC4FF', marginBottom: 6, fontWeight: 600 }}>
            Manage expenses on the go
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: 'white', margin: '0 0 8px' }}>
            Get the CashBook Mobile App
          </h2>
          <p style={{ fontSize: 14, color: '#E0E7FF', margin: '0 0 22px', lineHeight: 1.6, maxWidth: 460 }}>
            Offline support, book sharing and automatic data backup — download for Android or iOS.
          </p>
          <div style={{ width: '100%', maxWidth: 360 }}>
            <AppDownloadButtons variant="onBlue" />
          </div>
        </div>
      </section>
    </div>
  );
}
