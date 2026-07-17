import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronDown, Search, Plus, Keyboard, LogOut, Download, X, LayoutGrid } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import AddBusinessModal from '../business/AddBusinessModal';

const S = {
  bar: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: 'var(--topbar-height)',
    background: 'var(--white)',
    borderBottom: '1px solid var(--gray-200)',
    display: 'flex',
    alignItems: 'center',
    padding: '0 16px',
    zIndex: 100,
    gap: 12,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontWeight: 500,
    fontSize: 16,
    color: 'var(--blue)',
    minWidth: 140,
    cursor: 'pointer',
  },
  logoIcon: {
    width: 28,
    height: 28,
    background: 'var(--blue)',
    borderRadius: 6,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: 13,
    fontWeight: 500,
  },
  center: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
  },
  bizBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '7px 12px 7px 10px',
    borderRadius: 8,
    border: '1px solid #E5E7EB',
    background: '#fff',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 500,
    color: '#1F2937',
    width: 260,
  },
  bizIcon: {
    width: 22,
    height: 22,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: 'var(--gray-500)',
    border: '1px solid var(--gray-200)',
  },
  userBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: 6,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    background: 'var(--blue)',
    color: 'var(--white)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    fontWeight: 600,
  },
  dropdown: {
    position: 'absolute',
    top: 'calc(var(--topbar-height) + 4px)',
    right: 12,
    background: 'var(--white)',
    border: '1px solid var(--gray-200)',
    borderRadius: 10,
    boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
    minWidth: 220,
    zIndex: 200,
    overflow: 'hidden',
  },
  bizDropdown: {
    position: 'absolute',
    top: 'calc(var(--topbar-height) + 6px)',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#fff',
    border: '1px solid #E2E8F0',
    borderRadius: 10,
    boxShadow: '0 4px 24px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)',
    width: 370,
    zIndex: 200,
    overflow: 'hidden',
  },
};

