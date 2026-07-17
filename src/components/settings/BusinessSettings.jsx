import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Pencil, AlertTriangle, CheckCircle, ChevronDown, Check,
  Building2, MapPin, Users, LayoutGrid, Tag, Briefcase,
  FileText, Hash, Mail, Phone, Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

const STAFF_SIZES = ['1-10', '11-50', '51-200', '201-500', '500+'];
const CATEGORIES = [
  'Retail', 'Manufacturing', 'Services', 'Healthcare', 'Education',
  'Finance', 'Real Estate', 'Construction', 'Agriculture', 'IT & Technology',
];
const SUBCATEGORIES = {
  Retail: ['General Store', 'Clothing', 'Electronics', 'Grocery', 'Pharmacy'],
  Services: ['Consulting', 'Cleaning', 'Security', 'Logistics', 'Catering'],
  'IT & Technology': ['Software', 'Hardware', 'Networking', 'Cloud Services'],
  Manufacturing: ['Food Processing', 'Textile', 'Chemicals', 'Auto Parts'],
  Healthcare: ['Clinic', 'Hospital', 'Pharmacy', 'Diagnostic Lab'],
  Finance: ['Banking', 'Insurance', 'Investment', 'Accounting'],
  Education: ['School', 'College', 'Coaching', 'Online Courses'],
  'Real Estate': ['Residential', 'Commercial', 'Land', 'Property Management'],
  Construction: ['Building', 'Interior', 'Civil', 'MEP'],
  Agriculture: ['Farming', 'Dairy', 'Horticulture', 'Fishery'],
};
const BUSINESS_TYPES = ['B2B', 'B2C', 'B2B2C', 'D2C'];
const REG_TYPES = [
  'Sole Proprietorship', 'Partnership', 'LLP',
  'Private Limited', 'Public Limited', 'OPC',
];

/* ─── Section Card ────────────────────────────────────────────────────────── */
function SectionCard({ title, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{
        fontSize: 16, fontWeight: 500, color: '#111827',
        marginBottom: 12, paddingLeft: 4
      }}>
        {title}
      </div>
      <div style={{
        border: '1px solid #E5E7EB', borderRadius: 10,
        background: '#fff', overflow: 'visible',
      }}>
        {children}
      </div>
    </div>
  );
}

