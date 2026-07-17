import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Settings, Users, Plus, Search, ChevronDown, X,
  Info, Calendar, Clock, Paperclip, Zap, FileText, CheckSquare,
  Download, RotateCw, ZoomIn, ZoomOut, EyeOff, Trash2, MoreHorizontal,
  CheckCircle2, Minus, Pencil,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../api';

/* ─── helpers ──────────────────────────────────────────────── */
function todayStr() {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

function makeCreatedAt(dateStr, timeObj) {
  if (!timeObj) return undefined;
  let h = parseInt(timeObj.hour, 10);
  if (timeObj.period === 'PM' && h !== 12) h += 12;
  if (timeObj.period === 'AM' && h === 12) h = 0;
  const hh = h.toString().padStart(2, '0');
  const mm = timeObj.minute.padStart(2, '0');
  return new Date(`${dateStr}T${hh}:${mm}:00`).toISOString();
}

function parseTimeFromCreatedAt(createdAtStr) {
  if (!createdAtStr) return undefined; // Will fallback to initTime() if needed
  const d = new Date(createdAtStr);
  const h = d.getHours() % 12 || 12;
  const m = String(d.getMinutes()).padStart(2, '0');
  const p = d.getHours() >= 12 ? 'PM' : 'AM';
  return { hour: String(h), minute: m, period: p };
}

function formatDateTime(dateStr, createdAt) {
  const txDate = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  const isToday = txDate.toDateString() === today.toDateString();
  const isYesterday = txDate.toDateString() === yesterday.toDateString();

  const ts = createdAt ? new Date(createdAt) : txDate;
  const time = ts.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
    .toUpperCase().replace(/\s/g, ' ');

  let dateLabel;
  if (isToday) dateLabel = 'Today';
  else if (isYesterday) dateLabel = 'Yesterday';
  else dateLabel = txDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return { dateLabel, time };
}

function formatAmount(n) {
  if (n === undefined || n === null) return '—';
  const abs = Math.abs(n);
  if (abs === Math.floor(abs)) return new Intl.NumberFormat('en-IN').format(abs);
  return new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(abs);
}

function formatCurrency(n) {
  return new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2 }).format(n);
}

/* ─── Generic dropdown wrapper ─────────────────────────────── */
function FilterDropdown({ label, active, children }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '6px 10px', borderRadius: 6,
          border: `1px solid ${active ? 'var(--blue)' : 'var(--gray-200)'}`,
          background: active ? 'var(--blue-light)' : 'var(--white)',
          color: active ? 'var(--blue)' : 'var(--gray-700)',
          fontSize: 13, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap',
        }}
      >
        {label}
        <ChevronDown size={13} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: '0.15s' }} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0,
          background: 'var(--white)', border: '1px solid var(--gray-200)',
          borderRadius: 10, boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
          minWidth: 220, zIndex: 300,
        }}>
          {typeof children === 'function' ? children(() => setOpen(false)) : children}
        </div>
      )}
    </div>
  );
}

/* ─── Duration filter ──────────────────────────────────────── */
const DURATION_OPTIONS = ['All Time', 'Today', 'Yesterday', 'This Month', 'Last Month', 'Custom Range'];

function DurationFilter({ value, onChange }) {
  return (
    <FilterDropdown label={value === 'All Time' ? 'Duration: All Time' : `Duration: ${value}`} active={value !== 'All Time'}>
      {(close) => (
        <>
          <div style={{ padding: '12px 14px 4px', fontSize: 12, fontWeight: 600, color: 'var(--gray-400)' }}>DURATION</div>
          <div style={{ padding: '4px 8px' }}>
            {DURATION_OPTIONS.map((opt) => (
              <label key={opt} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 8px',
                borderRadius: 6, cursor: 'pointer',
                background: value === opt ? 'var(--blue-light)' : 'transparent',
              }}>
                <input
                  type="radio" name="duration" value={opt} checked={value === opt}
                  onChange={() => { onChange(opt); if (opt !== 'Custom Range') close(); }}
                  style={{ accentColor: 'var(--blue)' }}
                />
                <span style={{ fontSize: 13, color: value === opt ? 'var(--blue)' : 'var(--gray-700)', fontWeight: value === opt ? 600 : 400 }}>{opt}</span>
              </label>
            ))}
          </div>
          <div style={{ borderTop: '1px solid var(--gray-100)', display: 'flex', padding: '8px 12px', gap: 8, justifyContent: 'flex-end' }}>
            <button onClick={() => { onChange('All Time'); close(); }} style={{ padding: '5px 12px', borderRadius: 5, border: '1px solid var(--gray-200)', background: 'var(--white)', fontSize: 12, cursor: 'pointer', color: 'var(--gray-600)' }}>Clear</button>
            <button onClick={close} style={{ padding: '5px 14px', borderRadius: 5, border: 'none', background: 'var(--blue)', fontSize: 12, cursor: 'pointer', color: 'var(--white)', fontWeight: 600 }}>Done</button>
          </div>
        </>
      )}
    </FilterDropdown>
  );
}

/* ─── Types filter ─────────────────────────────────────────── */
const TYPE_OPTIONS = ['All', 'Cash In', 'Cash Out'];

function TypesFilter({ value, onChange }) {
  return (
    <FilterDropdown label={value === 'All' ? 'Types: All' : value} active={value !== 'All'}>
      {(close) => (
        <>
          <div style={{ padding: '12px 14px 4px', fontSize: 12, fontWeight: 600, color: 'var(--gray-400)' }}>TYPES</div>
          <div style={{ padding: '4px 8px' }}>
            {TYPE_OPTIONS.map((opt) => (
              <label key={opt} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 8px',
                borderRadius: 6, cursor: 'pointer',
                background: value === opt ? 'var(--blue-light)' : 'transparent',
              }}>
                <input
                  type="radio" name="txntype" value={opt} checked={value === opt}
                  onChange={() => { onChange(opt); }}
                  style={{ accentColor: 'var(--blue)' }}
                />
                <span style={{ fontSize: 13, color: value === opt ? 'var(--blue)' : 'var(--gray-700)', fontWeight: value === opt ? 600 : 400 }}>{opt}</span>
              </label>
            ))}
          </div>
          <div style={{ borderTop: '1px solid var(--gray-100)', display: 'flex', padding: '8px 12px', gap: 8, justifyContent: 'flex-end' }}>
            <button onClick={() => { onChange('All'); close(); }} style={{ padding: '5px 12px', borderRadius: 5, border: '1px solid var(--gray-200)', background: 'var(--white)', fontSize: 12, cursor: 'pointer', color: 'var(--gray-600)' }}>Clear</button>
            <button onClick={close} style={{ padding: '5px 14px', borderRadius: 5, border: 'none', background: 'var(--blue)', fontSize: 12, cursor: 'pointer', color: 'var(--white)', fontWeight: 600 }}>Done</button>
          </div>
        </>
      )}
    </FilterDropdown>
  );
}

/* ─── Parties filter ───────────────────────────────────────── */
function PartiesFilter({ parties, value, onChange, onGoToSettings }) {
  const [search, setSearch] = useState('');
  const shown = parties.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
  const label = value.length === 0 ? 'Parties: All' : value.length === 1 ? value[0] : `Parties: ${value.length}`;

  if (parties.length === 0) {
    return (
      <FilterDropdown label="Parties: All" active={false}>
        {(close) => (
          <div style={{ padding: 16, maxWidth: 260 }}>
            <div style={{ fontSize: 13, color: 'var(--gray-700)', lineHeight: 1.5, marginBottom: 12 }}>
              No Party Added! You can add Parties for this book from book settings page{' '}
              <span style={{ color: 'var(--blue)', cursor: 'pointer' }} onClick={() => { close(); onGoToSettings(); }}>⚙️</span>
            </div>
            <button onClick={close} style={{ padding: '6px 16px', borderRadius: 6, border: '1px solid var(--gray-200)', background: 'var(--white)', fontSize: 13, cursor: 'pointer', fontWeight: 600, color: 'var(--gray-700)' }}>
              Ok, Got it
            </button>
          </div>
        )}
      </FilterDropdown>
    );
  }

  return (
    <FilterDropdown label={label} active={value.length > 0}>
      {(close) => (
        <>
          <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--gray-100)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: 'var(--gray-50)', borderRadius: 6, border: '1px solid var(--gray-200)' }}>
              <Search size={13} color="var(--gray-400)" />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Parties..."
                style={{ border: 'none', background: 'none', outline: 'none', flex: 1, fontSize: 13 }}
              />
            </div>
          </div>
          <div style={{ maxHeight: 200, overflowY: 'auto', padding: '4px 8px' }}>
            {shown.map((p) => (
              <label key={p.name} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 8px',
                borderRadius: 6, cursor: 'pointer',
                background: value.includes(p.name) ? 'var(--blue-light)' : 'transparent',
              }}>
                <input
                  type="checkbox" checked={value.includes(p.name)}
                  onChange={(e) => onChange(e.target.checked ? [...value, p.name] : value.filter((x) => x !== p.name))}
                  style={{ accentColor: 'var(--blue)', width: 14, height: 14 }}
                />
                <span style={{ fontSize: 13, color: value.includes(p.name) ? 'var(--blue)' : 'var(--gray-700)', fontWeight: value.includes(p.name) ? 600 : 400 }}>{p.name}</span>
              </label>
            ))}
          </div>
          <div style={{ borderTop: '1px solid var(--gray-100)', display: 'flex', padding: '8px 12px', gap: 8, justifyContent: 'flex-end' }}>
            <button onClick={() => { onChange([]); close(); }} style={{ padding: '5px 12px', borderRadius: 5, border: '1px solid var(--gray-200)', background: 'var(--white)', fontSize: 12, cursor: 'pointer', color: 'var(--gray-600)' }}>Clear</button>
            <button onClick={close} style={{ padding: '5px 14px', borderRadius: 5, border: 'none', background: 'var(--blue)', fontSize: 12, cursor: 'pointer', color: 'var(--white)', fontWeight: 600 }}>Done</button>
          </div>
        </>
      )}
    </FilterDropdown>
  );
}

/* ─── Members filter ───────────────────────────────────────── */
function MembersFilter({ members, value, onChange }) {
  const [search, setSearch] = useState('');
  const filtered = members.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()));
  const label = value ? `Members: ${members.find((m) => m.id === value)?.name || ''}` : 'Members: All';

  return (
    <FilterDropdown label={label} active={!!value}>
      {(close) => (
        <>
          <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--gray-100)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: 'var(--gray-50)', borderRadius: 6, border: '1px solid var(--gray-200)' }}>
              <Search size={13} color="var(--gray-400)" />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Members"
                style={{ border: 'none', background: 'none', outline: 'none', flex: 1, fontSize: 13 }}
              />
            </div>
          </div>
          <div style={{ maxHeight: 180, overflowY: 'auto', padding: '4px 8px' }}>
            {filtered.map((m) => (
              <label key={m.id} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 8px',
                borderRadius: 6, cursor: 'pointer',
                background: value === m.id ? 'var(--blue-light)' : 'transparent',
              }}>
                <input
                  type="radio" name="member" value={m.id} checked={value === m.id}
                  onChange={() => onChange(m.id)}
                  style={{ accentColor: 'var(--blue)' }}
                />
                <div>
                  <span style={{ fontSize: 13, color: value === m.id ? 'var(--blue)' : 'var(--gray-700)', fontWeight: value === m.id ? 600 : 400 }}>{m.name}</span>
                  {m.isYou && <span style={{ fontSize: 11, color: 'var(--gray-400)', marginLeft: 4 }}>(You)</span>}
                </div>
              </label>
            ))}
          </div>
          <div style={{ borderTop: '1px solid var(--gray-100)', display: 'flex', padding: '8px 12px', gap: 8, justifyContent: 'flex-end' }}>
            <button onClick={() => { onChange(null); close(); }} style={{ padding: '5px 12px', borderRadius: 5, border: '1px solid var(--gray-200)', background: 'var(--white)', fontSize: 12, cursor: 'pointer', color: 'var(--gray-600)' }}>Clear</button>
            <button onClick={close} style={{ padding: '5px 14px', borderRadius: 5, border: 'none', background: 'var(--blue)', fontSize: 12, cursor: 'pointer', color: 'var(--white)', fontWeight: 600 }}>Done</button>
          </div>
        </>
      )}
    </FilterDropdown>
  );
}

/* ─── Payment Modes filter ─────────────────────────────────── */
function PaymentModesFilter({ modes, value, onChange }) {
  const [search, setSearch] = useState('');
  const shown = modes.filter((m) => m.toLowerCase().includes(search.toLowerCase()));
  const label = value.length === 0 ? 'Payment Modes: All' : value.length === 1 ? value[0] : `Payment Modes: ${value.length}`;

  return (
    <FilterDropdown label={label} active={value.length > 0}>
      {(close) => (
        <>
          <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--gray-100)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: 'var(--gray-50)', borderRadius: 6, border: '1px solid var(--gray-200)' }}>
              <Search size={13} color="var(--gray-400)" />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Payment Modes..."
                style={{ border: 'none', background: 'none', outline: 'none', flex: 1, fontSize: 13 }}
              />
            </div>
          </div>
          <div style={{ padding: '4px 8px', maxHeight: 200, overflowY: 'auto' }}>
            {shown.length === 0 ? (
              <div style={{ padding: '12px 8px', fontSize: 13, color: 'var(--gray-400)', textAlign: 'center' }}>No payment modes found</div>
            ) : shown.map((m) => (
              <label key={m} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 8px',
                borderRadius: 6, cursor: 'pointer',
                background: value.includes(m) ? 'var(--blue-light)' : 'transparent',
              }}>
                <input
                  type="checkbox" checked={value.includes(m)}
                  onChange={(e) => onChange(e.target.checked ? [...value, m] : value.filter((x) => x !== m))}
                  style={{ accentColor: 'var(--blue)', width: 14, height: 14 }}
                />
                <span style={{ fontSize: 13, color: value.includes(m) ? 'var(--blue)' : 'var(--gray-700)', fontWeight: value.includes(m) ? 600 : 400 }}>{m}</span>
              </label>
            ))}
          </div>
          <div style={{ borderTop: '1px solid var(--gray-100)', display: 'flex', padding: '8px 12px', gap: 8, justifyContent: 'flex-end' }}>
            <button onClick={() => { onChange([]); close(); }} style={{ padding: '5px 12px', borderRadius: 5, border: '1px solid var(--gray-200)', background: 'var(--white)', fontSize: 12, cursor: 'pointer', color: 'var(--gray-600)' }}>Clear</button>
            <button onClick={close} style={{ padding: '5px 14px', borderRadius: 5, border: 'none', background: 'var(--blue)', fontSize: 12, cursor: 'pointer', color: 'var(--white)', fontWeight: 600 }}>Done</button>
          </div>
        </>
      )}
    </FilterDropdown>
  );
}

