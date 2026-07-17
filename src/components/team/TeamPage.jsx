import { useState, useEffect, useRef } from 'react';
import { ChevronRight, Plus, Download, Search, X, Info, Table2, CheckCircle2, XCircle } from 'lucide-react';
import RolesPermissionsPanel from '../shared/RolesPermissionsPanel';
import { useApp } from '../../context/AppContext';
import { api } from '../../api';

/* ─── Badge configs ─────────────────────────────────────────── */
const ROLE_BADGE = {
  'Primary Admin': { bg: '#DCFCE7', color: '#15803D' },
  'Admin':         { bg: '#EDE9FE', color: '#6D28D9' },
  'Manager':       { bg: '#FEF9C3', color: '#854D0E' },
  'Employee':      { bg: '#DBEAFE', color: '#1D4ED8' },
  'Staff':         { bg: '#F3F4F6', color: '#374151' },
};

const WALLET_BADGE = {
  'Not Issued':  { bg: '#F3F4F6', color: '#6B7280' },
  'Issued':      { bg: '#DBEAFE', color: '#1D4ED8' },
  'Pending KYC': { bg: '#FEF9C3', color: '#854D0E' },
  'Paused':      { bg: '#FEF9C3', color: '#854D0E' },
  'Active':      { bg: '#DCFCE7', color: '#15803D' },
  'Inactive':    { bg: '#FEE2E2', color: '#DC2626' },
  'Deactivated': { bg: '#F3F4F6', color: '#6B7280' },
};

function RoleBadge({ role }) {
  const c = ROLE_BADGE[role] || { bg: '#F3F4F6', color: '#374151' };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: c.bg, color: c.color, whiteSpace: 'nowrap' }}>
      {role}
    </span>
  );
}

function WalletBadge({ status }) {
  const c = WALLET_BADGE[status] || WALLET_BADGE['Not Issued'];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: c.bg, color: c.color, whiteSpace: 'nowrap' }}>
      {status || 'Not Issued'}
    </span>
  );
}

