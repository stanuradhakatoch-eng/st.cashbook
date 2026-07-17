import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Search, SortAsc, Plus, Pencil, Copy, UserPlus, LogOut,
  X, Check, Users, Info, BookOpen, Mail, CreditCard, MessageCircle, Smartphone, ChevronDown
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useWindowWidth } from '../../hooks/useWindowWidth';

const S = {
  page: { display: 'flex', minHeight: 'calc(100vh - var(--topbar-height))' },
  main: { flex: 1, padding: '22px 26px', minWidth: 0 },
  pageTitle: { fontSize: 22, fontWeight: 500, color: '#111827' },
  roleBanner: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '9px 16px',
    borderRadius: 6, fontSize: 14, marginBottom: 16,
  },
  controls: {
    display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14,
  },
  searchBox: {
    flex: 1, display: 'flex', alignItems: 'center', gap: 8,
    border: '1px solid #E5E7EB', borderRadius: 6,
    padding: '9px 14px', background: '#fff',
  },
  sortBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '9px 16px', border: '1px solid #E5E7EB',
    borderRadius: 6, fontSize: 14, background: '#fff',
    color: '#6B7280', cursor: 'pointer', whiteSpace: 'nowrap',
    fontWeight: 500,
  },
  bookCard: (hovered) => ({
    display: 'flex', alignItems: 'center',
    padding: '15px 18px',
    borderRadius: 8,
    border: '1px solid #E5E7EB',
    marginBottom: 8,
    background: hovered ? '#F9FAFB' : '#fff',
    cursor: 'pointer',
    transition: 'background 150ms',
  }),
  bookIcon: {
    width: 44, height: 44, borderRadius: 9,
    background: '#2563EB', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    marginRight: 16, flexShrink: 0,
  },
  bookName: { fontSize: 15, fontWeight: 600, color: '#111827' },
  bookMeta: { fontSize: 13, color: '#9CA3AF', marginTop: 3 },
  bookActions: {
    display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto',
  },
  actionIcon: () => ({
    width: 32, height: 32, borderRadius: 6,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', color: '#9CA3AF',
    background: 'transparent',
    transition: 'all 150ms',
  }),
  badge: (count) => ({
    minWidth: 30, height: 24, borderRadius: 12,
    background: count > 0 ? '#DCFCE7' : '#F3F4F6',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 12, fontWeight: 500,
    color: count > 0 ? '#16A34A' : '#6B7280',
    padding: '0 8px', marginRight: 6,
  }),
  addCta: {
    border: '1.5px dashed #D1D5DB', borderRadius: 8,
    padding: '16px 18px', marginTop: 8, background: '#FAFAFA',
    cursor: 'pointer',
  },
  addCtaRow: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 },
  quickTag: {
    display: 'inline-flex', alignItems: 'center',
    padding: '6px 16px', border: '1px solid #E5E7EB',
    borderRadius: 20, fontSize: 13, cursor: 'pointer',
    color: '#6B7280', background: '#fff',
    marginRight: 8, marginBottom: 4,
    transition: 'all 150ms',
  },
  sidebar: {
    width: 290, flexShrink: 0, padding: '20px 18px',
    borderLeft: '1px solid #F3F4F6',
  },
  addBookBtn: {
    width: '100%', padding: '13px', borderRadius: 8,
    background: '#2563EB', color: '#fff',
    fontSize: 15, fontWeight: 600, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
    marginBottom: 16, border: 'none',
  },
  sideWidget: {
    border: '1px solid #E5E7EB', borderRadius: 10,
    padding: '16px', marginBottom: 12,
  },
  widgetIcon: (bg) => ({
    width: 40, height: 40, borderRadius: 9,
    background: bg, display: 'flex',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  }),
  widgetTitle: { fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 4 },
  widgetDesc: { fontSize: 13, color: '#6B7280', marginBottom: 12, lineHeight: '1.5' },
  widgetBtn: {
    padding: '8px 18px', borderRadius: 6,
    border: '1.5px solid #2563EB', fontSize: 13,
    fontWeight: 600, cursor: 'pointer', background: '#fff',
    color: '#2563EB',
  },
  widgetLink: {
    color: '#2563EB', fontSize: 13, fontWeight: 500, cursor: 'pointer',
    textDecoration: 'none',
  },
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300,
  },
  modal: {
    background: '#fff', borderRadius: 12, padding: 24,
    minWidth: 380, boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
  },
};

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} minute${mins > 1 ? 's' : ''} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
  return `${Math.floor(hrs / 24)} days ago`;
}