/* ─── Categories filter ─────────────────────────────────────── */
function CategoriesFilter({ categories, value, onChange }) {
  const [search, setSearch] = useState('');
  const shown = categories.filter((c) => c.toLowerCase().includes(search.toLowerCase()));
  const label = value.length === 0 ? 'Categories: All' : value.length === 1 ? value[0] : `Categories: ${value.length}`;

  if (categories.length === 0) {
    return <FilterDropdown label="Categories: All" active={false}>{(close) => (
      <div style={{ padding: 16, maxWidth: 240 }}>
        <div style={{ fontSize: 13, color: 'var(--gray-500)', lineHeight: 1.5, marginBottom: 10 }}>No categories in this book yet. Add transactions with a category to filter here.</div>
        <button onClick={close} style={{ padding: '5px 14px', borderRadius: 6, border: '1px solid var(--gray-200)', background: 'var(--white)', fontSize: 13, cursor: 'pointer', fontWeight: 600, color: 'var(--gray-700)' }}>Ok, Got it</button>
      </div>
    )}</FilterDropdown>;
  }

  return (
    <FilterDropdown label={label} active={value.length > 0}>
      {(close) => (
        <>
          <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--gray-100)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: 'var(--gray-50)', borderRadius: 6, border: '1px solid var(--gray-200)' }}>
              <Search size={13} color="var(--gray-400)" />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Categories..."
                style={{ border: 'none', background: 'none', outline: 'none', flex: 1, fontSize: 13 }}
              />
            </div>
          </div>
          <div style={{ padding: '4px 8px', maxHeight: 200, overflowY: 'auto' }}>
            {shown.map((c) => (
              <label key={c} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 8px',
                borderRadius: 6, cursor: 'pointer',
                background: value.includes(c) ? 'var(--blue-light)' : 'transparent',
              }}>
                <input
                  type="checkbox" checked={value.includes(c)}
                  onChange={(e) => onChange(e.target.checked ? [...value, c] : value.filter((x) => x !== c))}
                  style={{ accentColor: 'var(--blue)', width: 14, height: 14 }}
                />
                <span style={{ fontSize: 13, color: value.includes(c) ? 'var(--blue)' : 'var(--gray-700)', fontWeight: value.includes(c) ? 600 : 400 }}>{c}</span>
              </label>
            ))}
          </div>
          <div style={{ borderTop: '1px solid var(--gray-100)', display: 'flex', padding: '8px 12px', gap: 8, justifyContent: 'flex-end' }}>
            <button onClick={() => { onChange([]); close(); }} style={{ padding: '5px 12px', borderRadius: 5, border: '1px solid var(--gray-200)', background: 'var(--white)', fontSize: 12, cursor: 'pointer', color: 'var(--gray-600)' }}>Clear</button>
            <button onClick={close} style={{ padding: '5px 14px', borderRadius: 5, border: 'none', background: 'var(--blue)', fontSize: 12, cursor: 'pointer', color: 'var(--white)', fontWeight: 600 }}>Done</button>
          </div>
        </>
      )}
    </FilterDropdown>
  );
}

/* ─── SearchSelectDropdown ──────────────────────────────────── */
function SearchSelectDropdown({ value, onChange, placeholder = 'Search or Select', fixedOptions = [], suggestions = [], parties = [], addLabel, onAdd, importLabel, onImport, error }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const allItems = [...fixedOptions, ...parties];
  const filteredFixed = fixedOptions.filter((o) => o.toLowerCase().includes(search.toLowerCase()));
  const filteredSugg = suggestions.filter((o) => o.toLowerCase().includes(search.toLowerCase()) && !fixedOptions.includes(o));
  const filteredParties = parties.filter((o) => o.toLowerCase().includes(search.toLowerCase()));
  const noResults = filteredFixed.length === 0 && filteredSugg.length === 0 && filteredParties.length === 0;

  const select = (v) => { onChange(v); setOpen(false); setSearch(''); };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          border: `1px solid ${error ? '#DC2626' : open ? 'var(--blue)' : 'var(--gray-200)'}`,
          borderRadius: 8, padding: '8px 10px', cursor: 'pointer', background: 'var(--white)',
        }}
      >
        <span style={{ fontSize: 13, color: value ? 'var(--gray-800)' : 'var(--gray-400)', flex: 1 }}>
          {value || placeholder}
        </span>
        {value && (
          <X
            size={12}
            style={{ color: 'var(--gray-400)', marginRight: 4, cursor: 'pointer' }}
            onClick={(e) => { e.stopPropagation(); onChange(''); }}
          />
        )}
        <ChevronDown size={13} color="var(--gray-400)" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: '0.15s', flexShrink: 0 }} />
      </div>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 3px)', left: 0, right: 0,
          background: 'var(--white)', border: '1px solid var(--gray-200)',
          borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          zIndex: 600, overflow: 'hidden',
        }}>
          {/* Search */}
          <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--gray-100)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 8px', background: 'var(--gray-50)', borderRadius: 6, border: '1px solid var(--gray-200)' }}>
              <Search size={12} color="var(--gray-400)" />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={placeholder}
                style={{ border: 'none', background: 'none', outline: 'none', fontSize: 13, flex: 1 }}
              />
            </div>
          </div>

          <div style={{ maxHeight: 200, overflowY: 'auto' }}>
            {/* Fixed options (no header) */}
            {filteredFixed.map((opt) => (
              <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', cursor: 'pointer' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gray-50)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <input type="radio" checked={value === opt} onChange={() => select(opt)} style={{ accentColor: 'var(--blue)' }} />
                <span style={{ fontSize: 13, color: 'var(--gray-700)' }}>{opt}</span>
              </label>
            ))}

            {/* Party items (no suggestions header) */}
            {filteredParties.map((opt) => (
              <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', cursor: 'pointer' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gray-50)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <input type="radio" checked={value === opt} onChange={() => select(opt)} style={{ accentColor: 'var(--blue)' }} />
                <span style={{ fontSize: 13, color: 'var(--gray-700)' }}>{opt}</span>
              </label>
            ))}

            {/* Suggestions section */}
            {filteredSugg.length > 0 && (
              <>
                <div style={{ padding: '6px 12px 2px', fontSize: 11, fontWeight: 500, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Suggestions</div>
                {filteredSugg.map((opt) => (
                  <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', cursor: 'pointer' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gray-50)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <input type="radio" checked={value === opt} onChange={() => select(opt)} style={{ accentColor: 'var(--blue)' }} />
                    <span style={{ fontSize: 13, color: 'var(--gray-700)' }}>{opt}</span>
                  </label>
                ))}
              </>
            )}

            {/* No results */}
            {noResults && (
              <div style={{ padding: '16px 12px', textAlign: 'center', fontSize: 13, color: 'var(--gray-400)' }}>
                No results found
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div style={{ borderTop: '1px solid var(--gray-100)' }}>
            {addLabel && (
              <button
                onClick={() => { onAdd && onAdd(search); setOpen(false); setSearch(''); }}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', border: 'none', background: 'var(--white)', fontSize: 13, color: 'var(--blue)', fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--blue-light)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'var(--white)'}
              >
                <Plus size={13} /> {addLabel}
              </button>
            )}
            {importLabel && (
              <button
                onClick={() => { onImport && onImport(); setOpen(false); setSearch(''); }}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', border: 'none', background: '#F0FDF4', fontSize: 13, color: '#16A34A', fontWeight: 500, cursor: 'pointer', textAlign: 'left', borderTop: '1px solid var(--gray-100)' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#DCFCE7'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#F0FDF4'}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                {importLabel}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Time picker (hour / minute / period dropdowns) ───────── */
function TimePicker({ hour, minute, period, onChange }) {
  const Sel = ({ val, opts, field }) => (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <select
        value={val}
        onChange={(e) => onChange(field, e.target.value)}
        style={{
          appearance: 'none', border: '1px solid var(--gray-200)', borderRadius: 6,
          padding: '6px 24px 6px 10px', fontSize: 13, fontWeight: 600,
          color: 'var(--gray-700)', background: 'var(--white)', cursor: 'pointer', outline: 'none',
        }}
      >
        {opts.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown size={11} style={{ position: 'absolute', right: 6, pointerEvents: 'none', color: 'var(--gray-400)' }} />
    </div>
  );

  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1));
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <Sel val={hour} opts={hours} field="hour" />
      <Sel val={minute} opts={minutes} field="minute" />
      <Sel val={period} opts={['AM', 'PM']} field="period" />
    </div>
  );
}

/* ─── Add New Party Modal ───────────────────────────────────── */
function AddPartyModal({ onSave, onClose }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [partyType, setPartyType] = useState('Customer');

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 700 }}
      onClick={onClose}
    >
      <div
        style={{ background: 'var(--white)', borderRadius: 12, width: 460, boxShadow: '0 20px 60px rgba(0,0,0,0.25)', overflow: 'hidden' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--gray-100)' }}>
          <span style={{ fontSize: 16, fontWeight: 500, color: 'var(--gray-900)' }}>Add New Party</span>
          <X size={18} style={{ cursor: 'pointer', color: 'var(--gray-500)' }} onClick={onClose} />
        </div>

        {/* Import CSV banner */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 20px', background: '#F0FDF4', borderBottom: '1px solid #DCFCE7', cursor: 'pointer' }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#DCFCE7'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#F0FDF4'}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <rect width="24" height="24" rx="4" fill="#16A34A" />
            <path d="M7 7h4v10H7zm6 0h4v10h-4z" fill="white" opacity="0.3" />
            <path d="M5 12h14M12 5v14" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#16A34A', flex: 1 }}>Import all parties in bulk via CSV</span>
          <span style={{ fontSize: 10, fontWeight: 500, padding: '2px 7px', borderRadius: 4, background: '#16A34A', color: 'white' }}>New</span>
          <span style={{ fontSize: 16, fontWeight: 500, color: '#16A34A', letterSpacing: -2 }}>&raquo;</span>
        </div>

        {/* Form */}
        <div style={{ padding: '20px 20px 4px' }}>
          {/* Party Name */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-700)', display: 'block', marginBottom: 6 }}>
              Party Name <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rajesh, Vivek, Saif, John"
              style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--gray-200)', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--blue)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--gray-200)'}
            />
          </div>

          {/* Email */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-700)', display: 'block', marginBottom: 6 }}>
              Email <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--gray-400)' }}>(Optional)</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. party@gmail.com"
              style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--gray-200)', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--blue)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--gray-200)'}
            />
          </div>

          {/* Party Type */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-700)', display: 'block', marginBottom: 8 }}>Party Type</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {['Customer', 'Supplier'].map((t) => (
                <button
                  key={t}
                  onClick={() => setPartyType(t)}
                  style={{
                    padding: '6px 18px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    border: `1px solid ${partyType === t ? 'var(--blue)' : 'var(--gray-200)'}`,
                    background: partyType === t ? 'var(--blue-light)' : 'var(--white)',
                    color: partyType === t ? 'var(--blue)' : 'var(--gray-600)',
                    transition: 'all 0.15s',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={() => {
              if (!name.trim()) return;
              onSave({ name: name.trim(), email: email.trim() || null, partyType });
              onClose();
            }}
            disabled={!name.trim()}
            style={{
              padding: '9px 32px', borderRadius: 8, border: 'none', fontSize: 14, fontWeight: 500,
              background: name.trim() ? 'var(--blue)' : 'var(--gray-200)',
              color: name.trim() ? 'white' : 'var(--gray-400)',
              cursor: name.trim() ? 'pointer' : 'not-allowed',
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Entry Panel (right slide-over) ───────────────────────── */
const CATEGORY_SUGGESTIONS = ['Salary', 'Sale', 'Bonus', 'Income From Rent', 'Purchase', 'Expense', 'Transport'];
const PAYMENT_FIXED = ['Cash', 'Online', 'PhonePe'];
const PAYMENT_SUGGESTIONS = ['Paytm', 'Google Pay', 'NEFT', 'RTGS', 'Cheque'];

function initTime() {
  const d = new Date();
  const h = d.getHours() % 12 || 12;
  const m = String(d.getMinutes()).padStart(2, '0');
  const p = d.getHours() >= 12 ? 'PM' : 'AM';
  return { hour: String(h), minute: m, period: p };
}

/* ─── Add Custom Field Modal ──────────────────────────────────── */
function AddCustomFieldModal({ title, placeholder, initialValue, onSave, onClose }) {
  const [val, setVal] = useState(initialValue || '');
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'var(--white)', borderRadius: 12, width: 360, boxShadow: '0 20px 60px rgba(0,0,0,0.25)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--gray-100)' }}>
          <h3 style={{ margin: 0, fontSize: 16, color: 'var(--gray-800)', fontWeight: 600 }}>{title}</h3>
          <X size={18} color="var(--gray-400)" style={{ cursor: 'pointer' }} onClick={onClose} />
        </div>
        <div style={{ padding: '20px' }}>
          <input
            autoFocus
            type="text"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            placeholder={placeholder}
            style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--gray-200)', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
            onFocus={(e) => e.target.style.borderColor = 'var(--blue)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--gray-200)'}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && val.trim()) onSave(val.trim());
              if (e.key === 'Escape') onClose();
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: 10, padding: '16px 20px', borderTop: '1px solid var(--gray-100)', background: 'var(--gray-50)' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px 0', borderRadius: 8, background: 'var(--white)', border: '1px solid var(--gray-200)', color: 'var(--gray-700)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          <button onClick={() => val.trim() && onSave(val.trim())} disabled={!val.trim()} style={{ flex: 1, padding: '10px 0', borderRadius: 8, background: val.trim() ? 'var(--blue)' : 'var(--gray-200)', border: 'none', color: val.trim() ? 'white' : 'var(--gray-400)', fontSize: 13, fontWeight: 600, cursor: val.trim() ? 'pointer' : 'not-allowed' }}>Save</button>
        </div>
      </div>
    </div>
  );
}

/* ─── File Preview Modal ──────────────────────────────────────── */
function FilePreviewModal({ url, onClose }) {
  if (!url) return null;
  const isPdf = url.toLowerCase().includes('.pdf');

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
      <button onClick={onClose} style={{ position: 'absolute', top: 24, right: 24, background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', padding: 10, cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'} onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}>
        <X size={24} />
      </button>
      {isPdf ? (
        <iframe src={url} style={{ width: '80vw', height: '80vh', border: 'none', borderRadius: 8, background: 'white', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }} title="PDF Preview" />
      ) : (
        <img src={url} style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: 8, boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }} alt="Preview" />
      )}
    </div>
  );
}

/* ─── Attachment helpers ──────────────────────────────────────── */
function parseAtts(t) {
  if (!t?.attachments) return [];
  try { return typeof t.attachments === 'string' ? JSON.parse(t.attachments) : (t.attachments || []); }
  catch { return []; }
}

function panelDateTime(dateStr, createdAt) {
  const d = new Date(createdAt || dateStr);
  if (isNaN(d)) return '';
  const date = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const time = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase();
  return `On ${date}, ${time}`;
}

