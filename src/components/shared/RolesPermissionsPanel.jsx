import React, { useState } from 'react';
import { X, Info, CheckCircle2, XCircle } from 'lucide-react';

const DEFAULT_ROLE_STYLE = { color: '#374151', border: '#D1D5DB', bg: '#F9FAFB' };

const ROLE_TAB_STYLE = {
  'Primary Admin': { color: '#15803D', border: '#86EFAC', bg: '#F0FDF4' },
  'Admin':         { color: '#B45309', border: '#FCD34D', bg: '#FFFBEB' },
  'Manager':       { color: '#6D28D9', border: '#C4B5FD', bg: '#F5F3FF' },
  'Employee':      { color: '#374151', border: '#D1D5DB', bg: '#F9FAFB' },
  'Book Admin':    { color: '#6D28D9', border: '#C4B5FD', bg: '#F5F3FF' },
  'Data Operator': { color: '#2563EB', border: '#93C5FD', bg: '#EFF6FF' },
  'Viewer':        { color: '#4B5563', border: '#D1D5DB', bg: '#F3F4F6' },
};

export default function RolesPermissionsPanel({ roles, myRole, title = 'Roles & Permissions', onClose }) {
  const initial = roles.some((r) => r.key === myRole) ? myRole : roles[0]?.key || '';
  const [active, setActive] = useState(initial);
  const role = roles.find((r) => r.key === active) || roles[0];

  if (!role) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)' }} />
      <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 480, maxWidth: '100%', background: '#fff', boxShadow: '-4px 0 24px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', zIndex: 1101 }}>
        {/* header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #F3F4F6' }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>{title}</span>
          <button onClick={onClose} style={{ border: '1px solid #E5E7EB', background: 'white', borderRadius: 8, padding: 4, cursor: 'pointer', display: 'flex' }}>
            <X size={18} color="#6B7280" />
          </button>
        </div>

        {/* body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          {/* role tabs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
            {roles.map((r) => {
              const isAct = r.key === active;
              const st = ROLE_TAB_STYLE[r.key] || DEFAULT_ROLE_STYLE;
              const label = r.key === myRole ? `${r.key}(You)` : r.key;
              return (
                <button key={r.key} onClick={() => setActive(r.key)}
                  style={{ padding: '8px 16px', borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    border: `1px solid ${isAct ? st.border : '#E5E7EB'}`,
                    background: isAct ? st.bg : '#F3F4F6',
                    color: isAct ? st.color : '#6B7280', transition: 'all 150ms' }}>
                  {label}
                </button>
              );
            })}
          </div>

          {/* info banner */}
          {role.info && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#EEF2FF', border: '1px solid #E0E7FF', borderRadius: 8, padding: '12px 14px', marginBottom: 18 }}>
              <Info size={18} color="#4F46E5" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: '#3730A3', fontWeight: 500 }}>{role.info}</span>
            </div>
          )}

          {/* permissions */}
          {role.permissions && role.permissions.length > 0 && (
            <>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 14 }}>Permissions</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: role.restrictions && role.restrictions.length ? 24 : 0 }}>
                {role.permissions.map((p, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <CheckCircle2 size={18} color="#16A34A" style={{ flexShrink: 0, marginTop: 1 }} />
                    <span style={{ fontSize: 13, color: '#374151', lineHeight: 1.5 }}>{p}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* restrictions */}
          {role.restrictions && role.restrictions.length > 0 && (
            <>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 14 }}>Restrictions</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {role.restrictions.map((r, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <XCircle size={18} color="#DC2626" style={{ flexShrink: 0, marginTop: 1 }} />
                    <span style={{ fontSize: 13, color: '#374151', lineHeight: 1.5 }}>{r}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* footer */}
        <div style={{ padding: 16, borderTop: '1px solid #F3F4F6', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '10px 24px', background: '#2563EB', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            Ok, Got it
          </button>
        </div>
      </div>
    </div>
  );
}