function AddBookModal({ onClose, onAdd, initialName = '', existingNames = [] }) {
  const [name, setName] = useState(initialName);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const save = async () => {
    if (!name.trim() || saving) return;
    if (existingNames.includes(name.trim().toLowerCase())) {
      setError('A book with this name already exists.');
      return;
    }
    setError('');
    setSaving(true);
    try { await onAdd(name.trim()); onClose(); }
    catch (err) { alert('Failed to create book: ' + err.message); }
    finally { setSaving(false); }
  };
  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={{ ...S.modal, minWidth: 460 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 500, color: '#111827' }}>Add New Book</h3>
          <X size={18} style={{ cursor: 'pointer', color: '#9CA3AF' }} onClick={onClose} />
        </div>
        <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
          Book Name
        </label>
        <input
          autoFocus
          value={name}
          onChange={(e) => { setName(e.target.value); setError(''); }}
          placeholder="Enter book name"
          onKeyDown={(e) => { if (e.key === 'Enter') save(); }}
          style={{
            width: '100%', padding: '10px 12px', borderRadius: 6,
            border: error ? '1.5px solid #EF4444' : '1.5px solid #2563EB', fontSize: 14,
            outline: 'none', marginBottom: error ? 8 : 28, boxSizing: 'border-box',
          }}
        />
        {error && <div style={{ color: '#EF4444', fontSize: 12, marginBottom: 20 }}>{error}</div>}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={save}
            disabled={!name.trim() || saving}
            style={{
              padding: '10px 32px', borderRadius: 6,
              background: name.trim() && !saving ? '#2563EB' : '#9CA3AF',
              color: '#fff', fontSize: 14, fontWeight: 500,
              cursor: name.trim() && !saving ? 'pointer' : 'not-allowed', border: 'none',
            }}
          >{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </div>
    </div>
  );
}

function RenameModal({ book, onClose, onRename, existingNames = [] }) {
  const [name, setName] = useState(book.name);
  const [error, setError] = useState('');
  const save = () => {
    if (!name.trim()) return;
    if (name.trim().toLowerCase() !== book.name.toLowerCase() && existingNames.includes(name.trim().toLowerCase())) {
      setError('A book with this name already exists.');
      return;
    }
    setError('');
    onRename(book.id, name.trim());
    onClose();
  };
  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600 }}>Rename Book</h3>
          <X size={18} style={{ cursor: 'pointer', color: '#9CA3AF' }} onClick={onClose} />
        </div>
        <input
          autoFocus
          value={name}
          onChange={(e) => { setName(e.target.value); setError(''); }}
          onKeyDown={(e) => { if (e.key === 'Enter') save(); }}
          style={{
            width: '100%', padding: '9px 12px', borderRadius: 6,
            border: error ? '1px solid #EF4444' : '1px solid #D1D5DB', fontSize: 14,
            outline: 'none', marginBottom: error ? 8 : 16,
          }}
        />
        {error && <div style={{ color: '#EF4444', fontSize: 12, marginBottom: 16 }}>{error}</div>}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{
            padding: '8px 16px', borderRadius: 6, border: '1px solid #D1D5DB',
            fontSize: 13, cursor: 'pointer', background: '#fff',
          }}>Cancel</button>
          <button
            onClick={save}
            style={{
              padding: '8px 16px', borderRadius: 6, background: '#2563EB',
              color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none',
            }}
          >Save</button>
        </div>
      </div>
    </div>
  );
}