/* ─── Full-size attachment preview (zoom / rotate / download) ──── */
function AttachmentPreview({ url, panelWidth = 440, onClose }) {
  const [zoom, setZoom] = useState(1);
  const [rot, setRot] = useState(0);
  useEffect(() => { setZoom(1); setRot(0); }, [url]);
  if (!url) return null;

  const name = url.split('/').pop();
  const isPdf = url.toLowerCase().includes('.pdf');
  const barBtn = { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1px solid var(--gray-200)', borderRadius: 8, background: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--gray-700)', textDecoration: 'none' };
  const ctrlBtn = { display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--gray-700)', borderRadius: 6 };
  const ctrlBox = { display: 'flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38, border: '1px solid var(--gray-200)', borderRadius: 8, background: 'white', cursor: 'pointer', color: 'var(--gray-700)' };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: panelWidth, bottom: 0, background: '#fff', zIndex: 1100, display: 'flex', flexDirection: 'column', boxShadow: 'inset -1px 0 0 var(--gray-200)' }}>
      {/* top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--gray-200)' }}>
        <button onClick={onClose} style={barBtn}><EyeOff size={16} /> Hide Preview</button>
        <a href={url} download={name} target="_blank" rel="noreferrer" style={barBtn}><Download size={16} /> Attachment</a>
      </div>

      {/* image / pdf */}
      <div style={{ flex: 1, overflow: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: '#f6f7f9' }}>
        {isPdf ? (
          <iframe src={url} style={{ width: '100%', height: '100%', border: 'none', background: 'white' }} title="PDF Preview" />
        ) : (
          <img src={url} alt={name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', transform: `scale(${zoom}) rotate(${rot}deg)`, transition: 'transform 0.15s ease' }} />
        )}
      </div>

      {/* bottom controls (images only) */}
      {!isPdf && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 12, borderTop: '1px solid var(--gray-200)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1px solid var(--gray-200)', borderRadius: 8, padding: '4px 8px', background: 'white' }}>
            <button onClick={() => setZoom((z) => Math.max(0.25, +(z - 0.25).toFixed(2)))} style={ctrlBtn} title="Zoom out"><Minus size={16} /></button>
            <span style={{ fontSize: 13, minWidth: 46, textAlign: 'center', fontWeight: 600, color: 'var(--gray-700)' }}>{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom((z) => Math.min(4, +(z + 0.25).toFixed(2)))} style={ctrlBtn} title="Zoom in"><Plus size={16} /></button>
          </div>
          <button onClick={() => setRot((r) => (r + 90) % 360)} style={ctrlBox} title="Rotate"><RotateCw size={16} /></button>
          <a href={url} download={name} target="_blank" rel="noreferrer" style={ctrlBox} title="Download"><Download size={16} /></a>
        </div>
      )}
    </div>
  );
}