/* ─── Inline Text Field ───────────────────────────────────────────────────── */
function TextField({ icon: Icon, label, value, placeholder, onSave, type = 'text', multiline, labelBlue, isLast }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value || '');

  useEffect(() => { setVal(value || ''); }, [value]);

  const save = () => { onSave(val.trim()); setEditing(false); };
  const cancel = () => { setVal(value || ''); setEditing(false); };

  return (
    <div style={{ display: 'flex', gap: 16, padding: '16px 20px', borderBottom: isLast ? 'none' : '1px solid #F3F4F6' }}>
      <div style={{ marginTop: 2 }}>
        {Icon && <Icon size={20} color="#6B7280" />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>{label}</div>

        {editing ? (
          <div>
            {multiline ? (
              <textarea
                autoFocus
                value={val}
                onChange={(e) => setVal(e.target.value)}
                rows={3}
                style={{
                  width: '100%', boxSizing: 'border-box', padding: '10px 12px',
                  borderRadius: 6, border: '1px solid #2563EB', fontSize: 14,
                  outline: 'none', resize: 'vertical', fontFamily: 'inherit',
                  marginTop: 4,
                }}
              />
            ) : (
              <input
                autoFocus
                type={type}
                value={val}
                onChange={(e) => setVal(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') cancel(); }}
                style={{
                  width: '100%', boxSizing: 'border-box', padding: '10px 12px',
                  borderRadius: 6, border: '1px solid #2563EB', fontSize: 14, outline: 'none',
                  marginTop: 4,
                }}
              />
            )}
            <div style={{ display: 'flex', gap: 8, marginTop: 10, justifyContent: 'flex-end' }}>
              <button onClick={cancel} style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid #E5E7EB', background: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Cancel</button>
              <button onClick={save} style={{ padding: '6px 14px', borderRadius: 6, border: 'none', background: '#2563EB', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Save</button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => setEditing(true)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              cursor: 'pointer', background: 'transparent',
            }}
          >
            <div style={{ fontSize: 14, color: value ? '#111827' : '#9CA3AF', padding: '4px 0', flex: 1 }}>
              {value || placeholder}
            </div>
            <div style={{ padding: 4, cursor: 'pointer' }}>
              <Pencil size={18} color="#6B7280" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Dropdown Field ──────────────────────────────────────────────────────── */
function DropdownField({ icon: Icon, label, value, placeholder, options, onChange, labelBlue, disabled, isLast }) {
  const [open, setOpen] = useState(false);
  const [dropStyle, setDropStyle] = useState({});
  const rowRef = useRef(null);
  const dropRef = useRef(null);

  const openDropdown = () => {
    if (disabled || !rowRef.current) return;
    const rect = rowRef.current.getBoundingClientRect();
    setDropStyle({
      position: 'fixed',
      top: rect.bottom + 2,
      left: rect.left,
      width: rect.width,
      zIndex: 1000,
    });
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (
        dropRef.current && !dropRef.current.contains(e.target) &&
        rowRef.current && !rowRef.current.contains(e.target)
      ) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const select = (opt) => { onChange(opt); setOpen(false); };

  return (
    <div style={{ display: 'flex', gap: 16, padding: '16px 20px', borderBottom: isLast ? 'none' : '1px solid #F3F4F6' }}>
      <div style={{ marginTop: 2 }}>
        {Icon && <Icon size={20} color="#6B7280" />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>{label}</div>

        <div
          ref={rowRef}
          onClick={openDropdown}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            cursor: disabled ? 'not-allowed' : 'pointer', background: 'transparent',
            opacity: disabled ? 0.5 : 1,
          }}
        >
          <div style={{ fontSize: 14, color: value ? '#111827' : '#9CA3AF', padding: '4px 0', flex: 1 }}>
            {value || placeholder}
          </div>
          <div style={{ padding: 4 }}>
            <ChevronDown size={18} color="#6B7280" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }} />
          </div>
        </div>

        {open && (
          <div
            ref={dropRef}
            style={{
              ...dropStyle,
              background: '#fff', border: '1px solid #E5E7EB',
              borderRadius: 8, boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
              maxHeight: 220, overflowY: 'auto',
            }}
          >
            {options.map((opt) => (
              <div
                key={opt}
                onClick={() => select(opt)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px', cursor: 'pointer', fontSize: 13,
                  color: value === opt ? '#2563EB' : '#374151',
                  fontWeight: value === opt ? 600 : 400,
                  background: value === opt ? '#EFF6FF' : 'transparent',
                }}
                onMouseEnter={(e) => { if (value !== opt) e.currentTarget.style.background = '#F9FAFB'; }}
                onMouseLeave={(e) => { if (value !== opt) e.currentTarget.style.background = value === opt ? '#EFF6FF' : 'transparent'; }}
              >
                {opt}
                {value === opt && <Check size={14} color="#2563EB" />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Delete Business Modal ───────────────────────────────────────────────── */
function DeleteBusinessModal({ businessName, onClose, onDelete }) {
  const [typed, setTyped] = useState('');
  const confirmed = typed === businessName;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: '#fff', borderRadius: 12, width: 440, maxWidth: '94vw',
        padding: '28px 28px 24px', boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <AlertTriangle size={18} color="#DC2626" />
          </div>
          <span style={{ fontSize: 16, fontWeight: 500, color: '#DC2626' }}>Delete Business</span>
        </div>
        <p style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.6, marginBottom: 18 }}>
          This action is permanent and cannot be undone. All cashbooks, transactions, team members, and data will be permanently deleted.
        </p>
        <label style={{ display: 'block', fontSize: 12, color: '#6B7280', marginBottom: 6 }}>
          Type your business name to confirm
        </label>
        <input
          type="text"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          placeholder={businessName}
          style={{
            width: '100%', boxSizing: 'border-box',
            padding: '9px 12px', borderRadius: 6,
            border: '1px solid #E5E7EB', fontSize: 13, outline: 'none', marginBottom: 20,
          }}
        />
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{ padding: '8px 18px', borderRadius: 6, fontSize: 13, fontWeight: 600, border: '1px solid #E5E7EB', background: '#fff', color: '#374151', cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              try {
                await onDelete();
                alert('Business deleted!');
              } catch (err) {
                alert('Failed to delete business: ' + err.message);
              }
            }}
            disabled={!confirmed}
            style={{
              padding: '8px 18px', borderRadius: 6, fontSize: 13, fontWeight: 600, border: 'none',
              cursor: confirmed ? 'pointer' : 'not-allowed',
              background: confirmed ? '#DC2626' : '#E5E7EB',
              color: confirmed ? '#fff' : '#9CA3AF',
              transition: 'background 200ms, color 200ms',
            }}
          >
            Delete Business
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Change Primary Admin Modal ──────────────────────────────────────────── */
const ROLE_COLORS = {
  'Primary Admin': { bg: '#EEF2FF', color: '#4F46E5' },
  Admin: { bg: '#F0FDF4', color: '#16A34A' },
  Manager: { bg: '#FFF7ED', color: '#EA580C' },
  Employee: { bg: '#F8FAFC', color: '#64748B' },
};

function ChangeAdminModal({ teamMembers, onClose }) {
  const [step, setStep] = useState(1);
  const [selectedId, setSelectedId] = useState(null);

  const candidates = (teamMembers || []).filter((m) => !m.isYou);
  const selected = candidates.find((m) => m.id === selectedId);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: '#fff', borderRadius: 12, width: 460, maxWidth: '94vw',
        padding: '28px 28px 24px', boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
      }}>
        {step === 1 && (
          <>
            <div style={{ marginBottom: 4, fontSize: 16, fontWeight: 500, color: '#111827' }}>
              Change Primary Admin
            </div>
            <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 20 }}>
              Select a team member to transfer Primary Admin role to
            </div>

            {candidates.length === 0 ? (
              <div style={{
                padding: '20px 16px', borderRadius: 8,
                border: '1px dashed #E5E7EB',
                textAlign: 'center', fontSize: 13, color: '#9CA3AF', marginBottom: 20,
              }}>
                No other team members found. Invite team members first.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                {candidates.map((m) => {
                  const roleStyle = ROLE_COLORS[m.role] || ROLE_COLORS.Employee;
                  const isSelected = selectedId === m.id;
                  return (
                    <div
                      key={m.id}
                      onClick={() => setSelectedId(m.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '11px 14px', borderRadius: 8, cursor: 'pointer',
                        border: isSelected ? '2px solid #2563EB' : '1px solid #E5E7EB',
                        background: isSelected ? '#EFF6FF' : '#fff',
                        transition: 'border 150ms, background 150ms',
                      }}
                    >
                      <div style={{
                        width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                        border: isSelected ? '5px solid #2563EB' : '2px solid #D1D5DB',
                        background: '#fff', transition: 'border 150ms',
                      }} />
                      <div style={{
                        width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                        background: '#EFF6FF', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: 13, fontWeight: 500, color: '#2563EB',
                      }}>
                        {(m.name || '?').charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 2 }}>{m.name}</div>
                        <div style={{ fontSize: 11, color: '#9CA3AF' }}>{m.mobile || '—'}</div>
                      </div>
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
                        background: roleStyle.bg, color: roleStyle.color, flexShrink: 0,
                      }}>
                        {m.role}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={onClose} style={{ padding: '8px 18px', borderRadius: 6, fontSize: 13, fontWeight: 600, border: '1px solid #E5E7EB', background: '#fff', color: '#374151', cursor: 'pointer' }}>
                Cancel
              </button>
              <button
                onClick={() => setStep(2)}
                disabled={!selectedId}
                style={{
                  padding: '8px 18px', borderRadius: 6, fontSize: 13, fontWeight: 600, border: 'none',
                  background: selectedId ? '#2563EB' : '#E5E7EB',
                  color: selectedId ? '#fff' : '#9CA3AF',
                  cursor: selectedId ? 'pointer' : 'not-allowed',
                  transition: 'background 200ms, color 200ms',
                }}
              >
                Next
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div style={{ fontSize: 16, fontWeight: 500, color: '#111827', marginBottom: 16 }}>Are you sure?</div>
            <div style={{ background: '#EFF6FF', borderRadius: 8, padding: '12px 16px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, background: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 500, color: '#2563EB' }}>
                {selected?.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#2563EB' }}>{selected?.name}</div>
                <div style={{ fontSize: 11, color: '#93C5FD' }}>{selected?.mobile || '—'}</div>
              </div>
            </div>
            <p style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.6, marginBottom: 22 }}>
              Current Primary Admin will become a regular Admin. This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setStep(1)} style={{ padding: '8px 18px', borderRadius: 6, fontSize: 13, fontWeight: 600, border: '1px solid #E5E7EB', background: '#fff', color: '#374151', cursor: 'pointer' }}>Back</button>
              <button onClick={() => setStep(3)} style={{ padding: '8px 18px', borderRadius: 6, fontSize: 13, fontWeight: 600, border: 'none', background: '#2563EB', color: '#fff', cursor: 'pointer' }}>Confirm Transfer</button>
            </div>
          </>
        )}

        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <CheckCircle size={32} color="#16A34A" />
            </div>
            <div style={{ fontSize: 17, fontWeight: 500, color: '#111827', marginBottom: 8 }}>Transfer Initiated!</div>
            <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6, marginBottom: 24 }}>
              OTP has been sent to your registered mobile for verification.
            </p>
            <button onClick={onClose} style={{ padding: '9px 32px', borderRadius: 6, fontSize: 13, fontWeight: 600, border: 'none', background: '#2563EB', color: '#fff', cursor: 'pointer' }}>Done</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Nav Item ────────────────────────────────────────────────────────────── */
function NavItem({ active, onClick, title, subtitle }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '12px 16px', cursor: 'pointer',
        margin: '4px 12px', borderRadius: 8,
        background: active ? '#EEF2FF' : 'transparent',
      }}
    >
      <div style={{
        fontSize: 13, fontWeight: 600,
        color: active ? '#312E81' : '#111827', marginBottom: 2
      }}>
        {title}
      </div>
      <div style={{
        fontSize: 11, color: active ? '#4F46E5' : '#6B7280'
      }}>
        {subtitle}
      </div>
    </div>
  );
}

/* ─── Main Component ──────────────────────────────────────────────────────── */
export default function BusinessSettings() {
  const { currentBusiness, currentProfile, profileStrength, filledFields, totalFields, updateProfile, teamMembers, deleteBusiness } = useApp();
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState('profile');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);

  const strengthColor = profileStrength < 50 ? '#DC2626' : profileStrength < 80 ? '#D97706' : '#16A34A';
  const subcategories = SUBCATEGORIES[currentProfile?.category] || [];

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - var(--topbar-height))' }}>
      {/* Left nav */}
      <div style={{ width: 220, borderRight: '1px solid #E5E7EB', padding: '16px 0', background: '#FAFAFA', flexShrink: 0 }}>
        <NavItem
          active={activeNav === 'profile'}
          onClick={() => setActiveNav('profile')}
          title="Business Profile"
          subtitle="Edit business details"
        />
        <NavItem
          active={activeNav === 'primary'}
          onClick={() => setActiveNav('primary')}
          title="Settings"
          subtitle="Change Primary Admin or delete business"
        />
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '24px 32px', maxWidth: 680, overflowY: 'auto' }}>

        {/* ── Profile tab ── */}
        {activeNav === 'profile' && (
          <>
            {/* Profile strength card */}
            <div style={{
              border: '1px solid #E5E7EB', borderRadius: 10,
              padding: '20px', marginBottom: 24,
              background: '#fff',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 8, background: '#F3F4F6',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  {currentBusiness?.icon ? (
                    <span>{currentBusiness.icon}</span>
                  ) : (
                    <Building2 size={20} color="#4B5563" />
                  )}
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 500, color: '#111827', marginBottom: 2 }}>
                    {currentBusiness?.name || 'Business Name'}
                  </div>
                  {profileStrength < 100 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#DC2626' }}>
                      <AlertTriangle size={12} />
                      Incomplete business profile
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>
                <span>Profile Strength: <span style={{ color: strengthColor }}>{profileStrength < 50 ? 'Low' : profileStrength < 80 ? 'Medium' : 'High'}</span></span>
                <span style={{ color: strengthColor }}>{profileStrength}%</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: '#F3F4F6', width: '100%', marginBottom: (totalFields - filledFields > 0) ? 20 : 0 }}>
                <div style={{ width: `${profileStrength}%`, height: '100%', background: strengthColor, borderRadius: 3, transition: 'width 400ms' }} />
              </div>

              {/* Incomplete hint */}
              {totalFields - filledFields > 0 && (
                <div style={{
                  background: '#EEF2FF', borderRadius: 6, padding: '12px 16px',
                  fontSize: 12, color: '#312E81', display: 'flex', gap: 10, alignItems: 'center',
                }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%', background: '#6366F1',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Info size={12} color="#fff" />
                  </div>
                  <span><strong>{totalFields - filledFields} out of {totalFields}</strong> fields are incomplete. Fill these to complete your profile</span>
                </div>
              )}
            </div>

            {/* Basics */}
            <SectionCard title="Basics">
              <TextField
                icon={Building2}
                label="Business Name"
                value={currentBusiness?.name}
                placeholder="Enter business name"
                onSave={() => {}}
              />
              <TextField
                icon={MapPin}
                label="Business Address"
                value={currentProfile?.address}
                placeholder="Add business address"
                onSave={(v) => updateProfile({ address: v })}
                multiline
              />
              <DropdownField
                icon={Users}
                label="Staff Size"
                value={currentProfile?.staffSize}
                placeholder="Select staff size"
                options={STAFF_SIZES}
                onChange={(v) => updateProfile({ staffSize: v })}
                isLast
              />
            </SectionCard>

            {/* Business Info */}
            <SectionCard title="Business Info">
              <DropdownField
                icon={LayoutGrid}
                label="Business Category"
                value={currentProfile?.category}
                placeholder="Select business category"
                options={CATEGORIES}
                onChange={(v) => updateProfile({ category: v, subcategory: null })}
              />
              <DropdownField
                icon={Tag}
                label="Business Subcategory"
                value={currentProfile?.subcategory}
                placeholder={currentProfile?.category ? 'Select subcategory' : 'Select category first'}
                options={subcategories}
                onChange={(v) => updateProfile({ subcategory: v })}
                labelBlue={!!currentProfile?.subcategory}
                disabled={!subcategories.length}
              />
              <DropdownField
                icon={Briefcase}
                label="Business Type"
                value={currentProfile?.businessType}
                placeholder="Select business type"
                options={BUSINESS_TYPES}
                onChange={(v) => updateProfile({ businessType: v })}
              />
              <DropdownField
                icon={FileText}
                label="Business Registration Type"
                value={currentProfile?.registrationType}
                placeholder="Select registration type"
                options={REG_TYPES}
                onChange={(v) => updateProfile({ registrationType: v })}
                isLast
              />
            </SectionCard>

            {/* GST Info */}
            <SectionCard title="GST Info">
              <TextField
                icon={Hash}
                label="GST Number"
                value={currentProfile?.gstin}
                placeholder="Enter GSTIN (e.g. 22AAAAA0000A1Z5)"
                onSave={(v) => updateProfile({ gstin: v })}
                isLast
              />
            </SectionCard>

            {/* Communication */}
            <SectionCard title="Communication">
              <TextField
                icon={Mail}
                label="Business Email"
                value={currentProfile?.email}
                placeholder="Enter business email"
                type="email"
                onSave={(v) => updateProfile({ email: v })}
              />
              <TextField
                icon={Phone}
                label="Business Mobile Number"
                value={currentProfile?.mobile}
                placeholder="Enter business mobile"
                onSave={(v) => updateProfile({ mobile: v })}
                isLast
              />
            </SectionCard>
          </>
        )}

        {/* ── Settings tab ── */}
        {activeNav === 'primary' && (
          <>
            <h2 style={{ fontSize: 16, fontWeight: 500, marginBottom: 20, color: '#111827' }}>Settings</h2>
            <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #F3F4F6' }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, color: '#111827' }}>Change Primary Admin</div>
                <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 12 }}>
                  Transfer Primary Admin role to another team member. The current Primary Admin will become a regular Admin.
                </div>
                <button
                  onClick={() => setShowAdminModal(true)}
                  style={{ padding: '8px 16px', borderRadius: 6, background: '#2563EB', color: '#fff', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  Change Primary Admin
                </button>
              </div>
              <div style={{ padding: '16px 20px', background: '#FFF5F5' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#DC2626', marginBottom: 4 }}>Delete Business</div>
                <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 12 }}>
                  Permanently delete this business and all associated data. This action cannot be undone.
                </div>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  style={{ padding: '8px 16px', borderRadius: 6, background: '#fff', color: '#DC2626', border: '1px solid #DC2626', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  Delete Business
                </button>
              </div>
            </div>

            {showDeleteModal && (
              <DeleteBusinessModal
                businessName={currentBusiness?.name}
                onClose={() => setShowDeleteModal(false)}
                onDelete={async () => {
                  await deleteBusiness();
                  navigate('/onboarding');
                }}
              />
            )}
            {showAdminModal && (
              <ChangeAdminModal
                teamMembers={teamMembers}
                onClose={() => setShowAdminModal(false)}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