function DuplicateBookModal({ book, onClose, onDuplicate, existingNames = [] }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [settings, setSettings] = useState({ members: true, categories: true, paymentModes: true, party: true, customFields: true });
  const [saving, setSaving] = useState(false);
  const items = [
    { key: 'members', label: 'Members & Roles' },
    { key: 'categories', label: 'Categories' },
    { key: 'paymentModes', label: 'Payment Modes' },
    { key: 'party', label: 'Party' },
    { key: 'customFields', label: 'Custom Fields' },
  ];
  
  const save = async () => {
    if (!name.trim() || saving) return;
    if (existingNames.includes(name.trim().toLowerCase())) {
      setError('A book with this name already exists.');
      return;
    }
    setError('');
    setSaving(true);
    try { await onDuplicate(name.trim()); onClose(); }
    catch (err) { alert(err.message); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 600 }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 12, width: 480, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #F3F4F6' }}>
          <span style={{ fontSize: 16, fontWeight: 500 }}>Duplicate {book.name}</span>
          <X size={18} style={{ cursor: 'pointer', color: '#9CA3AF' }} onClick={onClose} />
        </div>
        <div style={{ padding: '10px 20px', background: '#EFF6FF', borderBottom: '1px solid #DBEAFE', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Info size={14} color="#2563EB" />
          <span style={{ fontSize: 13, color: '#374151' }}>Create new book with same settings as {book.name}</span>
        </div>
        <div style={{ padding: '20px' }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 10 }}>
              Step 1 : <span style={{ color: '#2563EB' }}>Choose New Book Name</span>
            </div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 6 }}>
              Enter new book name <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <input
              autoFocus value={name} onChange={(e) => { setName(e.target.value); setError(''); }}
              placeholder="Enter new book name"
              style={{ width: '100%', padding: '9px 12px', border: error ? '1.5px solid #EF4444' : '1.5px solid #2563EB', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
            />
            {error && <div style={{ color: '#EF4444', fontSize: 12, marginTop: 6 }}>{error}</div>}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 12 }}>
              Step 2 : <span style={{ color: '#2563EB' }}>Choose settings to duplicate</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {items.map(({ key, label }) => (
                <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 8, border: '1px solid #E5E7EB', cursor: 'pointer', background: settings[key] ? '#F8FAFF' : '#fff' }}>
                  <input type="checkbox" checked={settings[key]} onChange={() => setSettings((p) => ({ ...p, [key]: !p[key] }))} style={{ accentColor: '#2563EB', width: 16, height: 16, cursor: 'pointer' }} />
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#1F2937' }}>{label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, padding: '14px 20px', borderTop: '1px solid #F3F4F6', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 20px', borderRadius: 7, border: '1px solid #E5E7EB', background: '#fff', fontSize: 13, cursor: 'pointer', color: '#374151' }}>
            <X size={13} /> Cancel
          </button>
          <button
            disabled={!name.trim() || saving}
            onClick={save}
            style={{ padding: '9px 20px', borderRadius: 7, border: 'none', background: name.trim() ? '#2563EB' : '#E5E7EB', color: name.trim() ? '#fff' : '#9CA3AF', fontSize: 13, fontWeight: 600, cursor: name.trim() ? 'pointer' : 'not-allowed' }}
          >
            {saving ? 'Creating...' : 'Add New Book'}
          </button>
        </div>
      </div>
    </div>
  );
}

const QUICK_BOOKS = ['June Expenses', 'Staff Salary', 'Cash Journal', 'Purchase order Book'];