/* ─── Entry Details slide-in panel ────────────────────────────── */
function EntryDetailsPanel({ txn, onClose, onEdit, onDelete, onMove, onCopy, user, canEditDelete }) {
  const PANEL_W = 440;
  const [previewUrl, setPreviewUrl] = useState(null);
  const [moreOpen, setMoreOpen] = useState(false);

  const isIn = txn.type === 'IN';
  const accent = isIn ? '#16A34A' : '#DC2626';
  const atts = parseAtts(txn);
  const byName = txn.created_by === user?.id ? 'You' : (txn.created_by_name || 'Unknown');
  const createdAtLabel = panelDateTime(txn.date, txn.created_at);
  const updatedAtLabel = panelDateTime(txn.date, txn.updated_at || txn.created_at);

  const label = { fontSize: 12, color: 'var(--gray-500)', fontWeight: 500, marginTop: 14 };
  const val = { fontSize: 15, color: 'var(--gray-900)', fontWeight: 600, marginTop: 2 };
  const tag = { fontSize: 12, fontWeight: 600, color: 'var(--blue)', background: '#EFF6FF', borderRadius: 6, padding: '4px 10px' };
  const iconBtn = { border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--gray-500)', display: 'flex', padding: 4 };
  const footBtn = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' };
  const menuItem = { display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px', border: 'none', background: 'white', cursor: 'pointer', fontSize: 13, color: 'var(--gray-700)' };

  const ActivityRow = ({ icon, title, sub }) => (
    <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#EFF6FF', color: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 13, color: 'var(--gray-800)', fontWeight: 500 }}>{title}</div>
        <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 1 }}>{sub}</div>
      </div>
    </div>
  );

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000 }}>
      {/* backdrop */}
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)' }} />

      {/* full-size preview (sits left of the panel) */}
      {previewUrl && <AttachmentPreview url={previewUrl} panelWidth={PANEL_W} onClose={() => setPreviewUrl(null)} />}

      {/* panel */}
      <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: PANEL_W, maxWidth: '100%', background: '#fff', boxShadow: '-4px 0 24px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', zIndex: 1101 }}>
        {/* header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--gray-100)' }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--gray-900)' }}>Entry Details</span>
          <button onClick={onClose} style={iconBtn}><X size={20} /></button>
        </div>

        {/* body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          <div style={{ border: '1px solid var(--gray-200)', borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: accent, fontWeight: 600, fontSize: 14 }}>
                {isIn ? <Plus size={16} /> : <Minus size={16} />} {isIn ? 'Cash In' : 'Cash Out'}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--gray-500)' }}>
                {createdAtLabel} <CheckCircle2 size={16} color="#16A34A" />
              </span>
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, color: accent, marginTop: 8 }}>{formatAmount(txn.amount)}</div>

            {txn.party && (<><div style={label}>Party Name</div><div style={val}>{txn.party}{txn.partyType ? ` (${txn.partyType})` : ''}</div></>)}
            {txn.remarks && (<><div style={label}>Remark</div><div style={val}>{txn.remarks}</div></>)}

            {atts.length > 0 && (
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 14 }}>
                {atts.map((f, i) => {
                  const nm = f.split('/').pop();
                  const isImg = /\.(jpe?g|png|gif|webp)$/i.test(nm);
                  return (
                    <div key={i} onClick={() => setPreviewUrl(f)} title={nm}
                      style={{ width: 72, height: 72, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--gray-200)', cursor: 'pointer', position: 'relative', background: 'var(--gray-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {isImg ? <img src={f} alt={nm} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <FileText size={24} color="var(--blue)" />}
                      <span style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: 9, padding: '1px 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{nm}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {(txn.category || txn.payment_mode || txn.paymentMode) && (
              <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
                {txn.category && <span style={tag}>{txn.category}</span>}
                {(txn.payment_mode || txn.paymentMode) && <span style={tag}>{txn.payment_mode || txn.paymentMode}</span>}
              </div>
            )}
          </div>

          {/* Activities */}
          <div style={{ marginTop: 22 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-900)', marginBottom: 14 }}>Activities</div>
            <ActivityRow icon={<Plus size={14} />} title={<>Created by <b style={{ fontWeight: 600 }}>{byName}</b></>} sub={createdAtLabel} />
            <ActivityRow icon={<Pencil size={13} />} title={<>Last Updated by <b style={{ fontWeight: 600 }}>{byName}</b></>} sub={updatedAtLabel} />
          </div>
        </div>

        {/* footer actions */}
        {canEditDelete && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 16, borderTop: '1px solid var(--gray-100)' }}>
            <button onClick={onDelete} style={{ ...footBtn, border: '1px solid #FCA5A5', background: 'white', color: '#DC2626' }}>
              <Trash2 size={16} /> Delete
            </button>
            <div style={{ position: 'relative' }}>
              <button onClick={() => setMoreOpen((o) => !o)} style={{ ...footBtn, border: '1px solid var(--gray-200)', background: 'white', color: 'var(--gray-700)' }}>
                More Actions <ChevronDown size={14} />
              </button>
              {moreOpen && (
                <div style={{ position: 'absolute', bottom: 'calc(100% + 6px)', left: 0, background: '#fff', border: '1px solid var(--gray-200)', borderRadius: 8, boxShadow: '0 4px 20px rgba(0,0,0,0.12)', minWidth: 150, overflow: 'hidden', zIndex: 5 }}>
                  <button onClick={() => { setMoreOpen(false); onMove(); }} style={menuItem} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gray-50)'} onMouseLeave={(e) => e.currentTarget.style.background = 'white'}>Move Entry</button>
                  <button onClick={() => { setMoreOpen(false); onCopy(); }} style={menuItem} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gray-50)'} onMouseLeave={(e) => e.currentTarget.style.background = 'white'}>Copy Entry</button>
                </div>
              )}
            </div>
            <button onClick={onEdit} style={{ ...footBtn, border: 'none', background: 'var(--blue)', color: 'white', flex: 1 }}>
              <Pencil size={15} /> Edit
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function EntryPanel({ type, onTypeChange, onSave, onClose, bookParties = [], onAddParty, businessId, bookId, customCategories = [], customPaymentModes = [], onAddCustomCategory, onAddCustomPaymentMode, fieldSettings }) {
  const isIn = type === 'IN';
  const accent = isIn ? '#16A34A' : '#DC2626';
  const accentLight = isIn ? '#DCFCE7' : '#FEE2E2';

  /* Read custom fields created in BookSettings for this book */
  const customFields = (() => {
    try {
      const parsed = JSON.parse(localStorage.getItem(`cashbook_custom_fields_${bookId}`) || '[]');
      return parsed.filter(cf => cf.enabled !== false);
    }
    catch { return []; }
  })();

  const [form, setForm] = useState(() => {
    const cfValues = {};
    customFields.forEach((cf) => { cfValues[`cf_${cf.id}`] = ''; });
    return {
      date: todayStr(), time: initTime(), timeEditing: false,
      amount: '', party: '', remarks: '', category: '', paymentMode: '',
      bills: [],
      ...cfValues,
    };
  });
  const fileRef = useRef(null);
  const [billHover, setBillHover] = useState(false);
  const [showAddParty, setShowAddParty] = useState(false);
  const [previewModalUrl, setPreviewModalUrl] = useState(null);
  const [promptState, setPromptState] = useState(null);

  const set = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));
  const setTime = (field, val) => setForm((prev) => ({ ...prev, time: { ...prev.time, [field]: val } }));

  const [saving, setSaving] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  /* Validate required custom fields before saving */
  const missingRequired = customFields.filter((cf) => cf.required && !form[`cf_${cf.id}`]?.trim());

  const handleSave = async (addNew) => {
    if (!form.amount) { setShowErrors(true); return; }
    if (fieldSettings?.categoryRequired && !form.category) { setShowErrors(true); return; }
    if (fieldSettings?.paymentModeRequired && !form.paymentMode) { setShowErrors(true); return; }
    if (missingRequired.length > 0) {
      setShowErrors(true);
      return;
    }
    setSaving(true);
    setShowErrors(false);
    try {
      let uploadedUrls = [];
      const newFiles = form.bills.filter(f => f instanceof File);
      const existingUrls = form.bills.filter(f => typeof f === 'string');

      if (newFiles.length > 0) {
        const formData = new FormData();
        newFiles.forEach(f => formData.append('attachments', f));
        const res = await api.transactions.uploadAttachments(businessId, bookId, formData);
        uploadedUrls = res.urls || [];
      }

      const finalAttachments = [...existingUrls, ...uploadedUrls];

      await onSave({
        type,
        amount: parseFloat(form.amount),
        date: form.date,
        party: form.party,
        remarks: form.remarks,
        category: form.category,
        paymentMode: form.paymentMode,
        attachments: finalAttachments.length > 0 ? finalAttachments : null,
        customFields: customFields.reduce((acc, cf) => { acc[cf.name] = form[`cf_${cf.id}`] || ''; return acc; }, {}),
        created_at: makeCreatedAt(form.date, form.time),
      });

      if (addNew) {
        setForm({ date: todayStr(), time: initTime(), timeEditing: false, amount: '', party: '', remarks: '', category: '', paymentMode: '', bills: [] });
      } else {
        onClose();
      }
    } catch (err) {
      alert('Failed to upload/save: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.2)', zIndex: 400 }} onClick={onClose} />
      {/* Panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: 550, background: 'var(--white)', zIndex: 500,
        display: 'flex', flexDirection: 'column',
        boxShadow: '-4px 0 24px rgba(0,0,0,0.14)',
      }}>
        {/* Colored header */}
        <div style={{ background: accent, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <span style={{ color: 'white', fontSize: 15, fontWeight: 500 }}>
            Add {isIn ? 'Cash In' : 'Cash Out'} Entry
          </span>
          <X size={18} style={{ color: 'white', cursor: 'pointer' }} onClick={onClose} />
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>

          {/* Toggle pills */}
          <div style={{ display: 'flex', gap: 0, marginBottom: 16, background: 'var(--gray-100)', borderRadius: 20, padding: 3 }}>
            {[['IN', 'Cash In'], ['OUT', 'Cash Out']].map(([t, label]) => (
              <button
                key={t}
                onClick={() => onTypeChange(t)}
                style={{
                  flex: 1, padding: '7px 0', borderRadius: 16, fontSize: 13, fontWeight: 600,
                  border: 'none', cursor: 'pointer',
                  background: type === t ? (t === 'IN' ? '#16A34A' : '#DC2626') : 'transparent',
                  color: type === t ? 'white' : 'var(--gray-500)',
                  transition: 'background 0.15s',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Date + Time row */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
            {/* Date */}
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-600)', display: 'block', marginBottom: 4 }}>
                Date <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <div
                onClick={(e) => {
                  const input = e.currentTarget.querySelector('input');
                  if (input && input.showPicker) {
                    try { input.showPicker(); } catch (err) {}
                  }
                }}
                style={{ border: '1px solid var(--gray-200)', borderRadius: 8, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
              >
                <Calendar size={14} color="var(--blue)" />
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => set('date', e.target.value)}
                  style={{ border: 'none', outline: 'none', fontSize: 13, fontWeight: 600, color: 'var(--gray-800)', background: 'transparent', flex: 1, cursor: 'pointer' }}
                />
              </div>
            </div>

            {/* Time — display mode → click → dropdown mode */}
            <div style={{ flexShrink: 0 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: form.timeEditing ? 'var(--blue)' : 'var(--gray-600)', display: 'block', marginBottom: 4 }}>
                Time {form.timeEditing && <span style={{ color: '#DC2626' }}>*</span>}
              </label>
              {!form.timeEditing ? (
                <div
                  onClick={() => set('timeEditing', true)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    border: '1px solid var(--gray-200)', borderRadius: 8, padding: '8px 14px',
                    cursor: 'pointer', background: 'var(--white)', whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--blue)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--gray-200)'}
                >
                  <Clock size={14} color="var(--gray-500)" />
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-800)' }}>
                    {form.time.hour}:{form.time.minute} {form.time.period}
                  </span>
                </div>
              ) : (
                <TimePicker
                  hour={form.time.hour}
                  minute={form.time.minute}
                  period={form.time.period}
                  onChange={setTime}
                />
              )}
            </div>
          </div>

          {/* Amount */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-600)' }}>
                Amount <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <Info size={13} color="var(--gray-400)" style={{ cursor: 'pointer' }} title="You can enter expressions like 100+200*3" />
            </div>
            <input
              autoFocus
              type="text"
              value={form.amount}
              onChange={(e) => set('amount', e.target.value)}
              placeholder="eg. 890 or 100 + 200*3"
              style={{
                width: '100%', padding: '11px 12px',
                border: `1px solid ${form.amount ? accent : 'var(--gray-200)'}`,
                borderRadius: 8, fontSize: 14,
                color: 'var(--gray-800)', outline: 'none',
                background: form.amount ? accentLight : 'var(--white)',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Party Name */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-600)' }}>Party Name (Contact)</label>
              <Settings size={13} color="var(--blue)" style={{ cursor: 'pointer' }} />
            </div>
            <SearchSelectDropdown
              value={form.party}
              onChange={(v) => set('party', v)}
              placeholder="Search or Select"
              parties={bookParties}
              addLabel="Add New Party"
              onAdd={() => setShowAddParty(true)}
              importLabel="Import Bulk parties from CSV"
            />
          </div>

          {/* Remarks */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-600)', display: 'block', marginBottom: 4 }}>Remarks</label>
            <textarea
              value={form.remarks}
              onChange={(e) => set('remarks', e.target.value)}
              placeholder="e.g. Enter Details (Name, Bill No, Item Name, Quantity etc)"
              rows={2}
              style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--gray-200)', borderRadius: 8, fontSize: 13, outline: 'none', resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box', color: 'var(--gray-700)' }}
            />
          </div>

          {/* Category + Payment Mode */}
          {(fieldSettings?.showCategory !== false || fieldSettings?.showPaymentMode !== false) && (
            <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
              {fieldSettings?.showCategory !== false && (
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-600)' }}>
                      Category {fieldSettings?.categoryRequired && <span style={{ color: '#DC2626' }}>*</span>}
                    </label>
                    <Settings size={13} color="var(--blue)" style={{ cursor: 'pointer' }} />
                  </div>
                  <SearchSelectDropdown
                    error={showErrors && fieldSettings?.categoryRequired && !form.category}
                    value={form.category}
                    onChange={(v) => set('category', v)}
                    placeholder="Search or Select"
                    suggestions={[...CATEGORY_SUGGESTIONS, ...customCategories]}
                    addLabel="Add New Category"
                    onAdd={(query) => setPromptState({ type: 'category', title: 'Add New Category', placeholder: 'Enter category name', initialValue: query || '' })}
                  />
                </div>
              )}
              {fieldSettings?.showPaymentMode !== false && (
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-600)' }}>
                      Payment Mode {fieldSettings?.paymentModeRequired && <span style={{ color: '#DC2626' }}>*</span>}
                    </label>
                    <Settings size={13} color="var(--blue)" style={{ cursor: 'pointer' }} />
                  </div>
                  <SearchSelectDropdown
                    error={showErrors && fieldSettings?.paymentModeRequired && !form.paymentMode}
                    value={form.paymentMode}
                    onChange={(v) => set('paymentMode', v)}
                    placeholder="Search or Select"
                    fixedOptions={PAYMENT_FIXED}
                    suggestions={[...PAYMENT_SUGGESTIONS, ...customPaymentModes]}
                    addLabel="Add New Payment Mode"
                    onAdd={(query) => setPromptState({ type: 'paymentMode', title: 'Add New Payment Mode', placeholder: 'Enter payment mode', initialValue: query || '' })}
                  />
                </div>
              )}
            </div>
          )}

          {/* Attach Bills */}
          <div style={{ marginBottom: 12 }}>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,.pdf"
              multiple
              style={{ display: 'none' }}
              onChange={(e) => {
                const files = Array.from(e.target.files);
                set('bills', [...form.bills, ...files].slice(0, 4));
                e.target.value = '';
              }}
            />
            <button
              onClick={() => fileRef.current?.click()}
              onMouseEnter={() => setBillHover(true)}
              onMouseLeave={() => setBillHover(false)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                padding: '9px 14px', borderRadius: 8,
                border: 'none', background: 'transparent',
                cursor: 'pointer', fontSize: 13,
              }}
            >
              <Paperclip size={14} color="var(--blue)" />
              <span style={{ fontWeight: 600, color: 'var(--blue)' }}>Attach Bills</span>
              {form.bills.length > 0 && (
                <span style={{ marginLeft: 4, fontSize: 12, fontWeight: 500, color: 'var(--blue)' }}>({form.bills.length}/4)</span>
              )}
            </button>
            <div style={{ fontSize: 12, color: '#16A34A', paddingLeft: 14 }}>Attach up to 4 images or PDF files</div>

            {/* Attachment Previews */}
            {form.bills.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8, paddingLeft: 14 }}>
                {form.bills.map((file, idx) => {
                  const isFileObj = file instanceof File;
                  const name = isFileObj ? file.name : file.split('/').pop();
                  const isImg = isFileObj ? file.type.startsWith('image/') : name.match(/\.(jpeg|jpg|gif|png)$/i);
                  const previewUrl = isFileObj ? URL.createObjectURL(file) : file;

                  return (
                    <div key={idx} style={{ position: 'relative', width: 60, height: 60, border: '1px solid var(--gray-200)', borderRadius: 6, overflow: 'hidden', cursor: 'pointer' }} onClick={() => setPreviewModalUrl(previewUrl)}>
                      {isImg ? (
                        <img src={previewUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="attachment" />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--gray-50)' }}>
                          <FileText size={20} color="var(--gray-400)" />
                          <span style={{ fontSize: 9, color: 'var(--gray-500)', marginTop: 4, maxWidth: 50, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
                        </div>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          set('bills', form.bills.filter((_, i) => i !== idx));
                        }}
                        style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Custom Fields */}
          {customFields.length > 0 && customFields.map((cf) => {
            const val = form[`cf_${cf.id}`] || '';
            const isEmpty = showErrors && cf.required && !val.trim();
            return (
              <div key={cf.id} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: isEmpty ? '#DC2626' : 'var(--gray-600)' }}>
                    {cf.name}
                    {cf.required && <span style={{ color: '#DC2626', marginLeft: 2 }}>*</span>}
                  </label>
                  <Settings size={13} color="var(--blue)" style={{ cursor: 'pointer' }} />
                </div>
                {cf.fieldType === 'Select (Dropdown)' ? (
                  <select
                    value={val}
                    onChange={(e) => set(`cf_${cf.id}`, e.target.value)}
                    style={{
                      width: '100%', padding: '9px 12px',
                      border: `1px solid ${isEmpty ? '#DC2626' : 'var(--gray-200)'}`,
                      borderRadius: 8, fontSize: 13, outline: 'none',
                      boxSizing: 'border-box', color: val ? 'var(--gray-700)' : 'var(--gray-400)',
                      background: 'var(--white)', cursor: 'pointer',
                    }}
                  >
                    <option value="">Select {cf.name}</option>
                    {(cf.options || []).map((opt) => {
                      const label = typeof opt === 'string' ? opt : opt.label;
                      const disabled = typeof opt === 'string' ? false : opt.disabled;
                      return <option key={label} value={label} disabled={disabled}>{label}</option>;
                    })}
                  </select>
                ) : cf.fieldType === 'Number' ? (
                  <input
                    type="number"
                    value={val}
                    onChange={(e) => set(`cf_${cf.id}`, e.target.value)}
                    onKeyDown={(e) => { if (['-', 'e', 'E', '+'].includes(e.key)) e.preventDefault(); }}
                    placeholder={cf.name}
                    style={{
                      width: '100%', padding: '9px 12px',
                      border: `1px solid ${isEmpty ? '#DC2626' : 'var(--gray-200)'}`,
                      borderRadius: 8, fontSize: 13, outline: 'none',
                      boxSizing: 'border-box', color: 'var(--gray-700)',
                    }}
                  />
                ) : (
                  <input
                    type="text"
                    value={val}
                    onChange={(e) => set(`cf_${cf.id}`, e.target.value)}
                    placeholder={cf.name}
                    style={{
                      width: '100%', padding: '9px 12px',
                      border: `1px solid ${isEmpty ? '#DC2626' : 'var(--gray-200)'}`,
                      borderRadius: 8, fontSize: 13, outline: 'none',
                      boxSizing: 'border-box', color: 'var(--gray-700)',
                    }}
                  />
                )}
                {isEmpty && <div style={{ fontSize: 11, color: '#DC2626', marginTop: 3 }}>{cf.name} is required</div>}
              </div>
            );
          })}

          {/* Add more fields banner */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 14px', borderRadius: 8,
            border: '1px solid var(--gray-200)', background: 'var(--gray-50)', marginBottom: 8,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Zap size={14} color="var(--gray-400)" />
              <span style={{ fontSize: 13, color: 'var(--gray-600)', fontWeight: 500 }}>Add more fields</span>
              <span style={{
                fontSize: 10, fontWeight: 500, padding: '1px 5px', borderRadius: 3,
                background: '#DBEAFE', color: 'var(--blue)', textTransform: 'uppercase',
              }}>New</span>
            </div>
            <button style={{ fontSize: 12, fontWeight: 600, color: 'var(--blue)', border: 'none', background: 'none', cursor: 'pointer' }}>
              Configure
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--gray-100)', display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
          <button
            onClick={() => handleSave(true)}
            disabled={!form.amount}
            style={{
              flex: 1, padding: '10px 0', borderRadius: 8,
              background: form.amount ? 'var(--blue)' : 'var(--gray-200)',
              color: form.amount ? 'white' : 'var(--gray-400)',
              border: 'none', fontSize: 13, fontWeight: 500, cursor: form.amount ? 'pointer' : 'not-allowed',
            }}
          >
            Save &amp; Add New
          </button>
          <button
            onClick={() => handleSave(false)}
            disabled={!form.amount}
            style={{
              padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600,
              border: '1px solid var(--gray-200)', background: 'var(--white)',
              color: form.amount ? 'var(--gray-700)' : 'var(--gray-300)',
              cursor: form.amount ? 'pointer' : 'not-allowed',
            }}
          >
            Save
          </button>
        </div>
      </div>

      {/* Add New Party modal — zIndex above panel (500) */}
      {showAddParty && (
        <AddPartyModal
          onSave={async (party) => {
            try {
              const saved = await onAddParty(party);
              set('party', saved ? saved.name : party.name);
            } catch {
              set('party', party.name);
            }
            setShowAddParty(false);
          }}
          onClose={() => setShowAddParty(false)}
        />
      )}

      {previewModalUrl && (
        <FilePreviewModal url={previewModalUrl} onClose={() => setPreviewModalUrl(null)} />
      )}

      {promptState && (
        <AddCustomFieldModal
          title={promptState.title}
          placeholder={promptState.placeholder}
          initialValue={promptState.initialValue}
          onSave={(val) => {
            if (promptState.type === 'category' && !CATEGORY_SUGGESTIONS.includes(val)) {
              CATEGORY_SUGGESTIONS.push(val);
            }
            if (promptState.type === 'paymentMode' && !PAYMENT_FIXED.includes(val) && !PAYMENT_SUGGESTIONS.includes(val)) {
              PAYMENT_SUGGESTIONS.push(val);
            }
            set(promptState.type, val);
            setPromptState(null);
          }}
          onClose={() => setPromptState(null)}
        />
      )}
    </>
  );
}

/* ─── Edit Entry panel ──────────────────────────────────────── */
function EditEntryPanel({ txn, onSave, onClose, bookParties = [], onAddParty, businessId, bookId, customCategories = [], customPaymentModes = [], onAddCustomCategory, onAddCustomPaymentMode, fieldSettings }) {
  const [type, setType] = useState(txn.type);

  /* Read custom fields for this book */
  const customFields = (() => {
    try {
      const parsed = JSON.parse(localStorage.getItem(`cashbook_custom_fields_${bookId}`) || '[]');
      return parsed.filter(cf => cf.enabled !== false);
    }
    catch { return []; }
  })();

  /* Pre-fill custom field values from existing txn.customFields if available */
  const cfValues = {};
  customFields.forEach((cf) => {
    cfValues[`cf_${cf.id}`] = txn.customFields?.[cf.name] || '';
  });

  const [form, setForm] = useState({
    date: txn.date || todayStr(),
    time: parseTimeFromCreatedAt(txn.created_at),
    timeEditing: false,
    amount: String(txn.amount || ''),
    party: txn.party || '',
    remarks: txn.remarks || '',
    category: txn.category || '',
    paymentMode: txn.payment_mode || txn.paymentMode || '',
    bills: (() => {
      if (!txn.attachments) return [];
      try { return typeof txn.attachments === 'string' ? JSON.parse(txn.attachments) : txn.attachments; }
      catch { return []; }
    })(),
    ...cfValues,
  });
  const [saving, setSaving] = useState(false);
  const [showAddParty, setShowAddParty] = useState(false);
  const fileRef = useRef(null);
  const [previewModalUrl, setPreviewModalUrl] = useState(null);
  const [promptState, setPromptState] = useState(null);

  const set = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));
  const setTime = (field, val) => setForm((prev) => ({ ...prev, time: { ...prev.time, [field]: val } }));
  const accent = type === 'IN' ? '#16A34A' : '#DC2626';

  const [showErrors, setShowErrors] = useState(false);

  /* Validate required custom fields before saving */
  const missingRequired = customFields.filter((cf) => cf.required && !form[`cf_${cf.id}`]?.trim());

  const handleSave = async () => {
    if (!form.amount) { setShowErrors(true); return; }
    if (fieldSettings?.categoryRequired && !form.category) { setShowErrors(true); return; }
    if (fieldSettings?.paymentModeRequired && !form.paymentMode) { setShowErrors(true); return; }
    if (missingRequired.length > 0) {
      setShowErrors(true);
      return;
    }
    setSaving(true);
    setShowErrors(false);
    try {
      let uploadedUrls = [];
      const newFiles = form.bills.filter(f => f instanceof File);
      const existingUrls = form.bills.filter(f => typeof f === 'string');

      if (newFiles.length > 0) {
        const formData = new FormData();
        newFiles.forEach(f => formData.append('attachments', f));
        const res = await api.transactions.uploadAttachments(businessId, bookId, formData);
        uploadedUrls = res.urls || [];
      }

      const finalAttachments = [...existingUrls, ...uploadedUrls];

      await onSave({
        id: txn.id,
        type,
        amount: parseFloat(form.amount),
        date: form.date,
        party: form.party,
        remarks: form.remarks,
        category: form.category,
        paymentMode: form.paymentMode,
        attachments: finalAttachments.length > 0 ? finalAttachments : null,
        customFields: customFields.reduce((acc, cf) => { acc[cf.name] = form[`cf_${cf.id}`] || ''; return acc; }, {}),
        created_at: makeCreatedAt(form.date, form.time),
      });
    } catch (err) {
      alert('Failed to upload/save: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.2)', zIndex: 400 }} onClick={onClose} />
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 550, background: 'var(--white)', zIndex: 500, display: 'flex', flexDirection: 'column', boxShadow: '-4px 0 24px rgba(0,0,0,0.14)' }}>

        {/* Header */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--gray-200)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--gray-900)' }}>Edit Entry</span>
          <X size={18} style={{ cursor: 'pointer', color: 'var(--gray-500)' }} onClick={onClose} />
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>

          {/* Type toggle */}
          <div style={{ display: 'flex', marginBottom: 16, background: 'var(--gray-100)', borderRadius: 20, padding: 3 }}>
            {[['IN', 'Cash In'], ['OUT', 'Cash Out']].map(([t, label]) => (
              <button key={t} onClick={() => setType(t)} style={{
                flex: 1, padding: '7px 0', borderRadius: 16, fontSize: 13, fontWeight: 600,
                border: 'none', cursor: 'pointer',
                background: type === t ? (t === 'IN' ? '#16A34A' : '#DC2626') : 'transparent',
                color: type === t ? 'white' : 'var(--gray-500)', transition: 'background 0.15s',
              }}>{label}</button>
            ))}
          </div>

          {/* Date + Time */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-600)', display: 'block', marginBottom: 4 }}>Date <span style={{ color: '#DC2626' }}>*</span></label>
              <div
                onClick={(e) => {
                  const input = e.currentTarget.querySelector('input');
                  if (input && input.showPicker) {
                    try { input.showPicker(); } catch (err) {}
                  }
                }}
                style={{ border: '1px solid var(--gray-200)', borderRadius: 8, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
              >
                <Calendar size={14} color="var(--blue)" />
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => set('date', e.target.value)}
                  style={{ border: 'none', outline: 'none', fontSize: 13, fontWeight: 600, color: 'var(--gray-800)', background: 'transparent', flex: 1, cursor: 'pointer' }}
                />
              </div>
            </div>
            <div style={{ flexShrink: 0 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: form.timeEditing ? 'var(--blue)' : 'var(--gray-600)', display: 'block', marginBottom: 4 }}>
                Time {form.timeEditing && <span style={{ color: '#DC2626' }}>*</span>}
              </label>
              {!form.timeEditing ? (
                <div
                  onClick={() => set('timeEditing', true)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    border: '1px solid var(--gray-200)', borderRadius: 8, padding: '8px 14px',
                    cursor: 'pointer', background: 'var(--white)', whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--blue)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--gray-200)'}
                >
                  <Clock size={14} color="var(--gray-500)" />
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-800)' }}>
                    {form.time.hour}:{form.time.minute} {form.time.period}
                  </span>
                </div>
              ) : (
                <TimePicker
                  hour={form.time.hour}
                  minute={form.time.minute}
                  period={form.time.period}
                  onChange={setTime}
                />
              )}
            </div>
          </div>

          {/* Amount */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-600)' }}>Amount <span style={{ color: '#DC2626' }}>*</span></label>
              <Info size={13} color="var(--gray-400)" />
            </div>
            <input
              type="number" min="0" step="any" autoFocus
              value={form.amount} onChange={(e) => set('amount', e.target.value)}
              style={{ width: '100%', padding: '9px 12px', border: `2px solid ${form.amount ? 'var(--blue)' : 'var(--gray-200)'}`, borderRadius: 8, fontSize: 14, fontWeight: 500, outline: 'none', boxSizing: 'border-box', color: accent }}
              onFocus={(e) => e.target.style.borderColor = 'var(--blue)'}
              onBlur={(e) => e.target.style.borderColor = form.amount ? 'var(--blue)' : 'var(--gray-200)'}
            />
          </div>

          {/* Party Name */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-600)' }}>Party Name (Contact)</label>
              <Settings size={13} color="var(--blue)" style={{ cursor: 'pointer' }} onClick={() => setShowAddParty(true)} />
            </div>
            <SearchSelectDropdown
              value={form.party}
              onChange={(v) => set('party', v)}
              placeholder="Search or Select"
              parties={bookParties.map((p) => (typeof p === 'string' ? p : p.name))}
              addLabel="Add New Party"
              onAdd={() => setShowAddParty(true)}
            />
          </div>

          {/* Remarks */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-600)', display: 'block', marginBottom: 4 }}>Remarks</label>
            <input
              type="text" value={form.remarks} onChange={(e) => set('remarks', e.target.value)}
              placeholder="e.g. Monthly salary"
              style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--gray-200)', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--blue)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--gray-200)'}
            />
          </div>

          {/* Category + Payment Mode */}
          {(fieldSettings?.showCategory !== false || fieldSettings?.showPaymentMode !== false) && (
            <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
              {fieldSettings?.showCategory !== false && (
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-600)' }}>
                      Category {fieldSettings?.categoryRequired && <span style={{ color: '#DC2626' }}>*</span>}
                    </label>
                    <Settings size={13} color="var(--blue)" style={{ cursor: 'pointer' }} />
                  </div>
                  <SearchSelectDropdown
                    error={showErrors && fieldSettings?.categoryRequired && !form.category}
                    value={form.category}
                    onChange={(v) => set('category', v)}
                    placeholder="Select"
                    suggestions={[...CATEGORY_SUGGESTIONS, ...customCategories]}
                    addLabel="Add New Category"
                    onAdd={(query) => setPromptState({ type: 'category', title: 'Add New Category', placeholder: 'Enter category name', initialValue: query || '' })}
                  />
                </div>
              )}
              {fieldSettings?.showPaymentMode !== false && (
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-600)' }}>
                      Payment Mode {fieldSettings?.paymentModeRequired && <span style={{ color: '#DC2626' }}>*</span>}
                    </label>
                    <Settings size={13} color="var(--blue)" style={{ cursor: 'pointer' }} />
                  </div>
                  <SearchSelectDropdown
                    error={showErrors && fieldSettings?.paymentModeRequired && !form.paymentMode}
                    value={form.paymentMode}
                    onChange={(v) => set('paymentMode', v)}
                    placeholder="Select"
                    fixedOptions={PAYMENT_FIXED}
                    suggestions={[...PAYMENT_SUGGESTIONS, ...customPaymentModes]}
                    addLabel="Add New Payment Mode"
                    onAdd={(query) => setPromptState({ type: 'paymentMode', title: 'Add New Payment Mode', placeholder: 'Enter payment mode', initialValue: query || '' })}
                  />
                </div>
              )}
            </div>
          )}

          {/* Attachments */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-600)', display: 'block', marginBottom: 8 }}>Attachments</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {form.bills.map((file, idx) => {
                const isFileObj = file instanceof File;
                const name = isFileObj ? file.name : file.split('/').pop();
                const isImg = isFileObj ? file.type.startsWith('image/') : name.match(/\.(jpeg|jpg|gif|png)$/i);
                const previewUrl = isFileObj ? URL.createObjectURL(file) : file;

                return (
                  <div key={idx} style={{ position: 'relative', width: 64, height: 64, border: '1px solid var(--gray-200)', borderRadius: 8, overflow: 'hidden', cursor: 'pointer' }} onClick={() => setPreviewModalUrl(previewUrl)}>
                    {isImg ? (
                      <img src={previewUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="attachment" />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--gray-50)' }}>
                        <FileText size={20} color="var(--gray-400)" />
                        <span style={{ fontSize: 9, color: 'var(--gray-500)', marginTop: 4, maxWidth: 50, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        set('bills', form.bills.filter((_, i) => i !== idx));
                      }}
                      style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                );
              })}

              {form.bills.length < 4 && (
                <div
                  onClick={() => fileRef.current?.click()}
                  style={{ width: 64, height: 64, borderRadius: 8, border: '1.5px dashed var(--blue)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--blue)', background: '#F0F4FF' }}
                >
                  <Plus size={20} />
                  <span style={{ fontSize: 10, fontWeight: 500, marginTop: 4 }}>Add</span>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,.pdf"
              multiple
              style={{ display: 'none' }}
              onChange={(e) => {
                const files = Array.from(e.target.files);
                set('bills', [...form.bills, ...files].slice(0, 4));
                e.target.value = '';
              }}
            />
          </div>

          {/* Custom Fields */}
          {customFields.length > 0 && customFields.map((cf) => {
            const val = form[`cf_${cf.id}`] || '';
            const isEmpty = showErrors && cf.required && !val.trim();
            return (
              <div key={cf.id} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: isEmpty ? '#DC2626' : 'var(--gray-600)' }}>
                    {cf.name}
                    {cf.required && <span style={{ color: '#DC2626', marginLeft: 2 }}>*</span>}
                  </label>
                  <Settings size={13} color="var(--blue)" style={{ cursor: 'pointer' }} />
                </div>
                {cf.fieldType === 'Select (Dropdown)' ? (
                  <select
                    value={val}
                    onChange={(e) => set(`cf_${cf.id}`, e.target.value)}
                    style={{
                      width: '100%', padding: '9px 12px',
                      border: `1px solid ${isEmpty ? '#DC2626' : 'var(--gray-200)'}`,
                      borderRadius: 8, fontSize: 13, outline: 'none',
                      boxSizing: 'border-box', color: val ? 'var(--gray-700)' : 'var(--gray-400)',
                      background: 'var(--white)', cursor: 'pointer',
                    }}
                  >
                    <option value="">Select {cf.name}</option>
                    {(cf.options || []).map((opt) => {
                      const label = typeof opt === 'string' ? opt : opt.label;
                      const disabled = typeof opt === 'string' ? false : opt.disabled;
                      return <option key={label} value={label} disabled={disabled}>{label}</option>;
                    })}
                  </select>
                ) : cf.fieldType === 'Number' ? (
                  <input
                    type="number"
                    value={val}
                    onChange={(e) => set(`cf_${cf.id}`, e.target.value)}
                    onKeyDown={(e) => { if (['-', 'e', 'E', '+'].includes(e.key)) e.preventDefault(); }}
                    placeholder={cf.name}
                    style={{
                      width: '100%', padding: '9px 12px',
                      border: `1px solid ${isEmpty ? '#DC2626' : 'var(--gray-200)'}`,
                      borderRadius: 8, fontSize: 13, outline: 'none',
                      boxSizing: 'border-box', color: 'var(--gray-700)',
                    }}
                  />
                ) : (
                  <input
                    type="text"
                    value={val}
                    onChange={(e) => set(`cf_${cf.id}`, e.target.value)}
                    placeholder={cf.name}
                    style={{
                      width: '100%', padding: '9px 12px',
                      border: `1px solid ${isEmpty ? '#DC2626' : 'var(--gray-200)'}`,
                      borderRadius: 8, fontSize: 13, outline: 'none',
                      boxSizing: 'border-box', color: 'var(--gray-700)',
                    }}
                  />
                )}
                {isEmpty && <div style={{ fontSize: 11, color: '#DC2626', marginTop: 3 }}>{cf.name} is required</div>}
              </div>
            );
          })}

        </div>

        {/* Footer */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid var(--gray-100)', flexShrink: 0 }}>
          <button
            onClick={handleSave}
            disabled={!form.amount || saving}
            style={{ width: '100%', padding: '11px', borderRadius: 8, border: 'none', fontSize: 14, fontWeight: 500, background: form.amount ? 'var(--blue)' : 'var(--gray-200)', color: form.amount ? 'white' : 'var(--gray-400)', cursor: form.amount ? 'pointer' : 'not-allowed' }}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {showAddParty && (
        <AddPartyModal
          onSave={async (party) => {
            try { const saved = await onAddParty(party); set('party', saved ? saved.name : party.name); } catch { set('party', party.name); }
            setShowAddParty(false);
          }}
          onClose={() => setShowAddParty(false)}
        />
      )}

      {previewModalUrl && (
        <FilePreviewModal url={previewModalUrl} onClose={() => setPreviewModalUrl(null)} />
      )}

      {promptState && (
        <AddCustomFieldModal
          title={promptState.title}
          placeholder={promptState.placeholder}
          initialValue={promptState.initialValue}
          onSave={async (val) => {
            if (promptState.type === 'category' && !CATEGORY_SUGGESTIONS.includes(val) && !customCategories.includes(val)) {
              if (onAddCustomCategory) await onAddCustomCategory(val);
            }
            if (promptState.type === 'paymentMode' && !PAYMENT_FIXED.includes(val) && !PAYMENT_SUGGESTIONS.includes(val) && !customPaymentModes.includes(val)) {
              if (onAddCustomPaymentMode) await onAddCustomPaymentMode(val);
            }
            set(promptState.type, val);
            setPromptState(null);
          }}
          onClose={() => setPromptState(null)}
        />
      )}
    </>
  );
}

