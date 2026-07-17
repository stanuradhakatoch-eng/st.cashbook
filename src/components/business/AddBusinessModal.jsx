import { useState } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { CATEGORIES, BUSINESS_TYPES as TYPES, CATEGORY_ICONS, TYPE_ICONS } from '../../constants/businessIcons';

/* ── Selection Card ──────────────────────────────────────── */
function SelectCard({ label, icon, selected, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 14px', borderRadius: 8, cursor: 'pointer',
        border: `1.5px solid ${selected ? '#2563EB' : hover ? '#93C5FD' : '#E5E7EB'}`,
        background: selected ? '#EFF6FF' : hover ? '#F8FAFF' : 'white',
        transition: 'all 150ms',
        userSelect: 'none',
      }}
    >
      {icon}
      <span style={{ fontSize: 14, fontWeight: 500, color: selected ? '#1D4ED8' : '#374151', textAlign: 'left' }}>{label}</span>
    </div>
  );
}

/* ── Accordion Section ───────────────────────────────────── */
function AccordionSection({ title, subtitle, open, onToggle, children }) {
  return (
    <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, overflow: 'hidden' }}>
      <div
        onClick={onToggle}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', cursor: 'pointer', background: 'white',
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
      >
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{title}</div>
          <div style={{ fontSize: 12, color: open ? '#2563EB' : '#6B7280', marginTop: 2 }}>{subtitle}</div>
        </div>
        {open ? <ChevronUp size={18} color="#6B7280" /> : <ChevronDown size={18} color="#6B7280" />}
      </div>
      {open && (
        <div style={{ padding: '4px 16px 16px', borderTop: '1px solid #F3F4F6' }}>
          {children}
        </div>
      )}
    </div>
  );
}

/* ── Main Modal ──────────────────────────────────────────── */
export default function AddBusinessModal({ onClose, onAdd }) {
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState(false);
  const [category, setCategory] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [catOpen, setCatOpen] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) { setNameError(true); return; }
    if (creating) return;
    setCreating(true);
    try {
      await onAdd({ name: name.trim(), category, businessType });
      onClose();
    } catch (err) {
      alert('Failed to create business: ' + err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.35)',
          zIndex: 400,
        }}
      />

      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: 620, maxWidth: '100vw',
        background: 'white',
        zIndex: 500,
        display: 'flex', flexDirection: 'column',
        boxShadow: '-4px 0 40px rgba(0,0,0,0.15)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 28px',
          borderBottom: '1px solid #E5E7EB',
          flexShrink: 0,
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 500, color: '#111827' }}>Add New Business</h2>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 6,
              border: 'none', background: 'none',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#6B7280',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#F3F4F6'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Business Name */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: nameError ? '#DC2626' : '#374151', display: 'block', marginBottom: 6 }}>
              Business Name <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <input
              autoFocus
              value={name}
              onChange={(e) => { setName(e.target.value); setNameError(false); }}
              placeholder="Add Business Name"
              style={{
                width: '100%', padding: '11px 14px',
                border: nameError ? '1.5px solid #DC2626' : '1px solid #D1D5DB',
                borderRadius: 8, fontSize: 14, outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 150ms',
              }}
              onFocus={(e) => { if (!nameError) e.target.style.borderColor = '#2563EB'; }}
              onBlur={(e) => { if (!nameError) e.target.style.borderColor = '#D1D5DB'; }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }}
            />
            {nameError && <p style={{ fontSize: 12, color: '#DC2626', marginTop: 4 }}>Business name is required</p>}
          </div>

          {/* Category Accordion */}
          <AccordionSection
            title="Select Business Category"
            subtitle="This will help us personalize your business"
            open={catOpen}
            onToggle={() => setCatOpen((v) => !v)}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, paddingTop: 12 }}>
              {CATEGORIES.map((c) => (
                <SelectCard
                  key={c}
                  label={c}
                  icon={CATEGORY_ICONS[c]}
                  selected={category === c}
                  onClick={() => setCategory(category === c ? '' : c)}
                />
              ))}
            </div>
          </AccordionSection>

          {/* Type Accordion */}
          <AccordionSection
            title="Select Business Type"
            subtitle="This will help us personalize your business"
            open={typeOpen}
            onToggle={() => setTypeOpen((v) => !v)}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, paddingTop: 12 }}>
              {TYPES.map((t) => (
                <SelectCard
                  key={t}
                  label={t}
                  icon={TYPE_ICONS[t]}
                  selected={businessType === t}
                  onClick={() => setBusinessType(businessType === t ? '' : t)}
                />
              ))}
            </div>
          </AccordionSection>
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 28px',
          borderTop: '1px solid #E5E7EB',
          display: 'flex', justifyContent: 'flex-end',
          flexShrink: 0,
        }}>
          <button
            onClick={handleCreate}
            disabled={creating}
            style={{
              padding: '11px 28px',
              background: creating ? '#9CA3AF' : '#3D52D5',
              color: 'white', border: 'none', borderRadius: 8,
              fontSize: 14, fontWeight: 500, cursor: creating ? 'not-allowed' : 'pointer',
              transition: 'background 200ms',
            }}
            onMouseEnter={(e) => { if (!creating) e.currentTarget.style.background = '#2563EB'; }}
            onMouseLeave={(e) => { if (!creating) e.currentTarget.style.background = '#3D52D5'; }}
          >
            {creating ? 'Creating…' : 'Create Business'}
          </button>
        </div>
      </div>
    </>
  );
}