/* ─── Filter dropdown ───────────────────────────────────────── */
function FilterDropdown({ options, multiSelect, value, onChange, onClose }) {
  const [search, setSearch] = useState('');
  const displayed = options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()));

  const toggle = (val) => {
    if (multiSelect) {
      const arr = Array.isArray(value) ? value : [];
      onChange(arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]);
    } else {
      onChange(value === val ? null : val);
    }
  };

  const isSelected = (val) => multiSelect ? (Array.isArray(value) && value.includes(val)) : value === val;

  return (
    <div onMouseDown={e => e.stopPropagation()} style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, background: 'white', border: '1px solid var(--gray-200)', borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 300, minWidth: 220, overflow: 'hidden' }}>
      <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--gray-100)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, border: '1.5px solid var(--blue)', borderRadius: 6, padding: '5px 9px' }}>
          <input autoFocus value={search} onChange={e => setSearch(e.target.value)} placeholder="Search"
            style={{ border: 'none', outline: 'none', flex: 1, fontSize: 13 }} />
          <Search size={13} color="var(--blue)" />
        </div>
      </div>
      <div style={{ maxHeight: 220, overflowY: 'auto' }}>
        {displayed.map(opt => {
          const sel = isSelected(opt.value);
          return (
            <div key={opt.value} onClick={() => toggle(opt.value)}
              style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px', cursor: 'pointer', background: sel ? '#F0F5FF' : 'transparent' }}
              onMouseEnter={e => { if (!sel) e.currentTarget.style.background = '#F5F7FF'; }}
              onMouseLeave={e => { e.currentTarget.style.background = sel ? '#F0F5FF' : 'transparent'; }}
            >
              {multiSelect ? (
                <div style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${sel ? 'var(--blue)' : 'var(--gray-300)'}`, background: sel ? 'var(--blue)' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                  {sel && <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5l2.5 2.5L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
              ) : (
                <div style={{ width: 16, height: 16, borderRadius: '50%', border: `${sel ? 5 : 1.5}px solid ${sel ? 'var(--blue)' : 'var(--gray-300)'}`, background: 'white', flexShrink: 0, marginTop: 2, boxSizing: 'border-box' }} />
              )}
              <div>
                <div style={{ fontSize: 13, color: '#111827', lineHeight: 1.4 }}>{opt.label}</div>
                {opt.sublabel && <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 1 }}>{opt.sublabel}</div>}
              </div>
            </div>
          );
        })}
        {displayed.length === 0 && <div style={{ padding: '12px 14px', fontSize: 13, color: 'var(--gray-400)', textAlign: 'center' }}>No results</div>}
      </div>
      <div style={{ display: 'flex', justifyContent: multiSelect ? 'space-between' : 'flex-end', padding: '8px 14px', borderTop: '1px solid var(--gray-100)' }}>
        <button onClick={() => onChange(multiSelect ? [] : null)} style={{ fontSize: 13, color: 'var(--gray-500)', border: 'none', background: 'none', cursor: 'pointer', padding: '2px 0' }}>Clear</button>
        {multiSelect && <button onClick={onClose} style={{ fontSize: 13, color: 'var(--blue)', fontWeight: 600, border: 'none', background: 'none', cursor: 'pointer', padding: '2px 0' }}>Done</button>}
      </div>
    </div>
  );
}

/* ─── Add Filter menu ───────────────────────────────────────── */
function AddFilterMenu({ available, onAdd, onClose }) {
  const [search, setSearch] = useState('');
  const filtered = available.filter(f => f.label.toLowerCase().includes(search.toLowerCase()));
  return (
    <div onMouseDown={e => e.stopPropagation()} style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, background: 'white', border: '1px solid var(--gray-200)', borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 300, width: 210, overflow: 'hidden' }}>
      <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--gray-100)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, border: '1.5px solid var(--blue)', borderRadius: 6, padding: '5px 9px' }}>
          <input autoFocus value={search} onChange={e => setSearch(e.target.value)} placeholder="Search filter"
            style={{ border: 'none', outline: 'none', flex: 1, fontSize: 13 }} />
          <Search size={13} color="var(--blue)" />
        </div>
      </div>
      {filtered.map(f => (
        <div key={f.key} onClick={() => onAdd(f.key)}
          style={{ padding: '10px 14px', cursor: 'pointer', fontSize: 13, color: '#111827' }}
          onMouseEnter={e => e.currentTarget.style.background = '#F0F5FF'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >{f.label}</div>
      ))}
      {filtered.length === 0 && <div style={{ padding: '10px 14px', fontSize: 13, color: 'var(--gray-400)' }}>No filters</div>}
    </div>
  );
}

/* ─── Add New Member modal (step 1 + step 2) ────────────────── */
function AddTeamMemberPanel({ onClose, onInvite }) {
  /* ── Step 1 state ── */
  const [step, setStep]               = useState(1);
  const [mode, setMode]               = useState('email'); // 'email' | 'mobile'
  const [email, setEmail]             = useState('');
  const [mobile, setMobile]           = useState('');
  const [name, setName]               = useState('');
  const [userId, setUserId]           = useState(null);
  const [lookupState, setLookupState] = useState('idle'); // 'idle'|'checking'|'found'|'notfound'
  const debounceRef = useRef(null);

  /* ── Step 2 state ── */
  const [selectedRole, setSelectedRole] = useState('Employee');
  const [empId, setEmpId]               = useState('');
  const [empIdOpen, setEmpIdOpen]       = useState(false);

  const isValidEmail   = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const mobileDigits   = mobile.replace(/\D/g, '').slice(-10);
  const isValidMobile  = mobileDigits.length === 10;
  const fullMobile     = mobileDigits ? `+91${mobileDigits}` : '';
  const identifier     = mode === 'email' ? email.trim() : fullMobile;
  const canNext        = (mode === 'email' ? isValidEmail : isValidMobile) && name.trim().length > 0;
  const isExistingUser = lookupState === 'found';
  const [submitError, setSubmitError] = useState(null);

  const handleEmailChange = (val) => {
    setEmail(val);
    setUserId(null);
    setName('');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const trimmed = val.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) { setLookupState('idle'); return; }
    setLookupState('checking');
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await api.users.lookupByEmail(trimmed);
        if (data.found) { setName(data.user.name || ''); setUserId(data.user.id); setLookupState('found'); }
        else             { setLookupState('notfound'); }
      } catch { setLookupState('notfound'); }
    }, 600);
  };

  const handleMobileChange = (val) => {
    setMobile(val);
    setUserId(null);
    setName('');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const digits = val.replace(/\D/g, '').slice(-10);
    if (digits.length !== 10) { setLookupState('idle'); return; }
    setLookupState('checking');
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await api.users.lookupByMobile(`+91${digits}`);
        if (data.found) { setName(data.user.name || ''); setUserId(data.user.id); setLookupState('found'); }
        else             { setLookupState('notfound'); }
      } catch { setLookupState('notfound'); }
    }, 600);
  };

  const switchMode = (m) => {
    if (m === mode) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setMode(m);
    setEmail(''); setMobile(''); setName(''); setUserId(null); setLookupState('idle');
  };

  const handleFinish = async () => {
    setSubmitError(null);
    try {
      await onInvite({
        name: name.trim(),
        email: mode === 'email' ? email.trim() : null,
        mobile: mode === 'mobile' ? fullMobile : null,
        role: selectedRole,
        user_id: userId,
        employee_id: empId || null,
      });
      onClose();
    } catch (err) {
      setSubmitError(err.message || 'Failed to add member');
    }
  };

  /* Avatar */
  const initial      = (name.trim() || identifier || '?').charAt(0).toUpperCase();
  const AVATAR_BG    = ['#DBEAFE','#DCF3EB','#EDE9FE','#FEF3C7','#FCE7F3'];
  const AVATAR_TEXT  = ['#1D4ED8','#15803D','#6D28D9','#854D0E','#9D174D'];
  const colorIdx     = (initial.charCodeAt(0) || 0) % AVATAR_BG.length;

  /* Role permissions for step 2 */
  const ROLE_PERMISSIONS = {
    'Employee': {
      permissions: [
        'Limited access to selected books',
        'Primary Admin/Admin can assign Book Admin, Viewer or Operator role to Employee in any book',
        'Can leave business from business settings',
      ],
      restrictions: [
        'No access to books they are not part of',
        'No option to delete books',
        "Can't view employee details",
      ],
    },
    'Admin': {
      permissions: ['Full access to all books', 'Can manage team members', 'Can view and edit all settings'],
      restrictions: ['Cannot delete business'],
    },
  };
  const perms = ROLE_PERMISSIONS[selectedRole] || ROLE_PERMISSIONS['Employee'];

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 400 }} />

      {/* Centered modal */}
      <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500, padding: 16 }}>
        <div style={{ width: '100%', maxWidth: 480, background: '#fff', borderRadius: 14, boxShadow: '0 20px 60px rgba(0,0,0,0.18)', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>

          {step === 1 ? (
            /* ════════════ STEP 1 ════════════ */
            <>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 18px', flexShrink: 0 }}>
                <span style={{ fontSize: 17, fontWeight: 500, color: '#111827' }}>Add New Member</span>
                <button onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, border: 'none', background: 'none', cursor: 'pointer', color: '#6B7280', fontSize: 20, lineHeight: 1, borderRadius: 4 }}>×</button>
              </div>

              {/* Body */}
              <div style={{ padding: '4px 24px 24px', overflowY: 'auto', flex: 1 }}>
                {/* Email / Mobile toggle */}
                <div style={{ display: 'flex', background: '#F3F4F6', borderRadius: 8, padding: 3, marginBottom: 16 }}>
                  {[{ k: 'email', label: 'Email' }, { k: 'mobile', label: 'Mobile' }].map(({ k, label }) => (
                    <button key={k} onClick={() => switchMode(k)}
                      style={{ flex: 1, padding: '8px 0', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: mode === k ? 600 : 500,
                        background: mode === k ? '#2563EB' : 'transparent', color: mode === k ? '#fff' : '#6B7280', transition: 'all 150ms' }}>
                      {label}
                    </button>
                  ))}
                </div>

                {/* Email card */}
                {mode === 'email' && (
                <div style={{ border: `1px solid ${lookupState === 'found' ? '#22C55E' : 'var(--gray-200)'}`, borderRadius: 10, padding: '16px', marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 10 }}>
                    Enter Email Address <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input autoFocus type="email" value={email}
                      onChange={e => handleEmailChange(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && canNext) setStep(2); }}
                      placeholder="e.g. member@gmail.com"
                      style={{ width: '100%', boxSizing: 'border-box', padding: '10px 36px 10px 12px', border: `1px solid ${lookupState === 'found' ? '#22C55E' : 'var(--gray-200)'}`, borderRadius: 7, fontSize: 14, color: '#111827', outline: 'none', background: '#fff', transition: 'border-color 150ms' }}
                    />
                    {lookupState === 'checking' && (
                      <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" style={{ animation: 'spin 0.8s linear infinite', display: 'block' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                      </div>
                    )}
                    {lookupState === 'found' && (
                      <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 18, height: 18, borderRadius: '50%', background: '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                    )}
                  </div>
                  {lookupState === 'checking' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: 12, color: '#6B7280' }}>
                      <span>Checking if user exists...</span>
                    </div>
                  )}
                  {lookupState === 'found' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: 12, color: '#16A34A', fontWeight: 500 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      CashBook user found! Name auto-filled.
                    </div>
                  )}
                </div>
                )}

                {/* Mobile card */}
                {mode === 'mobile' && (
                <div style={{ border: `1px solid ${lookupState === 'found' ? '#22C55E' : 'var(--gray-200)'}`, borderRadius: 10, padding: '16px', marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 10 }}>
                    Enter Mobile Number <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0 12px', border: '1px solid var(--gray-200)', borderRadius: 7, fontSize: 14, color: '#374151', background: '#fff', flexShrink: 0 }}>
                      🇮🇳 +91
                    </div>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <input autoFocus type="tel" value={mobile}
                        onChange={e => handleMobileChange(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && canNext) setStep(2); }}
                        placeholder="e.g. 8772321230"
                        style={{ width: '100%', boxSizing: 'border-box', padding: '10px 36px 10px 12px', border: `1px solid ${lookupState === 'found' ? '#22C55E' : 'var(--gray-200)'}`, borderRadius: 7, fontSize: 14, color: '#111827', outline: 'none', background: '#fff', transition: 'border-color 150ms' }}
                      />
                      {lookupState === 'checking' && (
                        <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" style={{ animation: 'spin 0.8s linear infinite', display: 'block' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                        </div>
                      )}
                      {lookupState === 'found' && (
                        <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 18, height: 18, borderRadius: '50%', background: '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </div>
                      )}
                    </div>
                  </div>
                  {lookupState === 'checking' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: 12, color: '#6B7280' }}>
                      <span>Checking if user exists...</span>
                    </div>
                  )}
                  {lookupState === 'found' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: 12, color: '#16A34A', fontWeight: 500 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      CashBook user found! Name auto-filled.
                    </div>
                  )}
                </div>
                )}

                {/* Name card */}
                <div style={{ border: `1px solid ${lookupState === 'found' ? '#D1FAE5' : 'var(--gray-200)'}`, borderRadius: 10, padding: '16px' }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 10 }}>
                    Enter Name
                  </label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)}
                    placeholder="Type the name of the member here"
                    style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: `1px solid ${lookupState === 'found' ? '#D1FAE5' : 'var(--gray-200)'}`, borderRadius: 7, fontSize: 14, color: '#111827', outline: 'none', background: lookupState === 'found' ? '#F0FDF4' : '#fff', transition: 'border-color 150ms' }}
                  />
                </div>
              </div>

              {/* Footer */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, padding: '14px 24px', borderTop: '1px solid var(--gray-100)', flexShrink: 0 }}>
                <button onClick={onClose} style={{ padding: '9px 22px', borderRadius: 7, border: '1px solid var(--gray-300)', background: '#fff', fontSize: 14, fontWeight: 500, color: '#374151', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button onClick={() => setStep(2)} disabled={!canNext}
                  style={{ padding: '9px 28px', borderRadius: 7, background: canNext ? 'var(--blue)' : '#E5E7EB', color: canNext ? '#fff' : '#9CA3AF', fontSize: 14, fontWeight: 600, border: 'none', cursor: canNext ? 'pointer' : 'default' }}>
                  Next
                </button>
              </div>
            </>
          ) : (
            /* ════════════ STEP 2 ════════════ */
            <>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px 16px', borderBottom: '1px solid #F3F4F6', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button onClick={() => setStep(1)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, border: 'none', background: 'none', cursor: 'pointer', color: '#374151', borderRadius: 4, padding: 0 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
                  </button>
                  <span style={{ fontSize: 16, fontWeight: 500, color: '#111827' }}>
                    {isExistingUser ? 'Choose Role & Add' : 'Choose Role & Invite'}
                  </span>
                </div>
                <button onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, border: 'none', background: 'none', cursor: 'pointer', color: '#6B7280', fontSize: 20, lineHeight: 1, borderRadius: 4 }}>×</button>
              </div>

              {/* Body — scrollable */}
              <div style={{ overflowY: 'auto', flex: 1, padding: '16px 24px 8px' }}>
                {submitError && (
                  <div style={{ padding: '10px 14px', marginBottom: 16, background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 8, color: '#DC2626', fontSize: 13 }}>
                    {submitError}
                  </div>
                )}

                {/* Top message */}
                <p style={{ fontSize: 13, color: '#374151', marginBottom: 16, lineHeight: 1.6 }}>
                  {isExistingUser
                    ? <><strong>{name}</strong> is already using CashBook app. Choose their role in this business and add</>
                    : <><strong>{name || identifier}</strong> is a new user. Send invite to <strong>{identifier}</strong> to join this business</>
                  }
                </p>

                {/* User card */}
                <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, padding: '14px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: AVATAR_BG[colorIdx], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 500, color: AVATAR_TEXT[colorIdx], flexShrink: 0 }}>
                    {initial}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{name}</div>
                    <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{identifier}</div>
                  </div>
                  <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: isExistingUser ? '#DBEAFE' : '#F3F4F6', color: isExistingUser ? '#1D4ED8' : '#6B7280', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {isExistingUser ? 'CashBook User' : 'Not a CashBook User'}
                  </span>
                </div>

                {/* Set Employee ID — collapsible */}
                <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, marginBottom: 16, overflow: 'hidden' }}>
                  <div onClick={() => setEmpIdOpen(p => !p)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', cursor: 'pointer', background: empIdOpen ? '#F8FAFF' : '#fff' }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#2563EB' }}>Set Employee ID</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" style={{ transform: empIdOpen ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }}><polyline points="6 9 12 15 18 9"/></svg>
                  </div>
                  {empIdOpen && (
                    <div style={{ padding: '4px 16px 14px', borderTop: '1px solid #F3F4F6' }}>
                      <input type="text" value={empId} onChange={e => setEmpId(e.target.value)}
                        placeholder="e.g. EMP001"
                        style={{ width: '100%', boxSizing: 'border-box', marginTop: 10, padding: '9px 12px', border: '1px solid #E5E7EB', borderRadius: 7, fontSize: 13, color: '#111827', outline: 'none' }}
                      />
                    </div>
                  )}
                </div>

                {/* Choose Role */}
                <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, padding: '16px', marginBottom: 12 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 12 }}>Choose Role</div>

                  {/* Role pills */}
                  <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                    {['Employee', 'Admin'].map(role => {
                      const isSel = selectedRole === role;
                      return (
                        <button key={role} onClick={() => setSelectedRole(role)}
                          style={{ padding: '7px 20px', borderRadius: 20, border: `1.5px solid ${isSel ? '#2563EB' : '#E5E7EB'}`, background: '#fff', color: isSel ? '#2563EB' : '#374151', fontSize: 13, fontWeight: isSel ? 600 : 400, cursor: 'pointer', outline: 'none', transition: 'all 150ms' }}>
                          {role}
                        </button>
                      );
                    })}
                  </div>

                  {/* Permissions */}
                  {perms.permissions.length > 0 && (
                    <>
                      <div style={{ fontSize: 11, fontWeight: 500, color: '#374151', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 8 }}>Permissions</div>
                      {perms.permissions.map(p => (
                        <div key={p} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="12" fill="#22C55E"/><path d="M7 12l3.5 3.5L17 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          <span style={{ fontSize: 13, color: '#374151', lineHeight: 1.5 }}>{p}</span>
                        </div>
                      ))}
                    </>
                  )}

                  {/* Restrictions */}
                  {perms.restrictions.length > 0 && (
                    <>
                      <div style={{ fontSize: 11, fontWeight: 500, color: '#374151', textTransform: 'uppercase', letterSpacing: 0.4, margin: '12px 0 8px' }}>Restrictions</div>
                      {perms.restrictions.map(r => (
                        <div key={r} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="12" fill="#EF4444"/><path d="M8 8l8 8M16 8l-8 8" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
                          <span style={{ fontSize: 13, color: '#374151', lineHeight: 1.5 }}>{r}</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>

                {/* You can change this role later */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, fontSize: 12, color: '#6B7280' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  You can change this role later
                </div>
              </div>

              {/* Footer */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', borderTop: '1px solid var(--gray-100)', flexShrink: 0 }}>
                <button onClick={() => setStep(1)} style={{ padding: '9px 0', border: 'none', background: 'none', fontSize: 14, fontWeight: 500, color: '#374151', cursor: 'pointer' }}>
                  {mode === 'email' ? 'Change Email' : 'Change Mobile Number'}
                </button>
                <button onClick={handleFinish}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 22px', borderRadius: 7, background: 'var(--blue)', color: '#fff', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  {isExistingUser ? `Add as ${selectedRole}` : `Invite as ${selectedRole}`}
                </button>
              </div>
            </>
          )}

        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </>
  );
}

/* ─── Inline Role Dropdown ──────────────────────────────────── */
function InlineRoleDropdown({ member, onUpdate }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos]   = useState({ top: 0, left: 0 });
  const btnRef = useRef(null);
  const ROLES  = ['Admin', 'Manager', 'Employee'];

  useEffect(() => {
    if (!open) return;
    const h = e => {
      if (btnRef.current && !btnRef.current.closest('[data-role-dropdown]')?.contains(e.target))
        setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  if (member.is_owner) return <RoleBadge role={member.role} />;

  const badgeCfg = ROLE_BADGE[member.role] || { bg: '#F3F4F6', color: '#374151' };

  const handleOpen = (e) => {
    e.stopPropagation();
    const rect = btnRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom + 6, left: rect.left });
    setOpen(p => !p);
  };

  return (
    <div data-role-dropdown style={{ display: 'inline-block' }}>
      <button ref={btnRef} onClick={handleOpen}
        style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
          background: badgeCfg.bg, color: badgeCfg.color,
          border: `1.5px solid ${open ? badgeCfg.color : 'transparent'}`,
          cursor: 'pointer', outline: 'none', transition: 'border-color 120ms',
        }}>
        {member.role}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 150ms', flexShrink: 0 }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {open && (
        <div data-role-dropdown
          style={{
            position: 'fixed', top: pos.top, left: pos.left,
            background: '#fff', border: '1px solid #E5E7EB',
            borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.16)',
            zIndex: 9999, minWidth: 160, overflow: 'hidden',
          }}>
          {ROLES.map(r => {
            const rc = ROLE_BADGE[r] || { bg: '#F3F4F6', color: '#374151' };
            const isCurrent = r === member.role;
            return (
              <div key={r}
                onClick={e => { e.stopPropagation(); onUpdate(r); setOpen(false); }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px', cursor: 'pointer',
                  background: isCurrent ? rc.bg : 'transparent',
                }}
                onMouseEnter={e => { if (!isCurrent) e.currentTarget.style.background = '#F9FAFB'; }}
                onMouseLeave={e => { e.currentTarget.style.background = isCurrent ? rc.bg : 'transparent'; }}>
                <span style={{ fontSize: 13, fontWeight: isCurrent ? 600 : 400, color: rc.color }}>{r}</span>
                {isCurrent && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={rc.color} strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Inline Reports To Dropdown ────────────────────────────── */
function InlineReportsToDropdown({ member, members, onUpdate }) {
  const [open, setOpen]   = useState(false);
  const [search, setSearch] = useState('');
  const [pos, setPos]     = useState({ top: 0, left: 0 });
  const btnRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const h = e => {
      if (btnRef.current && !btnRef.current.closest('[data-rpt-dropdown]')?.contains(e.target)) {
        setOpen(false); setSearch('');
      }
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  const manager    = member.reports_to ? members.find(m => m.id === member.reports_to) : null;
  const candidates = members.filter(m =>
    m.id !== member.id &&
    ((m.name || '').toLowerCase().includes(search.toLowerCase()) ||
     (m.employee_id || '').toLowerCase().includes(search.toLowerCase()))
  );

  if (member.is_owner) return <span style={{ color: '#D1D5DB', fontSize: 12, userSelect: 'none' }}>Assign Manager</span>;

  const handleOpen = (e) => {
    e.stopPropagation();
    const rect = btnRef.current.getBoundingClientRect();
    const dropW = 264;
    const left  = Math.max(8, Math.min(rect.right - dropW, window.innerWidth - dropW - 8));
    setPos({ top: rect.bottom + 6, left });
    setOpen(p => !p);
  };

  return (
    <div data-rpt-dropdown style={{ display: 'inline-block' }}>
      <button ref={btnRef} onClick={handleOpen}
        style={{
          display: 'flex', alignItems: 'center', gap: 4,
          background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0',
          fontSize: 12, outline: 'none',
        }}>
        <span style={{ color: manager ? '#374151' : '#2563EB', fontWeight: 500 }}>
          {manager ? manager.name : 'Assign Manager'}
        </span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
          stroke={manager ? '#9CA3AF' : '#2563EB'} strokeWidth="2.5"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 150ms', flexShrink: 0 }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {open && (
        <div data-rpt-dropdown
          style={{
            position: 'fixed', top: pos.top, left: pos.left,
            width: 264, background: '#fff', border: '1px solid #E5E7EB',
            borderRadius: 10, boxShadow: '0 8px 28px rgba(0,0,0,0.16)',
            zIndex: 9999, overflow: 'hidden',
          }}>
          {/* Search */}
          <div style={{ padding: '10px 12px', borderBottom: '1px solid #F3F4F6' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 10px', border: '1.5px solid #E5E7EB', borderRadius: 7, background: '#FAFAFA' }}>
              <Search size={12} color="#9CA3AF" style={{ flexShrink: 0 }} />
              <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by name or employee ID..."
                style={{ border: 'none', background: 'none', outline: 'none', flex: 1, fontSize: 12, color: '#374151' }} />
            </div>
          </div>

          {/* List */}
          <div style={{ maxHeight: 230, overflowY: 'auto' }}>
            {/* None option */}
            <div onClick={() => { onUpdate(null); setOpen(false); setSearch(''); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', cursor: 'pointer',
                borderBottom: '1px solid #F3F4F6',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              {/* Radio circle */}
              <div style={{
                width: 16, height: 16, borderRadius: '50%', flexShrink: 0, boxSizing: 'border-box',
                border: !member.reports_to ? '5px solid #2563EB' : '1.5px solid #D1D5DB',
                background: 'white',
              }} />
              <span style={{ fontSize: 13, color: '#374151', flex: 1 }}>None</span>
            </div>

            {search && candidates.length === 0 && (
              <div style={{ padding: '14px', textAlign: 'center', fontSize: 12, color: '#9CA3AF' }}>No results found</div>
            )}

            {candidates.map(c => {
              const isSel = member.reports_to === c.id;
              const rc = ROLE_BADGE[c.role] || { bg: '#F3F4F6', color: '#374151' };
              return (
                <div key={c.id}
                  onClick={() => { onUpdate(c.id); setOpen(false); setSearch(''); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', cursor: 'pointer',
                    borderBottom: '1px solid #F9FAFB',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  {/* Radio circle */}
                  <div style={{
                    width: 16, height: 16, borderRadius: '50%', flexShrink: 0, boxSizing: 'border-box',
                    border: isSel ? '5px solid #2563EB' : '1.5px solid #D1D5DB',
                    background: 'white',
                  }} />
                  {/* Name */}
                  <span style={{ fontSize: 13, color: '#111827', fontWeight: 400, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.name}{c.is_owner && <span style={{ color: '#9CA3AF', fontSize: 11 }}> (You)</span>}
                  </span>
                  {/* Role badge on right */}
                  <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: rc.bg, color: rc.color, whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {c.role}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Toast notification ────────────────────────────────────── */
function Toast({ message, onHide }) {
  useEffect(() => {
    const t = setTimeout(onHide, 3500);
    return () => clearTimeout(t);
  }, [onHide]);
  return (
    <div style={{
      position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)',
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '12px 20px', borderRadius: 10,
      background: '#1F2937', color: '#fff',
      fontSize: 13, fontWeight: 500,
      boxShadow: '0 8px 24px rgba(0,0,0,0.22)',
      zIndex: 99999, whiteSpace: 'nowrap',
      animation: 'fadeInUp 200ms ease',
    }}>
      <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <svg width="11" height="9" viewBox="0 0 11 9" fill="none"><path d="M1 4.5l3 3 6-7" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>
      {message}
    </div>
  );
}

/* ─── ChangeRoleModal ───────────────────────────────────────── */
function ChangeRoleModal({ member, onUpdate, onClose }) {
  const [selectedRole, setSelectedRole] = useState(member.role);
  const ROLES = ['Admin', 'Manager', 'Employee'];

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 600 }} />
      <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 700, padding: 16 }}>
        <div style={{ width: '100%', maxWidth: 420, background: '#fff', borderRadius: 14, boxShadow: '0 20px 60px rgba(0,0,0,0.18)', overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 18px', borderBottom: '1px solid #F3F4F6' }}>
            <span style={{ fontSize: 16, fontWeight: 500, color: '#111827' }}>Change Role</span>
            <button onClick={onClose} style={{ width: 28, height: 28, border: 'none', background: 'none', cursor: 'pointer', color: '#6B7280', fontSize: 20, lineHeight: 1, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
          </div>
          {/* Role list */}
          <div style={{ padding: '8px 0' }}>
            {ROLES.map(role => {
              const isCurrent = role === member.role;
              const isSelected = role === selectedRole;
              return (
                <div key={role} onClick={() => setSelectedRole(role)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', cursor: 'pointer', background: isSelected ? '#EFF6FF' : 'transparent', transition: 'background 100ms' }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#F9FAFB'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = isSelected ? '#EFF6FF' : 'transparent'; }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', border: `${isSelected ? 5 : 1.5}px solid ${isSelected ? '#2563EB' : '#D1D5DB'}`, boxSizing: 'border-box', flexShrink: 0 }} />
                    <span style={{ fontSize: 14, fontWeight: isSelected ? 600 : 400, color: isSelected ? '#2563EB' : '#111827' }}>{role}</span>
                  </div>
                  {isCurrent && <span style={{ fontSize: 11, color: '#9CA3AF' }}>Current Role</span>}
                </div>
              );
            })}
          </div>
          {/* Footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, padding: '14px 24px', borderTop: '1px solid #F3F4F6' }}>
            <button onClick={onClose}
              style={{ padding: '9px 22px', borderRadius: 7, border: 'none', background: 'none', fontSize: 14, fontWeight: 500, color: '#374151', cursor: 'pointer' }}>
              Cancel
            </button>
            <button onClick={() => { onUpdate({ role: selectedRole }); onClose(); }}
              style={{ padding: '9px 28px', borderRadius: 7, background: '#2563EB', color: '#fff', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
              Update
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── RemoveConfirmModal ────────────────────────────────────── */
function RemoveConfirmModal({ member, onRemove, onClose }) {
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 600 }} />
      <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 700, padding: 16 }}>
        <div style={{ width: '100%', maxWidth: 420, background: '#fff', borderRadius: 14, boxShadow: '0 20px 60px rgba(0,0,0,0.18)', overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 16px', borderBottom: '1px solid #F3F4F6' }}>
            <span style={{ fontSize: 16, fontWeight: 500, color: '#111827' }}>Remove {member.name}?</span>
            <button onClick={onClose} style={{ width: 28, height: 28, border: 'none', background: 'none', cursor: 'pointer', color: '#6B7280', fontSize: 20, lineHeight: 1, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
          </div>
          {/* Body */}
          <div style={{ padding: '20px 24px' }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 14 }}>Are you sure?</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                `${member.name} will lose access to this business & it's books`,
                `We will also notify ${member.name} that they have been removed from this business.`,
              ].map((text, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#9CA3AF', flexShrink: 0, marginTop: 5 }} />
                  <span style={{ fontSize: 13, color: '#374151', lineHeight: 1.5 }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, padding: '14px 24px', borderTop: '1px solid #F3F4F6' }}>
            <button onClick={onClose}
              style={{ padding: '9px 22px', borderRadius: 7, border: '1px solid #D1D5DB', background: '#fff', fontSize: 14, fontWeight: 500, color: '#374151', cursor: 'pointer' }}>
              Cancel
            </button>
            <button onClick={() => { onRemove(); onClose(); }}
              style={{ padding: '9px 28px', borderRadius: 7, background: '#DC2626', color: '#fff', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
              Remove
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── Book role data ─────────────────────────────────────────── */
const BOOK_ROLE_DATA = {
  'Data Operator': {
    permissions: [
      'Add Cash In/Cash Out entries',
      'View entries by everyone',
      'View net balance & download PDF or Excel',
    ],
    restrictions: ['Cannot edit or delete entries'],
  },
  'Viewer': {
    permissions: [
      'View entries by everyone',
      'View net balance & download PDF or Excel',
    ],
    restrictions: ['Cannot add/edit/delete entries'],
  },
  'Book Admin': {
    permissions: [
      'Full access to book settings & activity log',
      'Customize data operator permissions',
      'Change roles of data operator or viewer',
    ],
    restrictions: [
      "Can't remove Primary Admin or Admins",
      "Can't delete book",
    ],
  },
};

/* ─── BookAdminConfirmModal ──────────────────────────────────── */
function BookAdminConfirmModal({ memberName, bookName, onConfirm, onClose }) {
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1100 }} />
      <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1101, padding: 16 }}>
        <div style={{ width: '100%', maxWidth: 440, background: '#fff', borderRadius: 14, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '20px 24px 16px' }}>
            <span style={{ fontSize: 15, fontWeight: 500, color: '#111827', lineHeight: 1.4, flex: 1 }}>
              Change {memberName}'s role to Book Admin in {bookName}?
            </span>
            <button onClick={onClose} style={{ width: 28, height: 28, border: 'none', background: 'none', cursor: 'pointer', color: '#6B7280', fontSize: 20, lineHeight: 1, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginLeft: 8 }}>×</button>
          </div>
          <div style={{ padding: '0 24px 20px' }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 12 }}>Are you sure ?</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              {[
                `${memberName} will have full access to book activities`,
                `They will be able to add data operator or viewer from your team`,
              ].map((text, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#9CA3AF', flexShrink: 0, marginTop: 5 }} />
                  <span style={{ fontSize: 13, color: '#374151', lineHeight: 1.5 }}>{text}</span>
                </div>
              ))}
            </div>
            <div style={{ background: '#EFF6FF', border: '1px solid #DBEAFE', borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span style={{ fontSize: 12, color: '#1D4ED8' }}>This role will only be limited to this book</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, padding: '14px 24px', borderTop: '1px solid #F3F4F6' }}>
            <button onClick={onClose}
              style={{ padding: '9px 22px', borderRadius: 7, border: '1px solid #D1D5DB', background: '#fff', fontSize: 14, fontWeight: 500, color: '#374151', cursor: 'pointer' }}>
              Cancel
            </button>
            <button onClick={onConfirm}
              style={{ padding: '9px 28px', borderRadius: 7, background: '#2563EB', color: '#fff', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
              Change
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── BookChangeRolePanel ────────────────────────────────────── */
function BookChangeRolePanel({ memberName, bookId, bookName, currentRole, businessId, memberId, onClose, onRoleUpdated }) {
  const [selectedRole, setSelectedRole] = useState(currentRole);
  const [showAdminConfirm, setShowAdminConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const ROLES = ['Data Operator', 'Viewer', 'Book Admin'];

  const handleUpdate = () => {
    if (selectedRole === 'Book Admin' && currentRole !== 'Book Admin') {
      setShowAdminConfirm(true);
    } else {
      doUpdate(selectedRole);
    }
  };

  const doUpdate = async (role) => {
    setSaving(true);
    try {
      await api.team.updateBookRole(businessId, memberId, bookId, role);
      onRoleUpdated(bookId, role);
      onClose();
    } catch (err) {
      console.error('Failed to update book role:', err);
    } finally {
      setSaving(false);
    }
  };

  const roleData = BOOK_ROLE_DATA[selectedRole] || BOOK_ROLE_DATA['Data Operator'];

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 800 }} />
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 420, background: '#fff', boxShadow: '-4px 0 28px rgba(0,0,0,0.18)', zIndex: 900, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid #F3F4F6', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 16, fontWeight: 500, color: '#111827' }}>Change {memberName}'s Role</span>
            <button onClick={onClose} style={{ width: 28, height: 28, border: 'none', background: 'none', cursor: 'pointer', color: '#6B7280', fontSize: 20, lineHeight: 1, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
          </div>
          <div style={{ fontSize: 12, color: '#9CA3AF' }}>Book: <strong style={{ color: '#374151', fontWeight: 600 }}>{bookName}</strong></div>
        </div>
        {/* Role tabs */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #F3F4F6', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {ROLES.map(role => {
              const isSelected = selectedRole === role;
              return (
                <button key={role} onClick={() => setSelectedRole(role)}
                  style={{ padding: '7px 16px', borderRadius: 20, border: `1.5px solid ${isSelected ? '#2563EB' : '#E5E7EB'}`, background: isSelected ? '#2563EB' : '#fff', color: isSelected ? '#fff' : '#374151', fontSize: 13, fontWeight: isSelected ? 600 : 400, cursor: 'pointer', transition: 'all 150ms', outline: 'none' }}>
                  {role}
                </button>
              );
            })}
          </div>
        </div>
        {/* Permissions & Restrictions */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {roleData.permissions.length > 0 && (
            <>
              <div style={{ fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.4 }}>Permissions</div>
              {roleData.permissions.map(p => (
                <div key={p} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="12" fill="#22C55E"/><path d="M7 12l3.5 3.5L17 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <span style={{ fontSize: 13, color: '#374151', lineHeight: 1.5 }}>{p}</span>
                </div>
              ))}
            </>
          )}
          {roleData.restrictions.length > 0 && (
            <>
              <div style={{ fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 10, marginTop: 16, textTransform: 'uppercase', letterSpacing: 0.4 }}>Restrictions</div>
              {roleData.restrictions.map(r => (
                <div key={r} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="12" fill="#EF4444"/><path d="M8 8l8 8M16 8l-8 8" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
                  <span style={{ fontSize: 13, color: '#374151', lineHeight: 1.5 }}>{r}</span>
                </div>
              ))}
            </>
          )}
        </div>
        {/* Footer */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid #F3F4F6', flexShrink: 0 }}>
          <button onClick={handleUpdate} disabled={saving || selectedRole === currentRole}
            style={{ width: '100%', padding: '11px', borderRadius: 8, border: 'none', background: (saving || selectedRole === currentRole) ? '#E5E7EB' : '#2563EB', color: (saving || selectedRole === currentRole) ? '#9CA3AF' : '#fff', fontSize: 14, fontWeight: 600, cursor: (saving || selectedRole === currentRole) ? 'default' : 'pointer' }}>
            {saving ? 'Updating...' : 'Update'}
          </button>
        </div>
      </div>
      {showAdminConfirm && (
        <BookAdminConfirmModal
          memberName={memberName}
          bookName={bookName}
          onConfirm={() => { setShowAdminConfirm(false); doUpdate('Book Admin'); }}
          onClose={() => setShowAdminConfirm(false)}
        />
      )}
    </>
  );
}

/* ─── BookRoleDropdown (inline per-book role selector) ──────── */
function BookRoleDropdown({ value, onChange }) {
  const [open, setOpen]   = useState(false);
  const [pos, setPos]     = useState({ top: 0, left: 0 });
  const btnRef            = useRef(null);
  const BOOK_ROLES = ['Book Admin', 'Data Operator', 'Viewer'];

  useEffect(() => {
    if (!open) return;
    const h = e => { if (btnRef.current && !btnRef.current.closest('[data-brd]')?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  const handleOpen = (e) => {
    e.stopPropagation();
    const rect = btnRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom + 4, left: rect.left });
    setOpen(p => !p);
  };

  return (
    <div data-brd style={{ display: 'inline-block' }}>
      <button ref={btnRef} onClick={handleOpen}
        style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 8px 3px 10px', border: '1px solid #DBEAFE', borderRadius: 5, background: '#EFF6FF', cursor: 'pointer', fontSize: 12, fontWeight: 500, color: '#2563EB', outline: 'none' }}>
        {value}
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.5" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 120ms', flexShrink: 0 }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {open && (
        <div data-brd style={{ position: 'fixed', top: pos.top, left: pos.left, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8, boxShadow: '0 6px 20px rgba(0,0,0,0.13)', zIndex: 9999, minWidth: 150, overflow: 'hidden' }}>
          {BOOK_ROLES.map(r => (
            <div key={r} onClick={e => { e.stopPropagation(); onChange(r); setOpen(false); }}
              style={{ padding: '9px 14px', fontSize: 13, color: r === value ? '#2563EB' : '#374151', fontWeight: r === value ? 600 : 400, background: r === value ? '#EFF6FF' : 'transparent', cursor: 'pointer' }}
              onMouseEnter={e => { if (r !== value) e.currentTarget.style.background = '#F9FAFB'; }}
              onMouseLeave={e => { e.currentTarget.style.background = r === value ? '#EFF6FF' : 'transparent'; }}>
              {r}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── ReportsToDropdown ─────────────────────────────────────── */
function ReportsToDropdown({ members, currentReportsTo, currentMemberId, onSave, onCancel }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(currentReportsTo || 'none');
  const btnRef = useRef(null);
  
  // Eligible managers: not the current member
  const eligibleManagers = members.filter(m => m.id !== currentMemberId);
  const filtered = eligibleManagers.filter(m => 
    (m.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (m.employee_id || '').toLowerCase().includes(search.toLowerCase())
  );

  const selectedName = selected === 'none' ? 'None' : (members.find(m => m.id === selected)?.name || 'None');

  useEffect(() => {
    if (!open) return;
    const h = e => { if (btnRef.current && !btnRef.current.closest('[data-rtd]')?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  return (
    <div data-rtd style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'relative' }}>
      <div 
        ref={btnRef}
        onClick={() => setOpen(p => !p)}
        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 8px', border: '1px solid #2563EB', borderRadius: 4, background: '#EFF6FF', cursor: 'pointer', fontSize: 13, color: '#374151', minWidth: 150 }}
      >
        <span>{selectedName}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.5" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 120ms' }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>
      <svg onClick={() => onSave(selected === 'none' ? null : selected)} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.5" style={{ cursor: 'pointer', flexShrink: 0 }}>
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      
      {open && (
        <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 4, width: 280, background: '#fff', border: '1px solid #2563EB', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 9999, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '8px 12px', borderBottom: '1px solid #F3F4F6' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px', border: '1px solid #3B82F6', borderRadius: 4 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input 
                autoFocus
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                placeholder="Search by name or employee ID..." 
                style={{ border: 'none', outline: 'none', width: '100%', fontSize: 13, color: '#111827' }} 
              />
            </div>
          </div>
          <div style={{ maxHeight: 200, overflowY: 'auto', padding: '4px 0' }}>
            <div 
              onClick={() => { setSelected('none'); setOpen(false); }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', cursor: 'pointer', background: selected === 'none' ? '#F9FAFB' : 'transparent' }}
              onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
              onMouseLeave={e => e.currentTarget.style.background = selected === 'none' ? '#F9FAFB' : 'transparent'}
            >
              <div style={{ width: 14, height: 14, borderRadius: '50%', border: '1.5px solid #2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {selected === 'none' && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2563EB' }} />}
              </div>
              <span style={{ fontSize: 13, color: '#374151' }}>None</span>
            </div>
            
            {filtered.map(m => (
              <div 
                key={m.id}
                onClick={() => { setSelected(m.id); setOpen(false); }}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', cursor: 'pointer', background: selected === m.id ? '#F9FAFB' : 'transparent' }}
                onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                onMouseLeave={e => e.currentTarget.style.background = selected === m.id ? '#F9FAFB' : 'transparent'}
              >
                <div style={{ width: 14, height: 14, borderRadius: '50%', border: '1.5px solid #2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {selected === m.id && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2563EB' }} />}
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, color: '#374151' }}>{m.name} {m.is_owner ? '(Owner)' : ''}</span>
                  <span style={{ fontSize: 11, padding: '2px 8px', background: '#ECFDF5', color: '#059669', borderRadius: 12, fontWeight: 500 }}>{m.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── AddToBooksDrawer ──────────────────────────────────────── */
function AddToBooksDrawer({ member, currentBusinessId, memberBooks, onBooksAdded, onClose }) {
  const { cashbooks } = useApp();
  const [search, setSearch]           = useState('');
  const [rolesOpen, setRolesOpen]     = useState(false);
  // selectedBooks: { [bookId]: role }
  const [selectedBooks, setSelectedBooks] = useState({});
  const [adding, setAdding]           = useState(false);
  const searchRef = useRef(null);

  const assignedMap = Object.fromEntries((memberBooks || []).map(b => [b.bookId, b.role]));

  const filteredBooks = cashbooks.filter(b =>
    (b.name || '').toLowerCase().includes(search.toLowerCase())
  );

  const selectedCount = Object.keys(selectedBooks).length;

  const toggleBook = (bookId) => {
    if (assignedMap[bookId]) return; // already assigned — disabled
    setSelectedBooks(prev => {
      if (prev[bookId]) {
        const next = { ...prev };
        delete next[bookId];
        return next;
      }
      return { ...prev, [bookId]: 'Data Operator' };
    });
  };

  const setBookRole = (bookId, role) => {
    setSelectedBooks(prev => ({ ...prev, [bookId]: role }));
  };

  const handleAdd = async () => {
    if (!selectedCount) return;
    setAdding(true);
    try {
      for (const [bookId, role] of Object.entries(selectedBooks)) {
        await api.team.addToBook(currentBusinessId, member.id, { bookId, role });
      }
      onBooksAdded(selectedCount);
      onClose();
    } catch (err) {
      console.error('AddToBooks failed:', err);
    } finally {
      setAdding(false);
    }
  };

  const BOOK_ROLES_INFO = [
    { role: 'Book Admin',    desc: 'Full access to entries & book settings' },
    { role: 'Data Operator', desc: 'Only add entry access' },
    { role: 'Viewer',        desc: 'Only view entries & reports access' },
  ];

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 600 }} />
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 420, background: '#fff', boxShadow: '-4px 0 28px rgba(0,0,0,0.16)', zIndex: 700, display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 16px', borderBottom: '1px solid #F3F4F6', flexShrink: 0 }}>
          <span style={{ fontSize: 16, fontWeight: 500, color: '#111827' }}>
            Add {member.name} to Books
          </span>
          <button onClick={onClose} style={{ width: 28, height: 28, border: 'none', background: 'none', cursor: 'pointer', color: '#6B7280', fontSize: 22, lineHeight: 1, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>

        {/* Search */}
        <div style={{ padding: '12px 24px 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', border: '1px solid #E5E7EB', borderRadius: 8, background: '#fff' }}>
            <Search size={13} color="#9CA3AF" style={{ flexShrink: 0 }} />
            <input ref={searchRef} value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by book name..."
              style={{ border: 'none', outline: 'none', flex: 1, fontSize: 13, color: '#374151', background: 'transparent' }} />
            <kbd style={{ padding: '1px 5px', background: '#F3F4F6', borderRadius: 3, fontSize: 11, color: '#9CA3AF', border: '1px solid #E5E7EB' }}>/</kbd>
          </div>
        </div>

        {/* Roles & Permissions collapsible */}
        <div style={{ margin: '12px 24px 0', border: '1px solid #E5E7EB', borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
          <div onClick={() => setRolesOpen(p => !p)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', cursor: 'pointer', background: rolesOpen ? '#F8FAFF' : '#FAFAFA' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Roles &amp; Permissions in books</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2.5"
              style={{ transform: rolesOpen ? 'rotate(180deg)' : 'none', transition: 'transform 150ms', flexShrink: 0 }}>
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
          {rolesOpen && (
            <div style={{ borderTop: '1px solid #F3F4F6', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {BOOK_ROLES_INFO.map(({ role, desc }) => (
                <div key={role} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{role}</div>
                    <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Book list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 24px 8px' }}>
          {filteredBooks.length === 0 ? (
            <div style={{ padding: '32px 0', textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>
              {search ? 'No books match your search' : 'No books available'}
            </div>
          ) : filteredBooks.map(book => {
            const alreadyAssigned = assignedMap[book.id];
            const isChecked = !!selectedBooks[book.id];

            return (
              <div key={book.id} style={{ marginBottom: 2 }}>
                <div
                  onClick={() => toggleBook(book.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 4px', cursor: alreadyAssigned ? 'default' : 'pointer', borderRadius: 8 }}
                  onMouseEnter={e => { if (!alreadyAssigned) e.currentTarget.style.background = '#F9FAFB'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                  {/* Checkbox */}
                  <div style={{
                    width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                    border: `2px solid ${alreadyAssigned ? '#D1D5DB' : isChecked ? '#2563EB' : '#D1D5DB'}`,
                    background: isChecked ? '#2563EB' : '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: alreadyAssigned ? 0.5 : 1,
                  }}>
                    {isChecked && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                  {/* Name */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: isChecked ? 600 : 400, color: alreadyAssigned ? '#9CA3AF' : '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {book.name}
                    </div>
                    {alreadyAssigned && (
                      <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>
                        Already added as <strong style={{ color: '#6B7280' }}>{alreadyAssigned}</strong>
                      </div>
                    )}
                  </div>
                </div>
                {/* Inline role dropdown when checked */}
                {isChecked && (
                  <div style={{ paddingLeft: 30, paddingBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}
                    onClick={e => e.stopPropagation()}>
                    <span style={{ fontSize: 12, color: '#6B7280' }}>Role:</span>
                    <BookRoleDropdown
                      value={selectedBooks[book.id]}
                      onChange={role => setBookRole(book.id, role)}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ borderTop: '1px solid #F3F4F6', padding: '14px 24px', flexShrink: 0 }}>
          <button onClick={handleAdd} disabled={!selectedCount || adding}
            style={{
              width: '100%', padding: '11px', borderRadius: 8, border: 'none',
              background: selectedCount && !adding ? '#2563EB' : '#E5E7EB',
              color: selectedCount && !adding ? '#fff' : '#9CA3AF',
              fontSize: 14, fontWeight: 600,
              cursor: selectedCount && !adding ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
            {adding ? 'Adding...' : (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Add in {selectedCount || 0} book{selectedCount !== 1 ? 's' : ''}
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}

/* ─── Employee Info Panel ───────────────────────────────────── */
function EmployeeInfoPanel({ member, members, currentBusinessId, onBack, onUpdate, onRemove }) {
  const [empIdEdit, setEmpIdEdit]         = useState(false);
  const [empIdVal, setEmpIdVal]           = useState(member.employee_id || '');
  const [reportsToEdit, setReportsToEdit] = useState(false);
  const [permOpen, setPermOpen]           = useState(true);
  const [teamOpen, setTeamOpen]           = useState(false);
  const [booksOpen, setBooksOpen]         = useState(true);
  const [showChangeRole, setShowChangeRole]     = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [showAddToBooks, setShowAddToBooks]       = useState(false);
  const [memberBooks, setMemberBooks]     = useState([]);
  const [loadingBooks, setLoadingBooks]   = useState(false);
  const [toast, setToast]                 = useState(null);
  const [bookMenuOpen, setBookMenuOpen]        = useState(null); // bookId of open menu
  const [bookMenuPos, setBookMenuPos]           = useState({ top: 0, right: 0 });
  const [bookChangeRoleTarget, setBookChangeRoleTarget] = useState(null); // { bookId, bookName, currentRole }
  const [bookRemoveConfirm, setBookRemoveConfirm]       = useState(null); // { bookId, bookName }

  const isOwner = !!member.is_owner;
  const isPending = member.invite_status === 'Pending';

  // Fetch member's books from API (skip for owner entries without real member id)
  useEffect(() => {
    if (!currentBusinessId || !member.id) return;
    // owner_ entries are handled by backend now, so we always fetch
    setLoadingBooks(true);
    api.team.getBooks(currentBusinessId, member.id)
      .then(({ books }) => setMemberBooks(books || []))
      .catch(() => setMemberBooks([]))
      .finally(() => setLoadingBooks(false));
  }, [currentBusinessId, member.id]);

  const refreshBooks = (addedCount) => {
    if (!currentBusinessId || !member.id) return;
    api.team.getBooks(currentBusinessId, member.id)
      .then(({ books }) => {
        setMemberBooks(books || []);
        if (addedCount > 0) {
          setToast(`${member.name} has been added to ${addedCount} book${addedCount !== 1 ? 's' : ''}`);
        }
      })
      .catch(() => {});
  };

  // Close book menu on outside click (using data-attr approach for fixed dropdown)
  useEffect(() => {
    if (!bookMenuOpen) return;
    const h = (e) => {
      if (!e.target.closest('[data-book-dot-btn]') && !e.target.closest('[data-book-dot-menu]')) {
        setBookMenuOpen(null);
      }
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [bookMenuOpen]);

  const handleBookRoleUpdated = (bookId, newRole) => {
    setMemberBooks(prev => prev.map(b => b.bookId === bookId ? { ...b, role: newRole } : b));
    setToast('Role updated successfully');
  };

  const handleRemoveFromBook = async (bookId) => {
    try {
      await api.team.removeFromBook(currentBusinessId, member.id, bookId);
      setMemberBooks(prev => prev.filter(b => b.bookId !== bookId));
      setToast(`${member.name} removed from book`);
    } catch (err) {
      console.error('Failed to remove from book:', err);
    }
    setBookRemoveConfirm(null);
  };

  const PERMISSIONS_MAP = {
    'Employee': {
      permissions: [
        'Limited access to selected books',
        'Primary Admin/Admin can assign Book Admin, Viewer or Operator role to Employee in any book',
        'Can leave business from business settings',
      ],
      restrictions: [
        'No access to books they are not part of',
        'No option to delete books',
        "Can't view employee details",
      ],
    },
    'Manager': {
      permissions: ['Can view all books', 'Can manage team members', 'Can view reports'],
      restrictions: ['Cannot delete business', 'Cannot change primary admin'],
    },
    'Admin': {
      permissions: ['Full access to all books', 'Can manage team members', 'Can view and edit all settings'],
      restrictions: ['Cannot delete business'],
    },
    'Primary Admin': {
      permissions: ['Full access to everything', 'Can delete business', 'Can transfer ownership'],
      restrictions: [],
    },
  };

  const perms = PERMISSIONS_MAP[member.role] || PERMISSIONS_MAP['Employee'];
  const reportsToMember = member.reports_to ? members.find(m => m.id === member.reports_to) : null;
  const initials = (member.name || '?').charAt(0).toUpperCase();
  const avatarColors    = ['#DCF3EB', '#DBEAFE', '#EDE9FE', '#FEF3C7', '#FCE7F3'];
  const avatarTextColor = ['#065F46', '#1D4ED8', '#5B21B6', '#92400E', '#9D174D'];
  const colorIdx   = (member.name || '').charCodeAt(0) % avatarColors.length;
  const avatarColor = avatarColors[colorIdx];
  const textColor   = avatarTextColor[colorIdx];

  const memberSince = member.created_at
    ? new Date(member.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';

  const dateText = isPending ? `Invitation sent on ${memberSince}` : `Member since ${memberSince}`;

  // For Primary Admin: team members that report to them
  const ownerEntry = members.find(m => m.is_owner);
  const directReports = members.filter(m => !m.is_owner && m.reports_to === member.id);

  return (
    <div style={{ padding: '16px 28px', maxWidth: 600 }}>
      {/* Back */}
      <div onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, cursor: 'pointer', color: '#374151', fontSize: 14, fontWeight: 500 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
        {isOwner ? 'Primary Admin Info' : 'Employee Info'}
      </div>

      {/* Profile card */}
      <div style={{ border: '1px solid #E5E7EB', borderRadius: 12, padding: '20px', marginBottom: 16, background: '#fff' }}>
        {/* Top row: avatar + name + role badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 500, color: textColor, flexShrink: 0 }}>
              {initials}
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 500, color: '#111827' }}>{member.name}</div>
              <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>{dateText}</div>
            </div>
          </div>
          <RoleBadge role={member.role} />
        </div>
        <div style={{ height: 1, background: '#F3F4F6', marginBottom: 16 }} />

        {/* Info grid — 3 fields for owner, 4 for others */}
        {isOwner ? (
          // Primary Admin: Email, Employee ID, Mobile (no Reports To)
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px' }}>
            {/* Email */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,13 22,4"/></svg>
                <span style={{ fontSize: 11, color: '#9CA3AF' }}>Email Address</span>
              </div>
              <div style={{ fontSize: 13, color: member.email ? '#111827' : '#6B7280' }}>{member.email || '—'}</div>
            </div>
            {/* Employee ID */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                <span style={{ fontSize: 11, color: '#9CA3AF' }}>Employee ID</span>
              </div>
              <div style={{ fontSize: 13, color: '#6B7280' }}>—</div>
            </div>
            {/* Mobile */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18"/></svg>
                <span style={{ fontSize: 11, color: '#9CA3AF' }}>Registered Mobile Number</span>
              </div>
              <div style={{ fontSize: 13, color: '#111827' }}>{member.mobile || '—'}</div>
            </div>
          </div>
        ) : (
          // Regular member: 2x2 grid with all 4 fields
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px' }}>
            {/* Email */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,13 22,4"/></svg>
                <span style={{ fontSize: 11, color: '#9CA3AF' }}>Email Address</span>
              </div>
              <div style={{ fontSize: 13, color: member.email ? '#111827' : '#6B7280' }}>{member.email || '—'}</div>
            </div>
            {/* Employee ID */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                <span style={{ fontSize: 11, color: '#9CA3AF' }}>Employee ID</span>
              </div>
              {empIdEdit ? (
                <div style={{ display: 'flex', gap: 4 }}>
                  <input autoFocus value={empIdVal} onChange={e => setEmpIdVal(e.target.value)}
                    style={{ flex: 1, fontSize: 12, padding: '3px 6px', border: '1px solid #2563EB', borderRadius: 4, outline: 'none' }}
                    onKeyDown={e => {
                      if (e.key === 'Enter')  { onUpdate({ employee_id: empIdVal }); setEmpIdEdit(false); }
                      if (e.key === 'Escape') { setEmpIdEdit(false); }
                    }}
                  />
                  <button onClick={() => { onUpdate({ employee_id: empIdVal }); setEmpIdEdit(false); }}
                    style={{ padding: '3px 8px', borderRadius: 4, background: '#2563EB', color: '#fff', border: 'none', fontSize: 12, cursor: 'pointer' }}>Save</button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {member.employee_id
                    ? <span style={{ fontSize: 13, color: '#111827' }}>{member.employee_id}</span>
                    : <span onClick={() => setEmpIdEdit(true)} style={{ fontSize: 13, color: '#2563EB', cursor: 'pointer', fontWeight: 500 }}>Add Employee ID</span>
                  }
                  {member.employee_id && (
                    <svg onClick={() => setEmpIdEdit(true)} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" style={{ cursor: 'pointer' }}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  )}
                </div>
              )}
            </div>
            {/* Mobile */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18"/></svg>
                <span style={{ fontSize: 11, color: '#9CA3AF' }}>Registered Mobile Number</span>
              </div>
              <div style={{ fontSize: 13, color: '#111827' }}>{member.mobile || '—'}</div>
            </div>
            {/* Reports To */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                <span style={{ fontSize: 11, color: '#9CA3AF' }}>Reports To</span>
              </div>
              {reportsToEdit ? (
                <ReportsToDropdown 
                  members={members} 
                  currentReportsTo={member.reports_to}
                  currentMemberId={member.id}
                  onSave={(newReportsTo) => {
                    onUpdate({ reports_to: newReportsTo });
                    setReportsToEdit(false);
                  }}
                  onCancel={() => setReportsToEdit(false)}
                />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {reportsToMember
                    ? <span style={{ fontSize: 13, color: '#111827' }}>{reportsToMember.name}</span>
                    : <span onClick={() => setReportsToEdit(true)} style={{ fontSize: 13, color: '#2563EB', cursor: 'pointer', fontWeight: 500 }}>Assign Manager</span>
                  }
                  {reportsToMember && (
                    <svg onClick={() => setReportsToEdit(true)} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" style={{ cursor: 'pointer' }}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Pending Invitation Alert */}
      {isPending && (
        <div style={{ border: '1px solid #FEF08A', borderRadius: 12, padding: '20px', marginBottom: 16, background: '#FEF9C3' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#92400E' }}>Pending Invitation</span>
          </div>
          <div style={{ fontSize: 13, color: '#92400E', marginBottom: 16, paddingLeft: 30, lineHeight: 1.5 }}>
            {member.mobile || member.email} hasn't registered on CashBook yet. Send them invite link & ask to register.
          </div>
          <button style={{ width: '100%', padding: '10px', background: '#fff', border: '1px solid #FCD34D', borderRadius: 8, color: '#D97706', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background 150ms' }}
            onMouseEnter={e => e.currentTarget.style.background = '#FFFBEB'}
            onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            Resend Invitation
          </button>
        </div>
      )}

      {/* Employee Permission */}
      <div style={{ border: '1px solid #E5E7EB', borderRadius: 12, marginBottom: 12, background: '#fff', overflow: 'hidden' }}>
        <div onClick={() => setPermOpen(p => !p)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>Employee Permission</div>
              <div style={{ fontSize: 12, color: '#9CA3AF' }}>List of actions Employee can take</div>
            </div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" style={{ transform: permOpen ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }}><polyline points="6 9 12 15 18 9"/></svg>
        </div>
        {permOpen && (
          <div style={{ padding: '0 16px 16px', borderTop: '1px solid #F3F4F6' }}>
            {perms.permissions.length > 0 && <>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5, margin: '12px 0 8px' }}>Permissions</div>
              {perms.permissions.map(p => (
                <div key={p} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="12" fill="#22C55E"/><path d="M7 12l3.5 3.5L17 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <span style={{ fontSize: 12, color: '#374151', lineHeight: 1.5 }}>{p}</span>
                </div>
              ))}
            </>}
            {perms.restrictions.length > 0 && <>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5, margin: '12px 0 8px' }}>Restrictions</div>
              {perms.restrictions.map(r => (
                <div key={r} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="12" fill="#EF4444"/><path d="M8 8l8 8M16 8l-8 8" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
                  <span style={{ fontSize: 12, color: '#374151', lineHeight: 1.5 }}>{r}</span>
                </div>
              ))}
            </>}
          </div>
        )}
      </div>

      {/* Team section — only for Primary Admin (is_owner) */}
      {isOwner && (
        <div style={{ border: '1px solid #E5E7EB', borderRadius: 12, marginBottom: 12, background: '#fff', overflow: 'hidden' }}>
          <div onClick={() => setTeamOpen(p => !p)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>Team ({directReports.length})</div>
                <div style={{ fontSize: 12, color: '#9CA3AF' }}>Members who directly / indirectly report to you</div>
              </div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" style={{ transform: teamOpen ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }}><polyline points="6 9 12 15 18 9"/></svg>
          </div>
          {teamOpen && (
            <div style={{ borderTop: '1px solid #F3F4F6', padding: '8px 0' }}>
              {directReports.length === 0 ? (
                <div style={{ padding: '12px 16px', fontSize: 13, color: '#9CA3AF' }}>No direct reports yet</div>
              ) : (
                directReports.map(m => (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 500, color: '#5B21B6', flexShrink: 0 }}>
                      {(m.name || '?').charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontSize: 13, color: '#111827', flex: 1 }}>{m.name}</span>
                    <RoleBadge role={m.role} />
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Books section */}
      <div style={{ border: '1px solid #E5E7EB', borderRadius: 12, marginBottom: 16, background: '#fff', overflow: 'hidden' }}>
        <div onClick={() => setBooksOpen(p => !p)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>
                Books ({loadingBooks ? '…' : memberBooks.length})
              </div>
              <div style={{ fontSize: 12, color: '#9CA3AF' }}>List of assigned books</div>
            </div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" style={{ transform: booksOpen ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }}><polyline points="6 9 12 15 18 9"/></svg>
        </div>
        {booksOpen && (
          <div style={{ borderTop: '1px solid #F3F4F6' }}>
            {/* Add to more books CTA */}
            <div onClick={() => setShowAddToBooks(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', cursor: 'pointer', color: '#2563EB', borderBottom: memberBooks.length > 0 ? '1px solid #F3F4F6' : 'none' }}
              onMouseEnter={e => e.currentTarget.style.background = '#F0F9FF'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', border: '1.5px dashed #2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 300, flexShrink: 0 }}>+</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>Add to more books</div>
                <div style={{ fontSize: 11, color: '#9CA3AF' }}>Add &amp; Assign Role</div>
              </div>
            </div>

            {/* Book list */}
            {loadingBooks ? (
              <div style={{ padding: '12px 16px', fontSize: 13, color: '#9CA3AF' }}>Loading books...</div>
            ) : memberBooks.map(book => (
              <div key={book.bookId}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderBottom: '1px solid #F9FAFB', transition: 'background 100ms' }}
                onMouseEnter={e => e.currentTarget.style.background = '#F8FAFF'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{book.bookName}</div>
                  <div style={{ fontSize: 11, color: '#9CA3AF' }}>Role: {book.role}</div>
                </div>
                {/* Three-dot menu per book — uses position:fixed to escape overflow:hidden */}
                <div style={{ position: 'relative' }}>
                  <button
                    data-book-dot-btn
                    onClick={e => {
                      e.stopPropagation();
                      const rect = e.currentTarget.getBoundingClientRect();
                      setBookMenuPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
                      setBookMenuOpen(prev => prev === book.bookId ? null : book.bookId);
                    }}
                    style={{ width: 28, height: 28, border: 'none', background: bookMenuOpen === book.bookId ? '#F3F4F6' : 'none', cursor: 'pointer', color: '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, fontSize: 18, flexShrink: 0 }}
                    onMouseEnter={e => { if (bookMenuOpen !== book.bookId) e.currentTarget.style.background = '#F3F4F6'; }}
                    onMouseLeave={e => { if (bookMenuOpen !== book.bookId) e.currentTarget.style.background = 'none'; }}>
                    ⋮
                  </button>
                  {bookMenuOpen === book.bookId && (
                    <div data-book-dot-menu
                      style={{ position: 'fixed', top: bookMenuPos.top, right: bookMenuPos.right, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8, boxShadow: '0 6px 20px rgba(0,0,0,0.14)', zIndex: 9999, minWidth: 165, overflow: 'hidden' }}>
                      <div
                        onClick={() => { setBookChangeRoleTarget({ bookId: book.bookId, bookName: book.bookName, currentRole: book.role }); setBookMenuOpen(null); }}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', fontSize: 13, color: '#374151', cursor: 'pointer' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        Change Role
                      </div>
                      <div
                        onClick={() => { setBookRemoveConfirm({ bookId: book.bookId, bookName: book.bookName }); setBookMenuOpen(null); }}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', fontSize: 13, color: '#DC2626', cursor: 'pointer' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#FFF5F5'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                        Remove from Book
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions — only for non-owner members */}
      {!isOwner && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Actions</div>
          <div style={{ border: '1px solid #E5E7EB', borderRadius: 12, background: '#fff', overflow: 'hidden' }}>
            <div onClick={() => setShowChangeRole(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: '1px solid #F3F4F6', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </div>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#2563EB' }}>Change Role</span>
            </div>
            <div onClick={() => setShowRemoveConfirm(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background = '#FFF5F5'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {isPending ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                )}
              </div>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#DC2626' }}>{isPending ? 'Cancel Invitation' : 'Remove from business'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showChangeRole && (
        <ChangeRoleModal
          member={member}
          onUpdate={(fields) => { onUpdate(fields); setShowChangeRole(false); }}
          onClose={() => setShowChangeRole(false)}
        />
      )}
      {showRemoveConfirm && (
        <RemoveConfirmModal
          member={member}
          onRemove={onRemove}
          onClose={() => setShowRemoveConfirm(false)}
        />
      )}
      {showAddToBooks && (
        <AddToBooksDrawer
          member={member}
          currentBusinessId={currentBusinessId}
          memberBooks={memberBooks}
          onBooksAdded={refreshBooks}
          onClose={() => setShowAddToBooks(false)}
        />
      )}
      {toast && <Toast message={toast} onHide={() => setToast(null)} />}

      {/* Book change role panel */}
      {bookChangeRoleTarget && (
        <BookChangeRolePanel
          memberName={member.name}
          bookId={bookChangeRoleTarget.bookId}
          bookName={bookChangeRoleTarget.bookName}
          currentRole={bookChangeRoleTarget.currentRole}
          businessId={currentBusinessId}
          memberId={member.id}
          onClose={() => setBookChangeRoleTarget(null)}
          onRoleUpdated={handleBookRoleUpdated}
        />
      )}

      {/* Book remove confirm modal */}
      {bookRemoveConfirm && (
        <>
          <div onClick={() => setBookRemoveConfirm(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 600 }} />
          <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 700, padding: 16 }}>
            <div style={{ width: '100%', maxWidth: 420, background: '#fff', borderRadius: 14, boxShadow: '0 20px 60px rgba(0,0,0,0.18)', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 16px', borderBottom: '1px solid #F3F4F6' }}>
                <span style={{ fontSize: 16, fontWeight: 500, color: '#111827' }}>Remove from Book?</span>
                <button onClick={() => setBookRemoveConfirm(null)} style={{ width: 28, height: 28, border: 'none', background: 'none', cursor: 'pointer', color: '#6B7280', fontSize: 20, lineHeight: 1, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
              </div>
              <div style={{ padding: '16px 24px 20px' }}>
                <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.6 }}>
                  Remove <strong>{member.name}</strong> from <strong>"{bookRemoveConfirm.bookName}"</strong>?<br />
                  They will lose access to this book.
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, padding: '14px 24px', borderTop: '1px solid #F3F4F6' }}>
                <button onClick={() => setBookRemoveConfirm(null)}
                  style={{ padding: '9px 22px', borderRadius: 7, border: '1px solid #D1D5DB', background: '#fff', fontSize: 14, fontWeight: 500, color: '#374151', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button onClick={() => handleRemoveFromBook(bookRemoveConfirm.bookId)}
                  style={{ padding: '9px 28px', borderRadius: 7, background: '#DC2626', color: '#fff', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                  Remove
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Constants ─────────────────────────────────────────────── */
const ALL_EXTRA_FILTERS     = [{ key: 'inviteStatus', label: 'Invite Status' }];
const INVITE_STATUS_OPTIONS = [{ value: 'Pending', label: 'Pending' }, { value: 'Accepted', label: 'Accepted' }];
const WALLET_OPTIONS        = ['Not Issued', 'Issued', 'Pending KYC', 'Paused', 'Active', 'Inactive', 'Deactivated'].map(v => ({ value: v, label: v }));

/* ─── Main ─────────────────────────────────────────────────── */
/* ─── Business-level roles & permissions (reference: web.cashbook.in) ─── */
const BUSINESS_ROLES = [
  {
    key: 'Primary Admin',
    info: 'Each business can have only one Primary Admin',
    permissions: [
      'Full access to all books of this business',
      'Full access to business settings',
      'Add/remove members in business',
      'Full access to payment settings',
      'Full access to payments dashboard',
      'Receive OTP for funds disbursal from virtual account to UPI wallets',
    ],
    restrictions: [],
  },
  {
    key: 'Admin',
    permissions: [
      'Full access to all books of this business',
      'Full access to business settings',
      'Add/remove members in business',
      'Full access to payment settings',
      'Access to payments dashboard',
      'Send money to member wallets',
      'Pay via UPI from wallet if issued',
    ],
    restrictions: [
      "Can't delete business",
      "Can't remove Primary Admin from business",
    ],
  },
  {
    key: 'Manager',
    permissions: [
      'Limited access to assigned books.',
      'Primary Admin/Admin can assign Book Admin, Viewer or Operator role to Manager in any book.',
      'Manage team members wallet settings and transactions.',
      'Can leave business from business settings',
      'Access to payments dashboard',
      'Pay via UPI from wallet if issued',
    ],
    restrictions: [
      'No access to books they are not part of',
      'No access to payment settings',
      'No option to delete books',
      'No option to Invite users or issue Wallets',
    ],
  },
  {
    key: 'Employee',
    permissions: [
      'Limited access to assigned books.',
      'Add and view entries in books assigned to them.',
      'Access to payments dashboard',
      'Pay via UPI from wallet if issued',
    ],
    restrictions: [
      'No access to books they are not part of',
      'No access to business settings',
      'No access to payment settings',
      'No option to Invite users or issue Wallets',
    ],
  },
];



export default function TeamPage() {
  const { user, currentBusinessId, currentBusiness, businesses } = useApp();

  const [members, setMembers]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);
  const [accepting, setAccepting]     = useState(false);
  const [tab, setTab]                 = useState('all');
  const [search, setSearch]           = useState('');
  const [openDropdown, setOpenDropdown]     = useState(null);
  const [roleFilter, setRoleFilter]         = useState(null);
  const [reportsToFilter, setReportsToFilter] = useState([]);
  const [walletFilter, setWalletFilter]     = useState(null);
  const [addedFilters, setAddedFilters]     = useState([]);
  const [inviteStatusFilter, setInviteStatusFilter] = useState(null);
  const [selected, setSelected]       = useState([]);
  const [showInvite, setShowInvite]   = useState(false);
  const [showRoles, setShowRoles]     = useState(false);
  const [editingEmpId, setEditingEmpId] = useState(null); // { memberId, value }

  // Load members from API
  useEffect(() => {
    if (!currentBusinessId) return;
    setLoading(true);
    api.team.list(currentBusinessId)
      .then(({ members: list }) => setMembers(list))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [currentBusinessId]);

  // Update a member field both on API and in local state.
  // Owner (Primary Admin) can edit only their own Employee ID — the backend
  // stores it on the user record and ignores role/reports_to for the owner.
  const updateMemberField = async (member, fields) => {
    await api.team.update(currentBusinessId, member.id, fields).catch(() => {});
    setMembers(prev => prev.map(m => m.id === member.id ? { ...m, ...fields } : m));
    if (selectedMember?.id === member.id) setSelectedMember(prev => ({ ...prev, ...fields }));
  };

  // Invite / add a new member
  const handleInvite = async (data) => {
    const { member } = await api.team.add(currentBusinessId, data);
    if (member) { setMembers(prev => [...prev, member]); }
  };

  // Remove a member
  const handleRemove = async (member) => {
    if (member.is_owner) return;
    await api.team.remove(currentBusinessId, member.id).catch(() => {});
    setMembers(prev => prev.filter(m => m.id !== member.id));
    setSelectedMember(null);
  };

  // Close dropdown on outside click
  useEffect(() => {
    if (!openDropdown) return;
    const h = () => setOpenDropdown(null);
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [openDropdown]);

  const handleAcceptInvite = async (bizId) => {
    try {
      setAccepting(true);
      await api.businesses.acceptInvite(bizId);
      window.location.href = `/businesses/${bizId}/cashbooks`;
    } catch (err) {
      alert(err.message || 'Failed to accept invitation');
      setAccepting(false);
    }
  };

  // Derived — use reports_to (API field) for "your team" filter
  const yourTeamMembers  = members.filter(m => m.is_owner || m.reports_to === (members.find(x => x.is_owner)?.id));
  const allMembersCount  = members.length;
  const yourTeamCount    = yourTeamMembers.length;
  const displayedByTab   = tab === 'all' ? members : yourTeamMembers;

  const filtered = displayedByTab.filter(m => {
    if (search) {
      const q = search.toLowerCase();
      if (!( (m.name || '').toLowerCase().includes(q) ||
             (m.mobile || '').includes(search)        ||
             (m.employee_id || '').includes(search)   )) return false;
    }
    if (roleFilter && m.role !== roleFilter) return false;
    if (reportsToFilter.length) {
      const matchNone = reportsToFilter.includes('none') && m.reports_to === null;
      const matchMgr  = reportsToFilter.some(id => id !== 'none' && m.reports_to === id);
      if (!matchNone && !matchMgr) return false;
    }
    if (walletFilter && (m.walletStatus || 'Not Issued') !== walletFilter) return false;
    if (inviteStatusFilter && m.invite_status !== inviteStatusFilter) return false;
    return true;
  });

  const acceptedFiltered = filtered.filter(m => m.invite_status !== 'Pending');
  const pendingFiltered = filtered.filter(m => m.invite_status === 'Pending');

  const allSelected      = acceptedFiltered.length > 0 && selected.length === acceptedFiltered.length;
  const uniqueRoles      = [...new Set(members.map(m => m.role))].map(r => ({ value: r, label: r }));
  const reportsToOptions = [
    { value: 'none', label: 'None' },
    ...members.map(m => ({
      value:    m.id,
      label:    m.is_owner ? `${m.name} (You)` : m.name,
      sublabel: `(${m.role})`,
    })),
  ];
  const availableToAdd = ALL_EXTRA_FILTERS.filter(f => !addedFilters.includes(f.key));

  const toggleDropdown = (key) => setOpenDropdown(prev => prev === key ? null : key);

  // ── Employee Info panel view ──────────────────────────────
  if (selectedMember !== null) {
    return (
      <EmployeeInfoPanel
        member={selectedMember}
        members={members}
        currentBusinessId={currentBusinessId}
        onBack={() => setSelectedMember(null)}
        onUpdate={(fields) => updateMemberField(selectedMember, fields)}
        onRemove={() => handleRemove(selectedMember)}
      />
    );
  }

  return (
    <div style={{ padding: '24px 28px' }}>
      <h1 style={{ fontSize: 22, fontWeight: 500, marginBottom: 20, color: '#111827' }}>Team</h1>

      {businesses?.filter(b => b.my_invite_status === 'Pending').map(b => (
        <div key={b.id} style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: 24, marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, background: '#DBEAFE', color: '#2563EB', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: '#111827', marginBottom: 4 }}>You're Invited!</h2>
              <p style={{ fontSize: 14, color: '#4B5563' }}>You have been invited to join <strong>{b.name}</strong> on CashBook.</p>
            </div>
          </div>
          <button
            onClick={() => handleAcceptInvite(b.id)}
            disabled={accepting}
            style={{ padding: '10px 24px', background: '#2563EB', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: accepting ? 'not-allowed' : 'pointer', opacity: accepting ? 0.7 : 1, transition: 'background 150ms' }}
          >
            {accepting ? 'Accepting...' : 'Accept Invitation'}
          </button>
        </div>
      ))}

      {/* Top 3 cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 32 }}>
        {[
          { title: 'Invite your team', desc: 'Invite team members to CashBook, set their access, and send out invites.', onClick: () => setShowInvite(true) },
          { title: 'Member fields', desc: 'Manage employee ID, location, department and other fields.', badge: 'New' },
          { title: 'View roles & permissions', desc: 'See role based permissions and access in your organisation.', onClick: () => setShowRoles(true) },
        ].map(({ title, desc, badge, onClick }) => (
          <div key={title} onClick={onClick}
            style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: '20px', cursor: onClick ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)' }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.01)'; e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)'; e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{title}</span>
                {badge && <span style={{ padding: '2px 8px', borderRadius: 12, background: '#ECFDF5', color: '#059669', fontSize: 10, fontWeight: 600, letterSpacing: '0.02em', border: '1px solid #A7F3D0' }}>{badge}</span>}
              </div>
              <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.5, paddingRight: 8 }}>{desc}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', background: '#F9FAFB', flexShrink: 0 }}>
              <ChevronRight size={14} color="#9CA3AF" />
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--gray-200)', marginBottom: 16 }}>
        {[
          { key: 'all',  label: `All Members (${allMembersCount})` },
          { key: 'team', label: `Your Team (${yourTeamCount})` },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)}
            style={{ padding: '10px 16px', fontSize: 13, fontWeight: tab === key ? 600 : 400, color: tab === key ? 'var(--blue)' : 'var(--gray-500)', border: 'none', background: 'none', cursor: 'pointer', borderBottom: tab === key ? '2px solid var(--blue)' : '2px solid transparent', marginBottom: -1 }}>
            {label}
          </button>
        ))}
      </div>

      {/* Search + actions row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 14px', background: 'white', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', transition: 'border-color 200ms' }}
          onFocusCapture={e => e.currentTarget.style.borderColor = '#93C5FD'}
          onBlurCapture={e => e.currentTarget.style.borderColor = '#E5E7EB'}
        >
          <Search size={15} color="#9CA3AF" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, number, employee ID..."
            style={{ border: 'none', outline: 'none', flex: 1, fontSize: 13, background: 'transparent' }} />
          <span style={{ color: '#D1D5DB', fontSize: 12, fontWeight: 500 }}>/</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, border: '1px solid #E5E7EB', borderRadius: 8, background: 'white', cursor: 'pointer', color: '#6B7280', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', transition: 'all 150ms' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#F9FAFB'; e.currentTarget.style.borderColor = '#D1D5DB'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#E5E7EB'; }}
          >
            <Table2 size={15} />
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, cursor: 'pointer', background: 'white', color: '#374151', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', fontWeight: 500, transition: 'all 150ms' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#F9FAFB'; e.currentTarget.style.borderColor = '#D1D5DB'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#E5E7EB'; }}
          >
            <Download size={14} /> Download
          </button>
        </div>
      </div>

      {/* Filter pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {[
          { key: 'role',      label: 'Role',          isActive: !!roleFilter,               options: uniqueRoles,      value: roleFilter,      onChange: setRoleFilter,      multiSelect: false },
          { key: 'reportsTo', label: 'Reports To',    isActive: reportsToFilter.length > 0, options: reportsToOptions, value: reportsToFilter, onChange: setReportsToFilter, multiSelect: true },
          { key: 'wallet',    label: 'Wallet Status', isActive: !!walletFilter,             options: WALLET_OPTIONS,   value: walletFilter,    onChange: setWalletFilter,    multiSelect: false },
        ].map(pill => (
          <div key={pill.key} style={{ position: 'relative' }}>
            <button onMouseDown={e => e.stopPropagation()} onClick={() => toggleDropdown(pill.key)}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 10px', borderRadius: 6, border: `1px solid ${pill.isActive || openDropdown === pill.key ? 'var(--blue)' : 'var(--gray-200)'}`, background: pill.isActive || openDropdown === pill.key ? '#EFF6FF' : 'white', fontSize: 13, fontWeight: pill.isActive || openDropdown === pill.key ? 600 : 400, color: pill.isActive || openDropdown === pill.key ? 'var(--blue)' : 'var(--gray-700)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              {pill.label}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: pill.isActive || openDropdown === pill.key ? 'var(--blue)' : 'var(--gray-400)', transform: openDropdown === pill.key ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }}><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            {openDropdown === pill.key && (
              <FilterDropdown options={pill.options} multiSelect={pill.multiSelect} value={pill.value}
                onChange={v => { pill.onChange(v); if (!pill.multiSelect) setOpenDropdown(null); }}
                onClose={() => setOpenDropdown(null)} />
            )}
          </div>
        ))}

        {/* Dynamic added filters */}
        {addedFilters.map(key => {
          const isInvite = key === 'inviteStatus';
          const isActive = isInvite && inviteStatusFilter !== null;
          return (
            <div key={key} style={{ position: 'relative' }}>
              <button onMouseDown={e => e.stopPropagation()} onClick={() => toggleDropdown(key)}
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 10px', borderRadius: 6, border: `1px solid ${isActive || openDropdown === key ? 'var(--blue)' : 'var(--gray-200)'}`, background: isActive || openDropdown === key ? '#EFF6FF' : 'white', fontSize: 13, fontWeight: isActive || openDropdown === key ? 600 : 400, color: isActive || openDropdown === key ? 'var(--blue)' : 'var(--gray-700)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                <span onClick={e => { e.stopPropagation(); setAddedFilters(p => p.filter(f => f !== key)); if (isInvite) setInviteStatusFilter(null); }} style={{ color: 'var(--gray-400)', fontSize: 14, lineHeight: 1, marginRight: 2 }}>×</span>
                {isInvite ? 'Invite Status' : key}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: isActive || openDropdown === key ? 'var(--blue)' : 'var(--gray-400)', transform: openDropdown === key ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }}><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              {openDropdown === key && isInvite && (
                <FilterDropdown options={INVITE_STATUS_OPTIONS} multiSelect={false} value={inviteStatusFilter}
                  onChange={v => { setInviteStatusFilter(v); setOpenDropdown(null); }}
                  onClose={() => setOpenDropdown(null)} />
              )}
            </div>
          );
        })}

        {availableToAdd.length > 0 && (
          <div style={{ position: 'relative' }}>
            <button onMouseDown={e => e.stopPropagation()} onClick={() => toggleDropdown('addFilter')}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 10px', border: `1px solid ${openDropdown === 'addFilter' ? 'var(--blue)' : 'var(--gray-200)'}`, borderRadius: 6, fontSize: 13, cursor: 'pointer', background: openDropdown === 'addFilter' ? '#EFF6FF' : 'white', color: openDropdown === 'addFilter' ? 'var(--blue)' : 'var(--gray-600)', whiteSpace: 'nowrap', fontWeight: openDropdown === 'addFilter' ? 600 : 400 }}>
              <Plus size={12} /> Add Filter
            </button>
            {openDropdown === 'addFilter' && (
              <AddFilterMenu available={availableToAdd} onAdd={key => { setAddedFilters(prev => [...prev, key]); setOpenDropdown(key); }} onClose={() => setOpenDropdown(null)} />
            )}
          </div>
        )}

        {inviteStatusFilter && (
          <button onClick={() => { setInviteStatusFilter(null); setAddedFilters([]); }}
            style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#DC2626', border: 'none', background: 'none', cursor: 'pointer', padding: '4px 0' }}>
            <X size={12} /> Clear filter
          </button>
        )}
      </div>

      {/* Table */}
      <div style={{ border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              <th style={{ width: 40, padding: '12px 16px', textAlign: 'center' }}>
                <input type="checkbox" checked={allSelected}
                  onChange={e => setSelected(e.target.checked ? acceptedFiltered.map(m => m.id) : [])}
                  style={{ cursor: 'pointer', accentColor: 'var(--blue)' }} />
              </th>
              {[
                { label: 'Name' },
                { label: 'Employee ID' },
                { label: 'Email' },
                { label: 'Mobile Number' },
                { label: 'Role' },
                { label: 'Reports To', info: true },
                { label: 'Wallet Status' },
              ].map(h => (
                <th key={h.label} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    {h.label}
                    {h.info && <Info size={12} style={{ opacity: 0.6 }} />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ padding: '32px', textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>Loading members...</td></tr>
            ) : acceptedFiltered.map((m, i) => (
              <tr key={m.id}
                style={{ borderBottom: i < acceptedFiltered.length - 1 ? '1px solid #F3F4F6' : 'none', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {/* Checkbox — does not trigger row click */}
                <td style={{ padding: '14px 16px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                  <input type="checkbox" checked={selected.includes(m.id)}
                    onChange={e => setSelected(prev => e.target.checked ? [...prev, m.id] : prev.filter(id => id !== m.id))}
                    style={{ cursor: 'pointer', accentColor: 'var(--blue)' }} />
                </td>
                {/* Name */}
                <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 500, color: '#111827' }} onClick={() => setSelectedMember(m)}>
                  {m.name}
                  {m.is_owner && <span style={{ color: '#9CA3AF', fontWeight: 400, fontSize: 12 }}> (You)</span>}
                </td>
                {/* Employee ID — inline edit */}
                <td style={{ padding: '14px 16px', fontSize: 13 }} onClick={(e) => e.stopPropagation()}>
                  {editingEmpId?.memberId === m.id ? (
                    <input
                      autoFocus
                      value={editingEmpId.value}
                      onChange={(e) => setEditingEmpId(prev => ({ ...prev, value: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          updateMemberField(m, { employee_id: editingEmpId.value || null });
                          setEditingEmpId(null);
                        }
                        if (e.key === 'Escape') setEditingEmpId(null);
                      }}
                      onBlur={() => {
                        updateMemberField(m, { employee_id: editingEmpId.value || null });
                        setEditingEmpId(null);
                      }}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '5px 8px', border: '1.5px solid #2563EB', borderRadius: 5, fontSize: 13, outline: 'none', color: '#111827' }}
                    />
                  ) : m.employee_id ? (
                    <span
                      onClick={() => setEditingEmpId({ memberId: m.id, value: m.employee_id })}
                      style={{ color: '#111827', cursor: 'pointer' }}
                    >{m.employee_id}</span>
                  ) : (
                    <span
                      onClick={() => setEditingEmpId({ memberId: m.id, value: '' })}
                      style={{ color: 'var(--blue)', cursor: 'pointer', fontSize: 12, fontWeight: 500 }}
                    >Add Employee ID</span>
                  )}
                </td>
                {/* Email */}
                <td style={{ padding: '14px 16px', fontSize: 13, color: '#6B7280' }} onClick={() => setSelectedMember(m)}>
                  {m.email || '-'}
                </td>
                {/* Mobile */}
                <td style={{ padding: '14px 16px', fontSize: 13, color: '#4B5563' }} onClick={() => setSelectedMember(m)}>
                  {m.mobile || '-'}
                </td>
                {/* Role — inline dropdown for non-owners */}
                <td style={{ padding: '14px 16px' }} onClick={e => e.stopPropagation()}>
                  <InlineRoleDropdown member={m} onUpdate={(role) => updateMemberField(m, { role })} />
                </td>
                {/* Reports To — inline dropdown */}
                <td style={{ padding: '14px 16px', fontSize: 12 }} onClick={e => e.stopPropagation()}>
                  <InlineReportsToDropdown member={m} members={members} onUpdate={(reports_to) => updateMemberField(m, { reports_to })} />
                </td>
                {/* Wallet Status */}
                <td style={{ padding: '14px 16px' }} onClick={() => setSelectedMember(m)}>
                  <WalletBadge status={m.walletStatus || 'Not Issued'} />
                </td>
              </tr>
            ))}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={8} style={{ padding: '32px', textAlign: 'center', color: 'var(--gray-400)', fontSize: 13 }}>No members found</td></tr>
            )}
          </tbody>
        </table>

        {/* Pagination footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderTop: '1px solid var(--gray-100)', fontSize: 12, color: 'var(--gray-500)' }}>
          <span>Showing 1-{filtered.length} of {filtered.length} members</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button disabled style={{ padding: '4px 10px', border: '1px solid var(--gray-200)', borderRadius: 4, cursor: 'not-allowed', opacity: 0.5, background: 'white', fontSize: 13 }}>‹</button>
            <span>1 of 1 pages</span>
            <button disabled style={{ padding: '4px 10px', border: '1px solid var(--gray-200)', borderRadius: 4, cursor: 'not-allowed', opacity: 0.5, background: 'white', fontSize: 13 }}>›</button>
          </div>
          <select style={{ border: '1px solid var(--gray-200)', borderRadius: 4, padding: '3px 6px', fontSize: 12, background: 'white', cursor: 'pointer' }}>
            <option>25 members per page</option>
            <option>50 members per page</option>
          </select>
        </div>
      </div>

      {/* Pending Invites Section */}
      {pendingFiltered.length > 0 && (
        <div style={{ marginTop: 40, marginBottom: 40 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 16 }}>
            Pending Invitations
          </h3>
          <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E5E7EB', background: '#F9FAFB' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Name</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Email</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Mobile Number</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Role</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingFiltered.map((m, i) => (
                    <tr key={m.id}
                      style={{ borderBottom: i < pendingFiltered.length - 1 ? '1px solid #F3F4F6' : 'none', cursor: 'pointer' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      onClick={() => setSelectedMember(m)}
                    >
                      <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 500, color: '#111827' }}>{m.name}</td>
                      <td style={{ padding: '14px 16px', fontSize: 13, color: '#6B7280' }}>{m.email || '-'}</td>
                      <td style={{ padding: '14px 16px', fontSize: 13, color: '#4B5563' }}>{m.mobile || '-'}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <RoleBadge role={m.role} />
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 13 }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: '#FEF9C3', color: '#854D0E', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#EAB308' }} />
                          Pending Invite
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {showInvite && <AddTeamMemberPanel onClose={() => setShowInvite(false)} onInvite={handleInvite} />}
      {showRoles && <RolesPermissionsPanel roles={BUSINESS_ROLES} title="Business Roles & Permissions" myRole={currentBusiness?.my_role || 'Primary Admin'} onClose={() => setShowRoles(false)} />}
    </div>
  );
}