/* ─── Delete confirm modal ──────────────────────────────────── */
function fmtModalDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getDate()} ${d.toLocaleString('en-IN', { month: 'long' })}, ${d.getFullYear()}`;
}

function DeleteConfirmModal({ txns, onConfirm, onClose }) {
  const single = txns.length === 1 ? txns[0] : null;
  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 800 }}
      onClick={onClose}
    >
      <div
        style={{ background: 'var(--white)', borderRadius: 12, width: 500, boxShadow: '0 20px 60px rgba(0,0,0,0.25)', overflow: 'hidden' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--gray-100)' }}>
          <span style={{ fontSize: 16, fontWeight: 500, color: 'var(--gray-900)' }}>Delete {txns.length > 1 ? `${txns.length} Entries` : 'Entry'}</span>
          <button onClick={onClose} style={{ display: 'flex', alignItems: 'center', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--gray-500)', padding: 2 }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '16px 20px' }}>
          {/* Warning banner */}
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 10,
            padding: '12px 14px', borderRadius: 8,
            background: '#FFF7ED', border: '1px solid #FED7AA', marginBottom: 18,
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" fill="#FDBA74" stroke="#F97316" strokeWidth="1.5" />
              <line x1="12" y1="9" x2="12" y2="13" stroke="#9A3412" strokeWidth="1.8" strokeLinecap="round" />
              <circle cx="12" cy="16.5" r="0.8" fill="#9A3412" />
            </svg>
            <span style={{ fontSize: 13, color: '#9A3412', lineHeight: 1.55 }}>
              Once deleted, {txns.length > 1 ? 'these entries' : 'this entry'} <strong>cannot be restored.</strong><br />
              Are you sure you want to Delete ?
            </span>
          </div>

          {/* Review Details */}
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-800)', marginBottom: 10 }}>Review Details</div>
          <div style={{ border: '1px solid var(--gray-200)', borderRadius: 8, overflow: 'hidden' }}>
            {txns.map((t, idx) => (
              <div key={t.id} style={{ padding: '12px 14px', borderBottom: idx < txns.length - 1 ? '1px solid var(--gray-100)' : 'none' }}>
                <div style={{ display: 'flex', gap: 28, marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 500, marginBottom: 2 }}>Type</div>
                    <div style={{ fontSize: 13, color: t.type === 'IN' ? '#16A34A' : '#DC2626', fontWeight: 600 }}>{t.type === 'IN' ? 'Cash In' : 'Cash Out'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 500, marginBottom: 2 }}>Amount</div>
                    <div style={{ fontSize: 13, color: 'var(--gray-800)', fontWeight: 600 }}>{formatAmount(t.amount)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 500, marginBottom: 2 }}>Date</div>
                    <div style={{ fontSize: 13, color: 'var(--gray-700)' }}>{fmtModalDate(t.date)}</div>
                  </div>
                </div>
                {(t.remarks || t.party) && (
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 500, marginBottom: 2 }}>Remark</div>
                    <div style={{ fontSize: 13, color: 'var(--gray-700)' }}>{t.remarks || t.party}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'center', gap: 12 }}>
          <button
            onClick={onConfirm}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '10px 28px', borderRadius: 7,
              border: '1.5px solid #DC2626', background: 'var(--white)',
              fontSize: 14, fontWeight: 600, color: '#DC2626', cursor: 'pointer',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#FEF2F2'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--white)'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
            Yes, Delete
          </button>
          <button
            onClick={onClose}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '10px 28px', borderRadius: 7,
              border: 'none', background: 'var(--blue)',
              fontSize: 14, fontWeight: 600, color: 'white', cursor: 'pointer',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#1D4ED8'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--blue)'}
          >
            <X size={14} /> Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Selection action bar ─────────────────────────────────── */
function ActionDropdown({ label, icon, items }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px',
          border: '1px solid var(--gray-200)', borderRadius: 5,
          background: 'var(--white)', fontSize: 13, fontWeight: 500,
          color: 'var(--blue)', cursor: 'pointer', whiteSpace: 'nowrap',
        }}
      >
        {icon} {label} <ChevronDown size={12} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: '0.15s' }} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0,
          background: 'var(--white)', border: '1px solid var(--gray-200)',
          borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          minWidth: 200, zIndex: 400, overflow: 'hidden',
        }}>
          {items.map((item) => (
            <button
              key={item.label}
              onClick={() => { item.onClick?.(); setOpen(false); }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', border: 'none', background: 'var(--white)',
                fontSize: 13, color: 'var(--gray-700)', cursor: 'pointer', textAlign: 'left',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gray-50)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'var(--white)'}
            >
              <span style={{ color: 'var(--gray-400)', display: 'flex' }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Move Entry panel + confirm ────────────────────────────── */
function fmtBookDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (d.toDateString() === new Date().toDateString()) return 'Today';
  const day = d.getDate();
  const suf = [11, 12, 13].includes(day) ? 'th' : ['st', 'nd', 'rd'][((day % 10) - 1)] || 'th';
  return `${d.toLocaleString('en-IN', { month: 'long' })} ${day}${suf} ${d.getFullYear()}`;
}

function MoveConfirmModal({ count, targetBookName, onConfirm, onCancel }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 900 }} onClick={onCancel}>
      <div style={{ background: 'var(--white)', borderRadius: 12, width: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.25)', overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--gray-100)' }}>
          <span style={{ fontSize: 16, fontWeight: 500, color: 'var(--gray-900)' }}>Move {count} {count === 1 ? 'Entry' : 'Entries'}</span>
          <button onClick={onCancel} style={{ display: 'flex', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--gray-500)', padding: 2 }}><X size={18} /></button>
        </div>
        <div style={{ padding: '20px 24px' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-800)', marginBottom: 14 }}>Are you sure?</div>
          <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <li style={{ fontSize: 13, color: 'var(--gray-600)', lineHeight: 1.55 }}>
              {count === 1 ? 'Entry' : 'Entries'} will get deleted from current book and added in <strong style={{ color: 'var(--gray-900)' }}>{targetBookName}</strong>
            </li>
            <li style={{ fontSize: 13, color: 'var(--gray-600)', lineHeight: 1.55 }}>
              This will change the net balance of both books
            </li>
          </ul>
        </div>
        <div style={{ padding: '14px 20px', borderTop: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'center', gap: 12 }}>
          <button onClick={onCancel} style={{ padding: '10px 28px', borderRadius: 7, border: '1.5px solid var(--gray-200)', background: 'var(--white)', fontSize: 14, fontWeight: 600, color: 'var(--gray-700)', cursor: 'pointer' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gray-50)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--white)'}
          >Cancel</button>
          <button onClick={onConfirm} style={{ padding: '10px 28px', borderRadius: 7, border: 'none', background: 'var(--blue)', fontSize: 14, fontWeight: 600, color: 'white', cursor: 'pointer' }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#1D4ED8'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--blue)'}
          >Yes, Move</button>
        </div>
      </div>
    </div>
  );
}

function MoveEntryPanel({ txns, currentBook, targetBooks, businessId, onClose, onMoved }) {
  const [selectedId, setSelectedId] = useState(targetBooks[0]?.id || null);
  const [search, setSearch] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [moving, setMoving] = useState(false);
  const searchRef = useRef(null);

  const shown = targetBooks.filter((b) => b.name.toLowerCase().includes(search.toLowerCase()));
  const targetBook = targetBooks.find((b) => b.id === selectedId);
  const count = txns.length;

  const handleConfirmMove = async () => {
    setMoving(true);
    try {
      for (const txn of txns) {
        await api.transactions.create(businessId, selectedId, {
          type: txn.type,
          amount: txn.amount,
          date: txn.date,
          party: txn.party || null,
          remarks: txn.remarks || null,
          category: txn.category || null,
          payment_mode: txn.payment_mode || txn.paymentMode || null,
        });
        await api.transactions.delete(businessId, currentBook.id, txn.id);
      }
      onMoved(txns.map((t) => t.id));
    } catch (err) {
      console.error('[MoveEntry]', err.message);
    } finally {
      setMoving(false);
      setShowConfirm(false);
    }
  };

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 600 }} onClick={onClose} />
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 460, background: 'var(--white)', zIndex: 700, display: 'flex', flexDirection: 'column', boxShadow: '-4px 0 30px rgba(0,0,0,0.18)' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid var(--gray-100)', flexShrink: 0 }}>
          <span style={{ fontSize: 16, fontWeight: 500, color: 'var(--gray-900)' }}>Move {count} {count === 1 ? 'Entry' : 'Entries'}</span>
          <button onClick={onClose} style={{ display: 'flex', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--gray-500)', padding: 2 }}><X size={18} /></button>
        </div>

        {/* Subtitle + Search */}
        <div style={{ padding: '14px 20px 10px', flexShrink: 0 }}>
          <div style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 12 }}>Select a book where you want to move {count === 1 ? 'this entry' : 'these entries'}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', border: '1px solid var(--gray-200)', borderRadius: 7, background: 'var(--gray-50)' }}>
            <Search size={13} color="var(--gray-400)" />
            <input
              ref={searchRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search book name..."
              style={{ border: 'none', background: 'none', outline: 'none', flex: 1, fontSize: 13, color: 'var(--gray-700)' }}
            />
            <kbd style={{ padding: '1px 5px', background: 'var(--gray-200)', borderRadius: 3, fontSize: 11, color: 'var(--gray-500)' }}>/</kbd>
          </div>
        </div>

        {/* Book list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
          {shown.length === 0 ? (
            <div style={{ padding: '24px 20px', textAlign: 'center', fontSize: 13, color: 'var(--gray-400)' }}>
              {targetBooks.length === 0 ? 'No other cashbooks available' : 'No books match your search'}
            </div>
          ) : shown.map((book, idx) => (
            <label key={book.id} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px',
              cursor: 'pointer', borderBottom: idx < shown.length - 1 ? '1px solid var(--gray-100)' : 'none',
              background: selectedId === book.id ? '#F0F4FF' : 'var(--white)',
            }}
              onMouseEnter={(e) => { if (selectedId !== book.id) e.currentTarget.style.background = 'var(--gray-50)'; }}
              onMouseLeave={(e) => { if (selectedId !== book.id) e.currentTarget.style.background = 'var(--white)'; }}
            >
              <input
                type="radio"
                checked={selectedId === book.id}
                onChange={() => setSelectedId(book.id)}
                style={{ accentColor: 'var(--blue)', width: 16, height: 16, cursor: 'pointer', flexShrink: 0 }}
              />
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-900)' }}>{book.name}</div>
                <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 2 }}>
                  Created On: {fmtBookDate(book.createdAt || book.created_at)} | 1 Members
                </div>
              </div>
            </label>
          ))}
        </div>

        {/* Footer */}
        <div style={{ borderTop: '1px solid var(--gray-200)', background: '#F9FAFB', flexShrink: 0 }}>
          {/* Moving from → to strip */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, padding: '12px 20px', borderBottom: '1px solid var(--gray-200)' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 500, marginBottom: 2 }}>Moving from</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-800)' }}>{currentBook.name}</div>
            </div>
            <div style={{ padding: '0 16px', color: 'var(--gray-400)', fontSize: 18 }}>→</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 500, marginBottom: 2 }}>Moving to</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: targetBook ? 'var(--blue)' : 'var(--gray-400)' }}>
                {targetBook?.name || 'Select a book'}
              </div>
            </div>
          </div>
          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 10, padding: '12px 20px' }}>
            <button
              onClick={() => selectedId && setShowConfirm(true)}
              disabled={!selectedId || moving}
              style={{
                padding: '10px 28px', borderRadius: 7, border: 'none',
                background: selectedId ? 'var(--blue)' : 'var(--gray-200)',
                color: selectedId ? 'white' : 'var(--gray-400)',
                fontSize: 14, fontWeight: 600, cursor: selectedId ? 'pointer' : 'not-allowed',
              }}
              onMouseEnter={(e) => { if (selectedId) e.currentTarget.style.background = '#1D4ED8'; }}
              onMouseLeave={(e) => { if (selectedId) e.currentTarget.style.background = 'var(--blue)'; }}
            >
              {moving ? 'Moving...' : 'Move'}
            </button>
            <button
              onClick={onClose}
              style={{ padding: '10px 28px', borderRadius: 7, border: '1px solid var(--gray-200)', background: 'var(--white)', fontSize: 14, fontWeight: 500, color: 'var(--gray-700)', cursor: 'pointer' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gray-50)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'var(--white)'}
            >Cancel</button>
          </div>
        </div>
      </div>

      {showConfirm && targetBook && (
        <MoveConfirmModal
          count={count}
          targetBookName={targetBook.name}
          onConfirm={handleConfirmMove}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
}

/* ─── Copy Confirm Modal ────────────────────────────────────── */
function CopyConfirmModal({ count, targetBookName, onConfirm, onCancel }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 900 }} onClick={onCancel}>
      <div style={{ background: 'var(--white)', borderRadius: 12, width: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.25)', overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--gray-100)' }}>
          <span style={{ fontSize: 16, fontWeight: 500, color: 'var(--gray-900)' }}>Copy &amp; Paste {count} {count === 1 ? 'Entry' : 'Entries'}</span>
          <button onClick={onCancel} style={{ display: 'flex', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--gray-500)', padding: 2 }}><X size={18} /></button>
        </div>
        <div style={{ padding: '20px 24px' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-800)', marginBottom: 14 }}>Are you sure?</div>
          <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 8, listStyle: 'none' }}>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: 'var(--gray-600)', lineHeight: 1.55 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--gray-400)', marginTop: 5, flexShrink: 0 }} />
              Same {count === 1 ? 'entry' : 'entries'} will get added in <strong style={{ color: 'var(--gray-900)', marginLeft: 4 }}>`{targetBookName}`</strong>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: 'var(--gray-600)', lineHeight: 1.55 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--gray-400)', marginTop: 5, flexShrink: 0 }} />
              This will change the net balance of <strong style={{ color: 'var(--gray-900)', marginLeft: 4 }}>`{targetBookName}`</strong>
            </li>
          </ul>
        </div>
        <div style={{ padding: '14px 20px', borderTop: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'center', gap: 12 }}>
          <button onClick={onCancel} style={{ padding: '10px 28px', borderRadius: 7, border: '1.5px solid var(--gray-200)', background: 'var(--white)', fontSize: 14, fontWeight: 600, color: 'var(--gray-700)', cursor: 'pointer' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gray-50)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--white)'}
          >Cancel</button>
          <button onClick={onConfirm} style={{ padding: '10px 28px', borderRadius: 7, border: 'none', background: 'var(--blue)', fontSize: 14, fontWeight: 600, color: 'white', cursor: 'pointer' }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#1D4ED8'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--blue)'}
          >Yes, Copy &amp; Paste</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Copy Entry panel ──────────────────────────────────────── */
function CopyEntryPanel({ txns, currentBook, targetBooks, businessId, onClose, onCopied }) {
  const [selectedId, setSelectedId] = useState(targetBooks[0]?.id || null);
  const [search, setSearch] = useState('');
  const [copying, setCopying] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const shown = targetBooks.filter((b) => b.name.toLowerCase().includes(search.toLowerCase()));
  const targetBook = targetBooks.find((b) => b.id === selectedId);
  const count = txns.length;

  const handleConfirmCopy = async () => {
    setCopying(true);
    setShowConfirm(false);
    try {
      for (const txn of txns) {
        await api.transactions.create(businessId, selectedId, {
          type: txn.type,
          amount: txn.amount,
          date: txn.date,
          party: txn.party || null,
          remarks: txn.remarks || null,
          category: txn.category || null,
          payment_mode: txn.payment_mode || txn.paymentMode || null,
        });
      }
      onCopied();
    } catch (err) {
      console.error('[CopyEntry]', err.message);
    } finally {
      setCopying(false);
    }
  };

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 600 }} onClick={onClose} />
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 460, background: 'var(--white)', zIndex: 700, display: 'flex', flexDirection: 'column', boxShadow: '-4px 0 30px rgba(0,0,0,0.18)' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid var(--gray-100)', flexShrink: 0 }}>
          <span style={{ fontSize: 16, fontWeight: 500, color: 'var(--gray-900)' }}>Copy {count} {count === 1 ? 'Entry' : 'Entries'}</span>
          <button onClick={onClose} style={{ display: 'flex', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--gray-500)', padding: 2 }}><X size={18} /></button>
        </div>

        {/* Subtitle + Search */}
        <div style={{ padding: '14px 20px 10px', flexShrink: 0 }}>
          <div style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 12 }}>Select a book where you want to <strong style={{ color: 'var(--gray-700)' }}>duplicate</strong> {count === 1 ? 'this entry' : 'these entries'}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', border: '1px solid var(--gray-200)', borderRadius: 7, background: 'var(--gray-50)' }}>
            <Search size={13} color="var(--gray-400)" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search book name..."
              style={{ border: 'none', background: 'none', outline: 'none', flex: 1, fontSize: 13, color: 'var(--gray-700)' }}
            />
            <kbd style={{ padding: '1px 5px', background: 'var(--gray-200)', borderRadius: 3, fontSize: 11, color: 'var(--gray-500)' }}>/</kbd>
          </div>
        </div>

        {/* Book list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
          {shown.length === 0 ? (
            <div style={{ padding: '24px 20px', textAlign: 'center', fontSize: 13, color: 'var(--gray-400)' }}>
              {targetBooks.length === 0 ? 'No other cashbooks available' : 'No books match your search'}
            </div>
          ) : shown.map((book, idx) => (
            <label key={book.id} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px',
              cursor: 'pointer', borderBottom: idx < shown.length - 1 ? '1px solid var(--gray-100)' : 'none',
              background: selectedId === book.id ? '#F0F4FF' : 'var(--white)',
            }}
              onMouseEnter={(e) => { if (selectedId !== book.id) e.currentTarget.style.background = 'var(--gray-50)'; }}
              onMouseLeave={(e) => { if (selectedId !== book.id) e.currentTarget.style.background = 'var(--white)'; }}
            >
              <input
                type="radio"
                checked={selectedId === book.id}
                onChange={() => setSelectedId(book.id)}
                style={{ accentColor: 'var(--blue)', width: 16, height: 16, cursor: 'pointer', flexShrink: 0 }}
              />
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-900)' }}>{book.name}</div>
                <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 2 }}>
                  Created On: {fmtBookDate(book.createdAt || book.created_at)} | 1 Members
                </div>
              </div>
            </label>
          ))}
        </div>

        {/* Footer */}
        <div style={{ borderTop: '1px solid var(--gray-200)', background: '#F9FAFB', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid var(--gray-200)' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 500, marginBottom: 2 }}>Copy from</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-800)' }}>{currentBook.name}</div>
            </div>
            <div style={{ padding: '0 16px', color: 'var(--gray-400)', fontSize: 18 }}>→</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 500, marginBottom: 2 }}>Copy to</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: targetBook ? 'var(--blue)' : 'var(--gray-400)' }}>
                {targetBook?.name || 'Select a book'}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, padding: '12px 20px' }}>
            <button
              onClick={() => { if (selectedId) setShowConfirm(true); }}
              disabled={!selectedId || copying}
              style={{
                padding: '10px 28px', borderRadius: 7, border: 'none',
                background: selectedId ? 'var(--blue)' : 'var(--gray-200)',
                color: selectedId ? 'white' : 'var(--gray-400)',
                fontSize: 14, fontWeight: 600, cursor: selectedId ? 'pointer' : 'not-allowed',
              }}
              onMouseEnter={(e) => { if (selectedId) e.currentTarget.style.background = '#1D4ED8'; }}
              onMouseLeave={(e) => { if (selectedId) e.currentTarget.style.background = 'var(--blue)'; }}
            >
              {copying ? 'Copying...' : 'Copy'}
            </button>
            <button
              onClick={onClose}
              style={{ padding: '10px 28px', borderRadius: 7, border: '1px solid var(--gray-200)', background: 'var(--white)', fontSize: 14, fontWeight: 500, color: 'var(--gray-700)', cursor: 'pointer' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gray-50)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'var(--white)'}
            >Cancel</button>
          </div>
        </div>
      </div>

      {showConfirm && targetBook && (
        <CopyConfirmModal
          count={count}
          targetBookName={targetBook.name}
          onConfirm={handleConfirmCopy}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
}

function SelectionBar({ selectedCount, allSelected, onSelectAll, onDeselectAll, onDelete, onMoveEntry, onCopyEntry }) {
  const moveOrCopyItems = [
    {
      label: 'Move Entry',
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>,
      onClick: onMoveEntry,
    },
    {
      label: 'Copy Entry',
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>,
      onClick: onCopyEntry,
    },
    {
      label: 'Copy Opposite Entry',
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
    },
  ];

  const changeFieldItems = [
    {
      label: 'Change Category',
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>,
    },
    {
      label: 'Change Payment Mode',
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>,
    },
    {
      label: 'Change Party',
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
    },
  ];

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '8px 16px', background: '#EFF6FF',
      borderBottom: '1px solid #BFDBFE', flexShrink: 0,
    }}>
      {/* Select All checkbox */}
      <label style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', paddingRight: 10, borderRight: '1px solid #BFDBFE', marginRight: 4 }}>
        <input
          type="checkbox"
          checked={allSelected}
          onChange={(e) => e.target.checked ? onSelectAll() : onDeselectAll()}
          style={{ accentColor: 'var(--blue)', width: 14, height: 14, cursor: 'pointer' }}
        />
        <span style={{ fontSize: 13, color: 'var(--blue)', fontWeight: 500, whiteSpace: 'nowrap' }}>Select All</span>
      </label>

      {/* Delete */}
      <button
        onClick={onDelete}
        style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px',
          border: '1px solid #FCA5A5', borderRadius: 5,
          background: 'var(--white)', fontSize: 13, fontWeight: 500,
          color: '#DC2626', cursor: 'pointer', whiteSpace: 'nowrap',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#FEF2F2'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--white)'; }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        </svg>
        Delete
      </button>

      {/* Move or Copy */}
      <ActionDropdown
        label="Move or Copy"
        icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>}
        items={moveOrCopyItems}
      />

      {/* Change Fields */}
      <ActionDropdown
        label="Change Fields"
        icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" /></svg>}
        items={changeFieldItems}
      />
    </div>
  );
}

/* ─── Main page ─────────────────────────────────────────────── */
export default function TransactionView() {
  const { businessId, bookId } = useParams();
  const { cashbooks, teamMembers, currentBusiness, user } = useApp();
  const navigate = useNavigate();
  const isPrimaryAdmin = !currentBusiness?.my_role || currentBusiness?.my_role === 'Primary Admin';
  const book = cashbooks.find((b) => b.id === bookId);

  const [myBookRole, setMyBookRole] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [showEntry, setShowEntry] = useState(false);
  const [entryType, setEntryType] = useState('IN');
  const [bookParties, setBookParties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [deleteTargets, setDeleteTargets] = useState([]);
  const [moveTargets, setMoveTargets] = useState([]);
  const [copyTargets, setCopyTargets] = useState([]);
  const [editTarget, setEditTarget] = useState(null);
  const [hoveredRowId, setHoveredRowId] = useState(null);
  const [detailTxn, setDetailTxn] = useState(null);

  /* filters */
  const [duration, setDuration] = useState('All Time');
  const [txnType, setTxnType] = useState('All');
  const [partyFilter, setPartyFilter] = useState([]);
  const [memberFilter, setMemberFilter] = useState(null);
  const [payModes, setPayModes] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState([]);
  const [searchQ, setSearchQ] = useState('');
  const [customCategories, setCustomCategories] = useState([]);
  const [customPaymentModes, setCustomPaymentModes] = useState([]);

  const FS_KEY = `cashbook_field_settings_${bookId}`;
  const [fieldSettings] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(FS_KEY) || '{"showParty":true,"showCategory":true,"showPaymentMode":true,"categoryRequired":false,"paymentModeRequired":false}');
    } catch {
      return { showParty: true, showCategory: true, showPaymentMode: true, categoryRequired: false, paymentModeRequired: false };
    }
  });

  const searchRef = useRef(null);

  // Book-level permissions derived from my_role returned by the transactions API
  const canWrite = !myBookRole || ['Primary Admin', 'Data Operator', 'Book Admin'].includes(myBookRole);
  const canEditDelete = !myBookRole || ['Primary Admin', 'Book Admin'].includes(myBookRole);
  const canManageMembers = !myBookRole || isPrimaryAdmin || myBookRole === 'Book Admin';

  const fetchBookData = useCallback(async (showLoader = false) => {
    if (!bookId || !businessId) return;
    if (showLoader) setLoading(true);
    try {
      const [txnData, partyData, settingsData] = await Promise.all([
        api.transactions.list(businessId, bookId),
        api.parties.list(businessId, bookId),
        api.cashbooks.getSettings(businessId, bookId),
      ]);
      setTransactions(txnData.transactions.map((t) => ({
        ...t,
        amount: parseFloat(t.amount),
        type: t.type,
      })));
      setMyBookRole(txnData.my_role || 'Primary Admin');
      setBookParties(partyData.parties);
      setCustomCategories(settingsData.categories.map(c => c.name));
      setCustomPaymentModes(settingsData.paymentModes.map(p => p.name));
    } catch (err) {
      console.error('[TransactionView] load failed:', err.message);
    } finally {
      if (showLoader) setLoading(false);
    }
  }, [businessId, bookId]);

  /* Load transactions + parties from API and poll every 5s */
  useEffect(() => {
    fetchBookData(true);
    const intervalId = setInterval(() => fetchBookData(false), 5000);
    return () => clearInterval(intervalId);
  }, [fetchBookData]);

  /* "/" shortcut for search */
  useEffect(() => {
    const h = (e) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, []);

  const goToSettings = () => navigate(`/businesses/${businessId}/cashbooks/${bookId}/settings`);

  const handleAddCustomCategory = async (name) => {
    try {
      await api.cashbooks.addCategory(businessId, bookId, name);
      setCustomCategories(prev => [...prev, name]);
    } catch (err) {
      console.error('[Add Category Failed]:', err.message);
    }
  };

  const handleAddCustomPaymentMode = async (name) => {
    try {
      await api.cashbooks.addPaymentMode(businessId, bookId, name);
      setCustomPaymentModes(prev => [...prev, name]);
    } catch (err) {
      console.error('[Add Payment Mode Failed]:', err.message);
    }
  };

  const addTransaction = useCallback(async (txn) => {
    try {
      const { transaction } = await api.transactions.create(businessId, bookId, {
        type: txn.type,
        amount: txn.amount,
        date: txn.date,
        party: txn.party || null,
        remarks: txn.remarks || null,
        category: txn.category || null,
        payment_mode: txn.paymentMode || null,
        attachments: txn.attachments || null,
        customFields: txn.customFields || null,
        created_at: txn.created_at || null,
      });
      setTransactions((prev) => [{ ...transaction, amount: parseFloat(transaction.amount) }, ...prev]);
    } catch (err) {
      console.error('[addTransaction]', err.message);
      alert('Failed to save entry: ' + err.message);
    }
  }, [businessId, bookId]);

  const addParty = useCallback(async (partyData) => {
    try {
      const { party } = await api.parties.create(businessId, bookId, partyData);
      setBookParties((prev) => [...prev, party]);
      return party;
    } catch (err) {
      console.error('[addParty]', err.message);
      throw err;
    }
  }, [businessId, bookId]);

  const updateTransaction = useCallback(async (txn) => {
    try {
      const { transaction } = await api.transactions.update(businessId, bookId, txn.id, {
        type: txn.type,
        amount: txn.amount,
        date: txn.date,
        party: txn.party || null,
        remarks: txn.remarks || null,
        category: txn.category || null,
        payment_mode: txn.paymentMode || null,
        attachments: txn.attachments || null,
        customFields: txn.customFields || null,
        created_at: txn.created_at || null,
      });
      setTransactions((prev) => prev.map((t) => t.id === txn.id
        ? { ...transaction, amount: parseFloat(transaction.amount), customFields: transaction.customFields || {} }
        : t
      ));
    } catch (err) {
      console.error('[updateTransaction]', err.message);
      alert('Failed to update entry: ' + err.message);
    }
  }, [businessId, bookId]);

  const totalIn = transactions.filter((t) => t.type === 'IN').reduce((s, t) => s + t.amount, 0);
  const totalOut = transactions.filter((t) => t.type === 'OUT').reduce((s, t) => s + t.amount, 0);
  const balance = totalIn - totalOut;

  const availableModes = [...new Set(transactions.map((t) => t.payment_mode || t.paymentMode).filter(Boolean))].sort();
  const availableCategories = [...new Set(transactions.map((t) => t.category).filter(Boolean))].sort();

  const filtered = transactions.filter((t) => {
    if (duration !== 'All Time') {
      const txDate = new Date(t.date + 'T00:00:00');
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
      const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      if (duration === 'Today' && (txDate < today || txDate >= tomorrow)) return false;
      if (duration === 'Yesterday' && (txDate < yesterday || txDate >= today)) return false;
      if (duration === 'This Month' && (txDate < monthStart || txDate >= nextMonth)) return false;
      if (duration === 'Last Month' && (txDate < lastMonthStart || txDate >= monthStart)) return false;
    }
    if (txnType === 'Cash In' && t.type !== 'IN') return false;
    if (txnType === 'Cash Out' && t.type !== 'OUT') return false;
    if (partyFilter.length > 0 && !partyFilter.includes(t.party)) return false;
    if (memberFilter && t.memberId !== memberFilter) return false;
    if (payModes.length > 0 && !payModes.includes(t.payment_mode || t.paymentMode)) return false;
    if (categoryFilter.length > 0 && !categoryFilter.includes(t.category)) return false;
    if (searchQ) {
      const q = searchQ.toLowerCase();
      if (!t.remarks?.toLowerCase().includes(q) && !String(t.amount).includes(q)) return false;
    }
    return true;
  });

  const anyFilterActive = duration !== 'All Time' || txnType !== 'All' || partyFilter.length > 0 || !!memberFilter || payModes.length > 0 || categoryFilter.length > 0;
  const clearAllFilters = () => { setDuration('All Time'); setTxnType('All'); setPartyFilter([]); setMemberFilter(null); setPayModes([]); setCategoryFilter([]); };

  if (!book) {
    return (
      <div style={{ padding: 24 }}>
        <button
          onClick={() => navigate(`/businesses/${businessId}/cashbooks`)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--blue)', fontSize: 13, cursor: 'pointer', border: 'none', background: 'none' }}
        >
          <ArrowLeft size={15} /> Back to Cashbooks
        </button>
        <p style={{ marginTop: 16, color: 'var(--gray-500)' }}>Book not found.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - var(--topbar-height))', background: 'var(--white)' }}>

      {/* ── Header ── */}
      <div style={{
        padding: '12px 20px',
        borderBottom: '1px solid var(--gray-200)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'var(--white)', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => navigate(`/businesses/${businessId}/cashbooks`)}
            style={{ display: 'flex', alignItems: 'center', color: 'var(--gray-500)', cursor: 'pointer', border: 'none', background: 'none', padding: 4, borderRadius: 4 }}
          >
            <ArrowLeft size={18} />
          </button>
          <span style={{ fontSize: 16, fontWeight: 500, color: 'var(--gray-900)' }}>{book.name}</span>
          <button
            onClick={goToSettings}
            title="Book Settings"
            style={{ display: 'flex', alignItems: 'center', padding: 4, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--gray-400)' }}
          >
            <Settings size={15} />
          </button>
          {canManageMembers && (
            <button
              title="Book Members"
              style={{ display: 'flex', alignItems: 'center', padding: 4, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--blue)' }}
              onClick={() => navigate(`/businesses/${businessId}/cashbooks/${bookId}/settings`)}
            >
              <Users size={15} />
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {canWrite && (
            <button style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 12px', borderRadius: 6,
              border: '1px solid var(--gray-200)', background: 'var(--white)',
              fontSize: 13, fontWeight: 500, cursor: 'pointer', color: 'var(--gray-700)',
            }}>
              <FileText size={13} />
              Add Bulk Entries
            </button>
          )}
          <button style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 12px', borderRadius: 6,
            border: '1px solid var(--gray-200)', background: 'var(--white)',
            fontSize: 13, fontWeight: 500, cursor: 'pointer', color: 'var(--gray-700)',
          }}>
            <CheckSquare size={13} />
            Reports
          </button>
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div style={{
        padding: '8px 20px', borderBottom: '1px solid var(--gray-100)',
        display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
        background: 'var(--white)', flexShrink: 0,
      }}>
        <DurationFilter value={duration} onChange={setDuration} />
        <TypesFilter value={txnType} onChange={setTxnType} />
        <PartiesFilter parties={bookParties} value={partyFilter} onChange={setPartyFilter} onGoToSettings={goToSettings} />
        <MembersFilter members={teamMembers} value={memberFilter} onChange={setMemberFilter} />
        {fieldSettings?.showPaymentMode !== false && <PaymentModesFilter modes={availableModes} value={payModes} onChange={setPayModes} />}
        {fieldSettings?.showCategory !== false && <CategoriesFilter categories={availableCategories} value={categoryFilter} onChange={setCategoryFilter} />}
        {anyFilterActive && (
          <button
            onClick={clearAllFilters}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 10px', border: 'none', background: 'none', fontSize: 13, color: '#DC2626', cursor: 'pointer', fontWeight: 500 }}
          >
            <X size={13} /> Clear All
          </button>
        )}
      </div>

      {/* ── Search + action row ── */}
      <div style={{
        padding: '8px 20px', borderBottom: '1px solid var(--gray-100)',
        display: 'flex', alignItems: 'center', gap: 10,
        background: 'var(--white)', flexShrink: 0,
      }}>
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', gap: 8,
          padding: '6px 12px', border: '1px solid var(--gray-200)', borderRadius: 6,
          background: 'var(--white)',
        }}>
          <Search size={13} color="var(--gray-400)" />
          <input
            ref={searchRef}
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            placeholder="Search by remark or amount..."
            style={{ border: 'none', outline: 'none', flex: 1, fontSize: 13, background: 'transparent' }}
          />
          {searchQ ? (
            <X size={13} style={{ cursor: 'pointer', color: 'var(--gray-400)' }} onClick={() => setSearchQ('')} />
          ) : (
            <kbd style={{ padding: '1px 5px', background: 'var(--gray-100)', borderRadius: 3, fontSize: 11, border: '1px solid var(--gray-200)', color: 'var(--gray-500)' }}>/</kbd>
          )}
        </div>
        {canWrite && (
          <>
            <button
              onClick={() => { setEntryType('IN'); setShowEntry(true); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 16px', borderRadius: 6,
                border: 'none', background: '#16A34A',
                fontSize: 13, fontWeight: 600, cursor: 'pointer', color: 'white', whiteSpace: 'nowrap',
              }}
            >
              <Plus size={14} /> Cash In
            </button>
            <button
              onClick={() => { setEntryType('OUT'); setShowEntry(true); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 16px', borderRadius: 6,
                border: 'none', background: '#DC2626',
                fontSize: 13, fontWeight: 600, cursor: 'pointer', color: 'white', whiteSpace: 'nowrap',
              }}
            >
              <Plus size={14} /> Cash Out
            </button>
          </>
        )}
      </div>

      {/* ── Balance strip ── */}
      <div style={{
        display: 'flex', alignItems: 'stretch', gap: 0,
        borderBottom: '1px solid var(--gray-200)', background: 'var(--white)', flexShrink: 0,
      }}>
        <div style={{ flex: 1, padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 10, borderRight: '1px solid var(--gray-200)' }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 17, fontWeight: 500, color: '#16A34A', lineHeight: 1 }}>+</span>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--gray-500)', fontWeight: 500 }}>Cash In</div>
            <div style={{ fontSize: 17, fontWeight: 500, color: '#16A34A' }}>{formatAmount(totalIn)}</div>
          </div>
        </div>
        <div style={{ flex: 1, padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 10, borderRight: '1px solid var(--gray-200)' }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 17, fontWeight: 500, color: '#DC2626', lineHeight: 1 }}>-</span>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--gray-500)', fontWeight: 500 }}>Cash Out</div>
            <div style={{ fontSize: 17, fontWeight: 500, color: '#DC2626' }}>{formatAmount(totalOut)}</div>
          </div>
        </div>
        <div style={{ flex: 1, padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: balance >= 0 ? '#DCFCE7' : '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 17, fontWeight: 500, color: balance >= 0 ? '#16A34A' : '#DC2626', lineHeight: 1 }}>=</span>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--gray-500)', fontWeight: 500 }}>Net Balance</div>
            <div style={{ fontSize: 17, fontWeight: 500, color: balance >= 0 ? '#16A34A' : '#DC2626' }}>
              {formatAmount(Math.abs(balance))}{balance < 0 ? ' Dr' : ''}
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {filtered.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, color: 'var(--gray-400)' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Info size={24} color="var(--gray-300)" />
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--gray-500)' }}>No entries added Yet!</div>
            <div style={{ fontSize: 13, color: 'var(--gray-400)' }}>Add Cash In or Cash Out to get started</div>
          </div>
        ) : (
          <>
            {/* Pagination info bar */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '7px 16px', background: 'var(--gray-50)', borderBottom: '1px solid var(--gray-200)',
              fontSize: 12, color: 'var(--gray-500)', flexShrink: 0,
            }}>
              <span>
                Showing 1 - {filtered.length} of {filtered.length} entries
                {selectedRows.size > 0 && (
                  <span style={{ marginLeft: 8, color: 'var(--blue)', fontWeight: 600 }}>
                    | {selectedRows.size} selected in this page
                  </span>
                )}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span>Page</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '2px 7px', border: '1px solid var(--gray-200)', borderRadius: 4, background: 'var(--white)', cursor: 'default', fontSize: 12 }}>
                  1 <ChevronDown size={10} />
                </span>
                <span>of 1</span>
                <button style={{ padding: '2px 7px', border: '1px solid var(--gray-200)', borderRadius: 4, background: 'var(--white)', fontSize: 12, cursor: 'default', color: 'var(--gray-300)' }}>&lt;</button>
                <button style={{ padding: '2px 7px', border: '1px solid var(--gray-200)', borderRadius: 4, background: 'var(--white)', fontSize: 12, cursor: 'default', color: 'var(--gray-300)' }}>&gt;</button>
              </div>
            </div>

            {/* ── Selection action bar ── */}
            {selectedRows.size > 0 && <SelectionBar
              selectedCount={selectedRows.size}
              allSelected={selectedRows.size === filtered.length}
              onSelectAll={() => setSelectedRows(new Set(filtered.map((t) => t.id)))}
              onDeselectAll={() => setSelectedRows(new Set())}
              onDelete={() => setDeleteTargets(filtered.filter((t) => selectedRows.has(t.id)))}
              onMoveEntry={() => setMoveTargets(filtered.filter((t) => selectedRows.has(t.id)))}
              onCopyEntry={() => setCopyTargets(filtered.filter((t) => selectedRows.has(t.id)))}
            />}

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--gray-50)', borderBottom: '1px solid var(--gray-200)' }}>
                  {canEditDelete && (
                    <th style={{ padding: '9px 12px', width: 36, textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        style={{ accentColor: 'var(--blue)', cursor: 'pointer' }}
                        onChange={(e) => setSelectedRows(e.target.checked ? new Set(filtered.map((t) => t.id)) : new Set())}
                      />
                    </th>
                  )}
                  {[
                    { label: 'Date & Time', align: 'left' },
                    { label: 'Details', align: 'left' },
                    ...(fieldSettings?.showCategory !== false ? [{ label: 'Category', align: 'left' }] : []),
                    ...(fieldSettings?.showPaymentMode !== false ? [{ label: 'Mode', align: 'left' }] : []),
                    { label: 'Bill', align: 'center' },
                    { label: 'Amount', align: 'right' },
                    { label: 'Balance', align: 'right' },
                    { label: '', align: 'right' },
                  ].map((h) => (
                    <th key={h.label} style={{
                      padding: '9px 12px', textAlign: h.align,
                      fontSize: 12, fontWeight: 600, color: 'var(--gray-500)', whiteSpace: 'nowrap',
                      width: h.label === '' ? 72 : undefined,
                    }}>{h.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const totalBalance = filtered.reduce((s, tx) => tx.type === 'IN' ? s + tx.amount : s - tx.amount, 0);
                  return filtered.map((t, i) => {
                    const aboveSum = filtered.slice(0, i).reduce((s, tx) => tx.type === 'IN' ? s + tx.amount : s - tx.amount, 0);
                    const rowBalance = totalBalance - aboveSum;
                    const { dateLabel, time } = formatDateTime(t.date, t.created_at);
                    const isSelected = selectedRows.has(t.id);
                    return (
                      <tr key={t.id}
                        onClick={() => setDetailTxn(t)}
                        onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = 'var(--gray-50)'; setHoveredRowId(t.id); }}
                        onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent'; setHoveredRowId(null); }}
                        style={{ borderBottom: '1px solid var(--gray-100)', cursor: 'pointer', background: isSelected ? '#EFF6FF' : 'transparent' }}
                      >
                        {canEditDelete && (
                          <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              style={{ accentColor: 'var(--blue)', cursor: 'pointer' }}
                              onChange={(e) => {
                                const next = new Set(selectedRows);
                                e.target.checked ? next.add(t.id) : next.delete(t.id);
                                setSelectedRows(next);
                              }}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </td>
                        )}
                        <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-700)' }}>{dateLabel}</div>
                          <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 1 }}>{time}</div>
                        </td>
                        <td style={{ padding: '10px 12px', maxWidth: 240 }}>
                          {t.party ? (
                            <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              <span style={{ color: 'var(--blue)' }}>({t.party})</span>
                              {t.partyType && <span style={{ color: 'var(--gray-400)', fontWeight: 400 }}> ({t.partyType})</span>}
                            </div>
                          ) : null}
                          {t.remarks ? (
                            <div style={{ fontSize: t.party ? 12 : 13, color: t.party ? 'var(--gray-500)' : 'var(--gray-800)', fontWeight: t.party ? 400 : 500, marginTop: t.party ? 1 : 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.remarks}</div>
                          ) : !t.party ? (
                            <span style={{ fontSize: 13, color: 'var(--gray-300)' }}>—</span>
                          ) : null}
                          {t.created_by && (
                            <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 2 }}>
                              by {t.created_by === user?.id ? 'You' : (t.created_by_name || 'Unknown')}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '10px 12px', fontSize: 12, color: 'var(--gray-500)', whiteSpace: 'nowrap' }}>
                          {t.category || <span style={{ color: 'var(--gray-300)' }}>—</span>}
                        </td>
                        <td style={{ padding: '10px 12px', fontSize: 12, color: 'var(--blue)', whiteSpace: 'nowrap', fontWeight: 500 }}>
                          {t.payment_mode || t.paymentMode || <span style={{ color: 'var(--gray-300)', fontWeight: 400 }}>—</span>}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                          {(() => {
                            const atts = parseAtts(t);
                            if (atts.length === 0) return <span style={{ color: 'var(--gray-300)' }}>—</span>;
                            return (
                              <div
                                onClick={(e) => { e.stopPropagation(); setDetailTxn(t); }}
                                title="View attachments"
                                style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 2, cursor: 'pointer' }}
                              >
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--blue)' }}>
                                  <Paperclip size={14} />
                                  <span style={{ fontSize: 13, fontWeight: 600 }}>{atts.length}</span>
                                </span>
                                <span style={{ fontSize: 11, color: 'var(--gray-500)' }}>
                                  {atts.length === 1 ? 'Attachment' : 'Attachments'}
                                </span>
                              </div>
                            );
                          })()}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <span style={{ fontSize: 13, fontWeight: 500, color: t.type === 'IN' ? '#16A34A' : '#DC2626' }}>
                            {t.type === 'IN' ? '+' : '-'}{formatAmount(t.amount)}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: rowBalance < 0 ? '#DC2626' : 'var(--gray-700)' }}>
                            {formatAmount(Math.abs(rowBalance))}{rowBalance < 0 ? ' Dr' : ''}
                          </span>
                        </td>
                        <td style={{ padding: '10px 8px', textAlign: 'right', whiteSpace: 'nowrap', width: 72 }}>
                          {canEditDelete && hoveredRowId === t.id && (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                              <button
                                onClick={(e) => { e.stopPropagation(); setEditTarget(t); }}
                                style={{ padding: '4px 6px', border: '1px solid #BFDBFE', borderRadius: 5, background: 'white', cursor: 'pointer', color: 'var(--blue)', display: 'flex', alignItems: 'center' }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#EFF6FF'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                                title="Edit"
                              >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); setDeleteTargets([t]); }}
                                style={{ padding: '4px 6px', border: '1px solid #FCA5A5', borderRadius: 5, background: 'white', cursor: 'pointer', color: '#DC2626', display: 'flex', alignItems: 'center' }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#FEF2F2'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                                title="Delete"
                              >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                  <path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </>
        )}
      </div>

      {/* ── Edit Entry panel ── */}
      {editTarget && (
        <EditEntryPanel
          txn={editTarget}
          onSave={async (data) => { await updateTransaction(data); setEditTarget(null); }}
          onClose={() => setEditTarget(null)}
          bookParties={bookParties}
          onAddParty={addParty}
          businessId={businessId}
          bookId={bookId}
          customCategories={customCategories}
          customPaymentModes={customPaymentModes}
          onAddCustomCategory={handleAddCustomCategory}
          onAddCustomPaymentMode={handleAddCustomPaymentMode}
          fieldSettings={fieldSettings}
        />
      )}

      {/* ── Entry Panel ── */}
      {showEntry && (
        <EntryPanel
          type={entryType}
          onTypeChange={setEntryType}
          onSave={addTransaction}
          onClose={() => setShowEntry(false)}
          bookParties={bookParties.map((p) => p.name)}
          onAddParty={addParty}
          businessId={businessId}
          bookId={bookId}
          customCategories={customCategories}
          customPaymentModes={customPaymentModes}
          onAddCustomCategory={handleAddCustomCategory}
          onAddCustomPaymentMode={handleAddCustomPaymentMode}
          fieldSettings={fieldSettings}
        />
      )}

      {/* ── Delete confirm modal ── */}
      {deleteTargets.length > 0 && (
        <DeleteConfirmModal
          txns={deleteTargets}
          onClose={() => setDeleteTargets([])}
          onConfirm={async () => {
            const ids = deleteTargets.map((t) => t.id);
            await Promise.all(ids.map((id) => api.transactions.delete(businessId, bookId, id).catch(() => { })));
            setTransactions((prev) => prev.filter((t) => !ids.includes(t.id)));
            setSelectedRows((prev) => { const next = new Set(prev); ids.forEach((id) => next.delete(id)); return next; });
            setDeleteTargets([]);
          }}
        />
      )}

      {/* ── Move Entry panel ── */}
      {moveTargets.length > 0 && (
        <MoveEntryPanel
          txns={moveTargets}
          currentBook={book}
          targetBooks={cashbooks.filter((b) => b.id !== bookId)}
          businessId={businessId}
          onClose={() => setMoveTargets([])}
          onMoved={(ids) => {
            setTransactions((prev) => prev.filter((t) => !ids.includes(t.id)));
            setSelectedRows((prev) => { const next = new Set(prev); ids.forEach((id) => next.delete(id)); return next; });
            setMoveTargets([]);
          }}
        />
      )}

      {/* ── Copy Entry panel ── */}
      {copyTargets.length > 0 && (
        <CopyEntryPanel
          txns={copyTargets}
          currentBook={book}
          targetBooks={cashbooks.filter((b) => b.id !== bookId)}
          businessId={businessId}
          onClose={() => setCopyTargets([])}
          onCopied={() => setCopyTargets([])}
        />
      )}

      {/* ── Entry Details panel (view) ── */}
      {detailTxn && (
        <EntryDetailsPanel
          txn={detailTxn}
          user={user}
          canEditDelete={canEditDelete}
          onClose={() => setDetailTxn(null)}
          onEdit={() => { setEditTarget(detailTxn); setDetailTxn(null); }}
          onDelete={() => { setDeleteTargets([detailTxn]); setDetailTxn(null); }}
          onMove={() => { setMoveTargets([detailTxn]); setDetailTxn(null); }}
          onCopy={() => { setCopyTargets([detailTxn]); setDetailTxn(null); }}
        />
      )}
    </div>
  );
}
