import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES, BUSINESS_TYPES, CATEGORY_ICONS, TYPE_ICONS } from '../constants/businessIcons';

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

export default function AddFirstBusinessPage() {
  const { businesses, addBusiness, loadingBiz, currentBusinessId } = useApp();
  const navigate = useNavigate();

  const [bizName, setBizName] = useState('');
  const [category, setCategory] = useState('');
  const [bizType, setBizType] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [catExpanded, setCatExpanded] = useState(false);
  const [typeExpanded, setTypeExpanded] = useState(false);

  useEffect(() => {
    if (loadingBiz) return;
    if (businesses.length > 0) {
      const bizId = currentBusinessId || businesses[0]?.id;
      navigate(`/businesses/${bizId}/cashbooks`, { replace: true });
    }
  }, [loadingBiz, businesses.length, currentBusinessId, navigate]);

  const handleCreate = async () => {
    if (saving) return;
    if (!bizName.trim()) {
      setError('Please enter your business name');
      return;
    }
    setSaving(true);
    try {
      const bizId = await addBusiness({
        name: bizName.trim(),
        category: category || null,
        businessType: bizType || null,
      });
      navigate(`/businesses/${bizId}/cashbooks`, { replace: true });
    } catch (err) {
      setError('Failed to create business: ' + err.message);
      setSaving(false);
    }
  };

  if (loadingBiz) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
        <div style={{ width: 36, height: 36, border: '3px solid #E5E7EB', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const Header = () => (
    <div style={{ height: 56, borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', padding: '0 24px', background: 'white' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 26, height: 26, borderRadius: 5, background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 13, fontWeight: 600 }}>C</div>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#1E3A8A' }}>CASHBOOK</span>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F9FAFB' }}>
      <Header />
      <div style={{ flex: 1, padding: '32px 24px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: 'white', borderRadius: 12, padding: '32px 40px', width: '100%', maxWidth: 1000, boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#111827', marginBottom: 28 }}>Add your first business</h2>

          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>
              Business Name <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <input
              autoFocus
              value={bizName}
              onChange={(e) => { setBizName(e.target.value); setError(''); }}
              placeholder="Add Business Name"
              style={{
                width: 320, padding: '10px 14px',
                border: '1px solid #2563EB', borderRadius: 6, fontSize: 14, outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          <div 
            style={{ border: '1px solid #E5E7EB', borderRadius: 6, marginBottom: 16, cursor: 'pointer' }}
          >
            <div 
              style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              onClick={() => { setCatExpanded(!catExpanded); setTypeExpanded(false); }}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 2 }}>Select Business Category</div>
                <div style={{ fontSize: 13, color: '#6B7280' }}>This will help us personalize your business</div>
              </div>
              {catExpanded ? <ChevronUp size={20} color="#6B7280" /> : <ChevronDown size={20} color="#6B7280" />}
            </div>
            {catExpanded && (
              <div style={{ padding: '0 20px 20px 20px', borderTop: '1px solid #E5E7EB', paddingTop: 20 }}>
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
              </div>
            )}
          </div>

          <div 
            style={{ border: '1px solid #E5E7EB', borderRadius: 6, marginBottom: 32, cursor: 'pointer' }}
          >
            <div 
              style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              onClick={() => { setTypeExpanded(!typeExpanded); setCatExpanded(false); }}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 2 }}>Select Business Type</div>
                <div style={{ fontSize: 13, color: '#6B7280' }}>This will help us personalize your business</div>
              </div>
              {typeExpanded ? <ChevronUp size={20} color="#6B7280" /> : <ChevronDown size={20} color="#6B7280" />}
            </div>
            {typeExpanded && (
              <div style={{ padding: '0 20px 20px 20px', borderTop: '1px solid #E5E7EB', paddingTop: 20 }}>
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
              </div>
            )}
          </div>

          {error && <p style={{ fontSize: 13, color: '#DC2626', marginBottom: 16, textAlign: 'right' }}>{error}</p>}

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={handleCreate}
              disabled={saving || !bizName.trim()}
              style={{
                padding: '12px 24px', borderRadius: 6, border: 'none',
                background: bizName.trim() && !saving ? '#6366F1' : '#A5B4FC',
                color: 'white', fontSize: 14, fontWeight: 500,
                cursor: bizName.trim() && !saving ? 'pointer' : 'not-allowed',
              }}
            >
              {saving ? 'Creating...' : 'Create Business'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