export default function CashbooksList() {
  const { cashbooks, addCashbook, renameCashbook, currentBusiness, acceptCashbookInvite } = useApp();
  const { user } = useAuth();
  const { businessId } = useParams();
  const isPrimaryAdmin = !currentBusiness?.my_role || currentBusiness?.my_role === 'Primary Admin';
  const navigate = useNavigate();
  const windowWidth = useWindowWidth();
  const isTablet = windowWidth <= 1024;
  const [search, setSearch] = useState('');
  const [hoveredId, setHoveredId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [prefilledName, setPrefilledName] = useState('');
  const [renameBook, setRenameBook] = useState(null);
  const [duplicateBook, setDuplicateBook] = useState(null);
  const [hoveredTag, setHoveredTag] = useState(null);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [sortBy, setSortBy] = useState('Last Updated');
  const [tempSortBy, setTempSortBy] = useState('Last Updated');

  const sortOptions = [
    'Last Updated',
    'Name (A to Z)',
    'Net Balance (High to Low)',
    'Net Balance (Low to High)',
    'Last Created'
  ];

  const pendingInvites = cashbooks.filter((b) => b.my_invite_status === 'Pending');
  const acceptedBooks = cashbooks.filter((b) => !b.my_invite_status || b.my_invite_status === 'Accepted');

  const filtered = acceptedBooks
    .filter((b) => b.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      switch (sortBy) {
        case 'Name (A to Z)':
          return a.name.localeCompare(b.name);
        case 'Net Balance (High to Low)':
          return (b.netBalance || 0) - (a.netBalance || 0);
        case 'Net Balance (Low to High)':
          return (a.netBalance || 0) - (b.netBalance || 0);
        case 'Last Created':
          return new Date(b.createdAt || b.created_at || 0).getTime() - new Date(a.createdAt || a.created_at || 0).getTime();
        case 'Last Updated':
        default:
          return new Date(b.updated_at || b.created_at || b.createdAt || 0).getTime() - new Date(a.updated_at || a.created_at || a.createdAt || 0).getTime();
      }
    });

  return (
    <div style={S.page}>
      <div style={S.main}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h1 style={S.pageTitle}>{currentBusiness?.name || 'Cashbooks'}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Show Add New Book inline on tablet (right sidebar hidden) */}
            {isTablet && isPrimaryAdmin && (
              <button
                style={{ ...S.addBookBtn, marginBottom: 0, width: 'auto', padding: '9px 18px' }}
                onClick={() => { setPrefilledName(''); setShowAdd(true); }}
              >
                <Plus size={15} />
                Add New Book
              </button>
            )}
            <div
              onClick={() => navigate(`/businesses/${businessId}/team`)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                color: '#2563EB', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                padding: '7px 14px', borderRadius: 6, border: '1px solid #BFDBFE',
                background: '#EFF6FF',
              }}
            >
              <Users size={15} />
              Business Team
            </div>
          </div>
        </div>

        {/* Role Banner */}
        <div style={{
          ...S.roleBanner,
          background: isPrimaryAdmin ? '#F0FDF4' : '#EFF6FF',
          border: `1px solid ${isPrimaryAdmin ? '#BBF7D0' : '#BFDBFE'}`,
        }}>
          <Info size={14} color={isPrimaryAdmin ? '#16A34A' : '#2563EB'} />
          <span style={{ fontSize: 13, color: '#374151' }}>
            Your Role: <strong>{currentBusiness?.my_role || 'Primary Admin'}</strong>
          </span>
          <span style={{ color: '#2563EB', cursor: 'pointer', marginLeft: 4, fontSize: 13 }}>View</span>
        </div>

        {/* Controls */}
        <div style={S.controls}>
          <div style={S.searchBox}>
            <Search size={15} color="#9CA3AF" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by book name..."
              style={{ border: 'none', outline: 'none', flex: 1, fontSize: 13, background: 'transparent', color: '#374151' }}
            />
            <span style={{ color: '#D1D5DB', fontSize: 11, fontWeight: 500, background: '#F3F4F6', padding: '1px 6px', borderRadius: 4 }}>/</span>
          </div>
          <div style={{ position: 'relative' }}>
            <button style={S.sortBtn} onClick={() => { setShowSortMenu(!showSortMenu); setTempSortBy(sortBy); }}>
              Sort By: {sortBy} <ChevronDown size={14} color="#6B7280" />
            </button>
            {showSortMenu && (
              <div style={{
                position: 'absolute', top: '100%', right: 0, marginTop: 4, width: 220,
                background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 10,
                padding: '8px 0'
              }}>
                {sortOptions.map(opt => (
                  <label key={opt} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 16px', cursor: 'pointer',
                    fontSize: 13, color: '#374151',
                  }}>
                    <input 
                      type="radio" 
                      name="sort" 
                      checked={tempSortBy === opt}
                      onChange={() => setTempSortBy(opt)}
                      style={{ accentColor: '#2563EB', cursor: 'pointer' }}
                    />
                    {opt}
                  </label>
                ))}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, padding: '10px 16px 4px', borderTop: '1px solid #F3F4F6', marginTop: 4 }}>
                  <button onClick={() => { setTempSortBy('Last Updated'); setSortBy('Last Updated'); setShowSortMenu(false); }} style={{ background: 'none', border: 'none', color: '#6B7280', fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>Clear</button>
                  <button onClick={() => { setSortBy(tempSortBy); setShowSortMenu(false); }} style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>Done</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pending Invites */}
        {pendingInvites.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            {pendingInvites.map((book) => (
              <div key={book.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px 20px', background: '#F8FAFC', border: '1px solid #E2E8F0',
                borderRadius: 8, marginBottom: 10
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB', fontWeight: 600 }}>
                    {(book.invited_by_name || 'U')[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, color: '#334155' }}>
                      <span style={{ fontWeight: 600, color: '#0F172A' }}>{book.invited_by_name || 'Someone'}</span> invites you in <span style={{ fontWeight: 600, color: '#0F172A' }}>{book.name}</span>
                    </div>
                    <div style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>
                      Role: {book.role || 'Data Operator'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => acceptCashbookInvite(book.id)}
                  style={{ padding: '8px 16px', borderRadius: 6, background: '#2563EB', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none' }}
                >
                  Accept
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Book list */}
        {filtered.map((book) => (
          <div
            key={book.id}
            style={S.bookCard(hoveredId === book.id)}
            onMouseEnter={() => setHoveredId(book.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => navigate(`/businesses/${businessId}/cashbooks/${book.id}`)}
          >
            <div style={S.bookIcon}>
              <BookOpen size={20} color="#fff" strokeWidth={2} />
            </div>
            <div>
              <div style={S.bookName}>{book.name}</div>
              <div style={S.bookMeta}>
                {(book.memberCount || 0) > 1 ? `${book.memberCount} members • ` : ''}
                Updated {timeAgo(book.updated_at || book.created_at || book.createdAt)}
              </div>
            </div>
            <div style={S.bookActions} onClick={(e) => e.stopPropagation()}>
              <div style={S.badge(book.transactionCount || 0)}>{book.transactionCount || 0}</div>
              {isPrimaryAdmin && (
                <>
                  <div
                    style={S.actionIcon()}
                    title="Rename"
                    onClick={() => setRenameBook(book)}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#2563EB'; e.currentTarget.style.background = '#EFF6FF'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#9CA3AF'; e.currentTarget.style.background = 'transparent'; }}
                  >
                    <Pencil size={14} />
                  </div>
                  <div
                    style={S.actionIcon()}
                    title="Duplicate"
                    onClick={() => setDuplicateBook(book)}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#2563EB'; e.currentTarget.style.background = '#EFF6FF'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#9CA3AF'; e.currentTarget.style.background = 'transparent'; }}
                  >
                    <Copy size={14} />
                  </div>
                </>
              )}
              <div
                style={S.actionIcon()}
                title="Book Members"
                onClick={() => navigate(`/businesses/${businessId}/cashbooks/${book.id}/settings`)}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#2563EB'; e.currentTarget.style.background = '#EFF6FF'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#9CA3AF'; e.currentTarget.style.background = 'transparent'; }}
              >
                <UserPlus size={14} />
              </div>
              {isPrimaryAdmin && (
                <div
                  style={S.actionIcon()}
                  title="Export"
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#2563EB'; e.currentTarget.style.background = '#EFF6FF'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#9CA3AF'; e.currentTarget.style.background = 'transparent'; }}
                >
                  <LogOut size={14} />
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Add New Book CTA */}
        {isPrimaryAdmin && (
          <div style={S.addCta} onClick={() => { setPrefilledName(''); setShowAdd(true); }}>
            <div style={S.addCtaRow}>
              <div style={{ width: 44, height: 44, borderRadius: 9, background: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <BookOpen size={20} color="#7C3AED" strokeWidth={2} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>Add New Book</div>
                <div style={{ fontSize: 13, color: '#9CA3AF', marginTop: 2 }}>Click to quickly add books for</div>
              </div>
            </div>
            <div>
              {QUICK_BOOKS.filter(tag => !cashbooks.some(b => b.name.toLowerCase() === tag.toLowerCase())).map((tag) => (
                <span
                  key={tag}
                  style={{
                    ...S.quickTag,
                    background: hoveredTag === tag ? '#EFF6FF' : '#fff',
                    borderColor: hoveredTag === tag ? '#93C5FD' : '#E5E7EB',
                    color: hoveredTag === tag ? '#2563EB' : '#6B7280',
                  }}
                  onMouseEnter={() => setHoveredTag(tag)}
                  onMouseLeave={() => setHoveredTag(null)}
                  onClick={(e) => { e.stopPropagation(); setPrefilledName(tag); setShowAdd(true); }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar — hidden on tablet */}
      <div style={{ ...S.sidebar, display: isTablet ? 'none' : undefined }}>
        {isPrimaryAdmin && (
          <button style={S.addBookBtn} onClick={() => { setPrefilledName(''); setShowAdd(true); }}>
            <Plus size={15} />
            Add New Book
          </button>
        )}

        {/* Missing Info Widget */}
        {(!user?.email || !user?.mobile) && (
          <div style={S.sideWidget}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
              <div style={S.widgetIcon('#DCFCE7')}>
                {!user?.email ? <Mail size={18} color="#16A34A" /> : <Smartphone size={18} color="#16A34A" />}
              </div>
              <div>
                <div style={S.widgetTitle}>
                  {!user?.email ? 'Login via Email ID' : 'Login via Mobile Number'}
                </div>
                <div style={S.widgetDesc}>
                  {!user?.email ? 'Verify email to login to desktop' : 'Verify mobile number to login to desktop'}
                </div>
              </div>
            </div>
            <button style={S.widgetBtn} onClick={() => navigate('/profile')}>
              {!user?.email ? 'Add Email' : 'Add Mobile'}
            </button>
          </div>
        )}

        {/* Tried Passbook */}
        <div style={S.sideWidget}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
            <div style={S.widgetIcon('#EFF6FF')}>
              <CreditCard size={18} color="#2563EB" />
            </div>
            <div>
              <div style={S.widgetTitle}>Tried Passbook?</div>
              <div style={S.widgetDesc}>Automatically get all online transactions at one place.</div>
            </div>
          </div>
          <a style={S.widgetLink}>Know More &gt;</a>
        </div>

        {/* Need help */}
        <div style={S.sideWidget}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
            <div style={S.widgetIcon('#DCFCE7')}>
              <MessageCircle size={18} color="#16A34A" />
            </div>
            <div>
              <div style={S.widgetTitle}>Need help in business setup?</div>
              <div style={S.widgetDesc}>Our support team will help you</div>
            </div>
          </div>
          <a style={S.widgetLink}>Contact Us &gt;</a>
        </div>
      </div>

      {showAdd && (
        <AddBookModal
          onClose={() => { setShowAdd(false); setPrefilledName(''); }}
          onAdd={addCashbook}
          initialName={prefilledName}
          existingNames={cashbooks.map((b) => b.name.toLowerCase())}
        />
      )}
      {renameBook && (
        <RenameModal
          book={renameBook}
          onClose={() => setRenameBook(null)}
          onRename={renameCashbook}
          existingNames={cashbooks.map((b) => b.name.toLowerCase())}
        />
      )}
      {duplicateBook && (
        <DuplicateBookModal
          book={duplicateBook}
          onClose={() => setDuplicateBook(null)}
          onDuplicate={addCashbook}
          existingNames={cashbooks.map((b) => b.name.toLowerCase())}
        />
      )}
    </div>
  );
}