function KeyboardModal({ onClose }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--white)', borderRadius: 12, padding: '24px 32px',
          minWidth: 420, boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>Keyboard Shortcuts</h3>
          <X size={18} style={{ cursor: 'pointer', color: 'var(--gray-500)' }} onClick={onClose} />
        </div>
        <div style={{ color: 'var(--gray-600)', fontWeight: 600, marginBottom: 10, fontSize: 13 }}>Book Keeping</div>
        {[
          ['CashBooks', ['Ctrl', 'B']],
          ['Cash In', ['C', 'I']],
          ['Cash Out', ['C', 'O']],
          ['Save & move to next entry', ['Enter']],
          ['Delete Entry', ['Delete']],
        ].map(([label, keys]) => (
          <div key={label} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '8px 0', borderBottom: '1px solid var(--gray-100)', fontSize: 13,
          }}>
            <span>{label}</span>
            <div style={{ display: 'flex', gap: 4 }}>
              {keys.map((k) => (
                <kbd key={k} style={{
                  padding: '2px 8px', background: 'var(--gray-100)', borderRadius: 4,
                  fontSize: 12, fontWeight: 500, border: '1px solid var(--gray-300)',
                }}>{k}</kbd>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TopBar() {
  const { businesses, currentBusiness, setCurrentBusinessId, addBusiness, user } = useApp();
  const { logout } = useAuth();
  const { businessId } = useParams();
  const navigate = useNavigate();
  const [showBizDrop, setShowBizDrop] = useState(false);
  const [showUserDrop, setShowUserDrop] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showAddBiz, setShowAddBiz] = useState(false);
  const [bizSearch, setBizSearch] = useState('');
  const bizRef = useRef(null);
  const userRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (bizRef.current && !bizRef.current.contains(e.target)) setShowBizDrop(false);
      if (userRef.current && !userRef.current.contains(e.target)) setShowUserDrop(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const bid = businessId || currentBusiness?.id;
  const filtered = businesses.filter((b) =>
    b.name.toLowerCase().includes(bizSearch.toLowerCase())
  );

  const switchBiz = (id) => {
    setCurrentBusinessId(id);
    setShowBizDrop(false);
    navigate(`/businesses/${id}/cashbooks`);
  };

  return (
    <>
      <header style={S.bar}>
        {/* Logo */}
        <div style={S.logo} onClick={() => navigate(`/businesses/${bid}/cashbooks`)}>
          <div style={S.logoIcon}>C</div>
          <span>CASHBOOK</span>
        </div>

        {/* Business switcher */}
        <div style={S.center} ref={bizRef}>
          <button style={S.bizBtn} onClick={() => setShowBizDrop((v) => !v)}>
            <div style={S.bizIcon}>
              <LayoutGrid size={16} color="#2563EB" />
            </div>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, textAlign: 'left' }}>
              {currentBusiness?.name || 'Select Business'}
            </span>
            <ChevronDown size={14} color="#9CA3AF" style={{ flexShrink: 0 }} />
          </button>

          {showBizDrop && (
            <div style={S.bizDropdown}>
              {/* Search — first section, no header */}
              <div style={{ padding: '10px 12px', borderBottom: '1px solid #F1F5F9' }}>
                <div style={{
                  display: 'flex', alignItems: 'center',
                  padding: '9px 12px', background: '#fff',
                  borderRadius: 8, border: '1.5px solid #2563EB',
                }}>
                  <input
                    autoFocus
                    value={bizSearch}
                    onChange={(e) => setBizSearch(e.target.value)}
                    placeholder="Search Business"
                    style={{ border: 'none', background: 'none', outline: 'none', flex: 1, fontSize: 14, color: '#374151' }}
                  />
                  <Search size={16} color="#6B7280" style={{ flexShrink: 0 }} />
                </div>
              </div>

              {/* Business list */}
              <div style={{ maxHeight: 220, overflowY: 'auto' }}>
                {filtered.map((b) => {
                  const isSelected = b.id === currentBusiness?.id;
                  return (
                    <div
                      key={b.id}
                      onClick={() => switchBiz(b.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '11px 14px', cursor: 'pointer',
                        background: isSelected ? '#EEF2FF' : '#fff',
                        transition: 'background 100ms',
                      }}
                      onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = '#F8FAFC'; }}
                      onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = '#fff'; }}
                    >
                      {/* Radio button */}
                      <div style={{
                        width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                        border: `2px solid ${isSelected ? '#2563EB' : '#CBD5E1'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: isSelected ? '#2563EB' : '#fff',
                        boxSizing: 'border-box',
                      }}>
                        {isSelected && (
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />
                        )}
                      </div>
                      <span style={{ fontSize: 14, fontWeight: isSelected ? 500 : 400, color: '#0F172A' }}>
                        {b.name}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Add New Business */}
              <div style={{ padding: '12px 14px', borderTop: '1px solid #F1F5F9' }}>
                <button
                  style={{
                    width: '100%', padding: '11px 0',
                    background: '#4F6FE8', color: '#fff',
                    border: 'none', borderRadius: 8,
                    fontSize: 14, fontWeight: 600, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}
                  onClick={() => { setShowBizDrop(false); setBizSearch(''); setShowAddBiz(true); }}
                >
                  <Plus size={16} strokeWidth={2.5} />
                  Add New Business
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right actions */}
        <div style={S.right}>
          <div
            style={S.iconBtn}
            title="Keyboard Shortcuts"
            onClick={() => setShowShortcuts(true)}
          >
            <Keyboard size={16} />
          </div>

          <div ref={userRef} style={{ position: 'relative' }}>
            <div style={S.userBtn} onClick={() => setShowUserDrop((v) => !v)}>
              <div style={S.avatar}>{user.initials}</div>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{user.name}</span>
              <ChevronDown size={14} />
            </div>

            {showUserDrop && (
              <div style={S.dropdown}>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--gray-100)', display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div style={{ ...S.avatar, width: 36, height: 36, fontSize: 14 }}>{user.initials}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{user.name}</div>
                    <div style={{ color: 'var(--gray-500)', fontSize: 12 }}>{user.mobile}</div>
                    <div
                      style={{ color: 'var(--blue)', fontSize: 12, marginTop: 2, cursor: 'pointer', fontWeight: 500 }}
                      onClick={() => { setShowUserDrop(false); navigate('/profile'); }}
                    >Your Profile &gt;</div>
                  </div>
                </div>
                <div style={{ padding: '4px 0' }}>
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', cursor: 'pointer', fontSize: 13 }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gray-50)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    onClick={() => { logout(); navigate('/login'); }}
                  >
                    <LogOut size={15} color="var(--red)" />
                    <span style={{ color: 'var(--red)' }}>Logout</span>
                  </div>
                </div>
                <div style={{ padding: '8px 16px', borderTop: '1px solid var(--gray-100)' }}>
                  <div style={{ fontSize: 11, color: 'var(--gray-500)', fontWeight: 600, marginBottom: 6 }}>Mobile App</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                    <Download size={14} />
                    <span>Download App</span>
                  </div>
                </div>
                <div style={{ padding: '8px 16px', borderTop: '1px solid var(--gray-100)', fontSize: 11, color: 'var(--gray-400)', textAlign: 'center' }}>
                  © CashBook • Version 4.6.0
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {showShortcuts && <KeyboardModal onClose={() => setShowShortcuts(false)} />}
      {showAddBiz && (
        <AddBusinessModal
          onClose={() => setShowAddBiz(false)}
          onAdd={async (data) => {
            const id = await addBusiness(data);
            navigate(`/businesses/${id}/cashbooks`);
          }}
        />
      )}
    </>
  );
}
