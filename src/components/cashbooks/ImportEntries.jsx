import { useState, useRef, useCallback } from 'react';
import { ArrowLeft, Upload, Download, FileSpreadsheet, ChevronRight, CheckCircle2, AlertCircle, X, Pencil } from 'lucide-react';
import * as XLSX from 'xlsx';
import { api, getToken } from '../../api';

/* ─── helpers ──────────────────────────────────────── */
function formatNumber(n) {
  if (n === undefined || n === null || n === '') return '';
  const num = Number(n);
  if (isNaN(num)) return String(n);
  return new Intl.NumberFormat('en-IN').format(num);
}

function tryParseDate(raw) {
  if (!raw) return null;
  const s = String(raw).trim();

  // Excel serial number
  if (/^\d{5}(\.\d+)?$/.test(s)) {
    const d = XLSX.SSF.parse_date_code(Number(s));
    if (d) return `${d.y}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}`;
  }

  // DD/MM/YYYY or DD-MM-YYYY
  const dmy = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
  if (dmy) return `${dmy[3]}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`;

  // YYYY-MM-DD already
  const ymd = s.match(/^(\d{4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})$/);
  if (ymd) return `${ymd[1]}-${ymd[2].padStart(2, '0')}-${ymd[3].padStart(2, '0')}`;

  // "11 Apr 2024" / "Apr 11, 2024" etc.
  const d = new Date(s);
  if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];

  return null;
}

function tryParseTime(raw) {
  if (!raw) return null;
  const s = String(raw).trim();
  // "10:05 PM", "02:48 PM", "11:42 AM"
  const m = s.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (m) {
    let h = parseInt(m[1], 10);
    const min = m[2];
    const period = m[3].toUpperCase();
    if (period === 'PM' && h !== 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    return `${String(h).padStart(2, '0')}:${min}:00`;
  }
  // "14:30" 24h
  const m24 = s.match(/^(\d{1,2}):(\d{2})$/);
  if (m24) return `${m24[1].padStart(2, '0')}:${m24[2]}:00`;
  return null;
}

// Known column names and their mappings
const COLUMN_ALIASES = {
  date: ['date', 'txn date', 'transaction date', 'entry date'],
  time: ['time', 'txn time', 'entry time'],
  remark: ['remark', 'remarks', 'description', 'narration', 'note', 'notes', 'particular', 'particulars'],
  party: ['party', 'party name', 'customer', 'vendor', 'name'],
  category: ['category', 'categories', 'type', 'head'],
  mode: ['mode', 'payment mode', 'payment method', 'pay mode'],
  entryBy: ['entry by', 'entered by', 'created by', 'user'],
  cashIn: ['cash in', 'cashin', 'credit', 'cr', 'receipt', 'received', 'income', 'deposit', 'amount in'],
  cashOut: ['cash out', 'cashout', 'debit', 'dr', 'payment', 'paid', 'expense', 'withdrawal', 'amount out'],
  balance: ['balance', 'running balance', 'net', 'total'],
};

function detectColumnMapping(headers) {
  const mapping = {};
  headers.forEach((h, idx) => {
    const lower = String(h).toLowerCase().trim();
    for (const [field, aliases] of Object.entries(COLUMN_ALIASES)) {
      if (aliases.includes(lower) && !(field in mapping)) {
        mapping[field] = idx;
      }
    }
  });
  return mapping;
}

/* ─── Component ────────────────────────────────────── */
export default function ImportEntries({ businessId, bookId, bookName, onClose, onImported }) {
  // Step: 'upload' | 'preview' | 'mapping' | 'importing' | 'done'
  const [step, setStep] = useState('upload');
  const [fileName, setFileName] = useState('');
  const [rawData, setRawData] = useState([]);   // full sheet as array of arrays
  const [headingRow, setHeadingRow] = useState(1);
  const [startRow, setStartRow] = useState(2);
  const [endRow, setEndRow] = useState(2);
  const [editingRows, setEditingRows] = useState(false);
  const [columnMap, setColumnMap] = useState({});
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  // Parse uploaded file
  const handleFile = useCallback((e) => {
    setError('');
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const wb = XLSX.read(data, { type: 'array', cellDates: false });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

        if (rows.length < 2) {
          setError('File mein kam se kam 2 rows honi chahiye (1 header + 1 data row).');
          return;
        }

        setRawData(rows);
        setHeadingRow(1);
        setStartRow(2);
        setEndRow(rows.length);

        // Auto-detect columns from first row
        const headers = rows[0].map(String);
        const map = detectColumnMapping(headers);
        setColumnMap(map);

        setStep('preview');
      } catch (err) {
        setError('File parse nahi ho paayi: ' + err.message);
      }
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const headers = rawData.length >= headingRow ? rawData[headingRow - 1]?.map(String) || [] : [];
  const dataRows = rawData.slice(startRow - 1, endRow);

  // Calculate running balance for preview
  const previewWithBalance = dataRows.map((row) => {
    const cashInIdx = columnMap.cashIn;
    const cashOutIdx = columnMap.cashOut;
    const cashIn = cashInIdx !== undefined ? parseFloat(row[cashInIdx]) || 0 : 0;
    const cashOut = cashOutIdx !== undefined ? parseFloat(row[cashOutIdx]) || 0 : 0;
    return { row, cashIn, cashOut };
  });

  let runBal = 0;
  previewWithBalance.forEach((p) => { runBal += p.cashIn - p.cashOut; p.balance = runBal; });

  // Build entries for import
  const buildEntries = () => {
    return dataRows.map((row) => {
      const get = (field) => columnMap[field] !== undefined ? String(row[columnMap[field]] ?? '').trim() : '';

      const rawDate = get('date');
      const rawTime = get('time');
      const cashIn = parseFloat(get('cashIn')) || 0;
      const cashOut = parseFloat(get('cashOut')) || 0;

      if (!rawDate && cashIn === 0 && cashOut === 0) return null; // skip empty rows

      const date = tryParseDate(rawDate);
      if (!date) return null; // skip rows with no valid date

      const time = tryParseTime(rawTime);
      let created_at = null;
      if (date && time) {
        created_at = new Date(`${date}T${time}`).toISOString();
      }

      const type = cashIn > 0 ? 'IN' : 'OUT';
      const amount = cashIn > 0 ? cashIn : cashOut;
      if (amount <= 0) return null;

      return {
        type,
        amount,
        date,
        remarks: get('remark') || null,
        party: get('party') || null,
        category: get('category') || null,
        payment_mode: get('mode') || null,
        created_at,
      };
    }).filter(Boolean);
  };

  const handleImport = async () => {
    const entries = buildEntries();
    if (entries.length === 0) {
      setError('Koi valid entries nahi mili import ke liye. Date aur Amount columns sahi se map hain check karo.');
      return;
    }

    setImporting(true);
    setStep('importing');
    try {
      const result = await api.transactions.bulkCreate(businessId, bookId, entries);
      setImportResult(result);
      setStep('done');
      if (result.imported > 0 && onImported) {
        onImported();
      }
    } catch (err) {
      setError('Import failed: ' + err.message);
      setStep('mapping');
    } finally {
      setImporting(false);
    }
  };

  const handleDownloadSample = () => {
    const url = api.transactions.sampleCsvUrl(businessId, bookId);
    const token = getToken();
    // Open with auth token as query param for download
    const a = document.createElement('a');
    a.href = url + (token ? `?token=${token}` : '');
    a.download = 'cashbook_sample_import.csv';

    // Alternative: fetch with auth header
    fetch(url, {
      headers: { Authorization: token ? `Bearer ${token}` : '' },
      credentials: 'include',
    })
      .then(r => r.blob())
      .then(blob => {
        const blobUrl = URL.createObjectURL(blob);
        a.href = blobUrl;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      })
      .catch(() => {
        // fallback - direct open
        window.open(url, '_blank');
      });
  };

  // Column mapping dropdown handler
  const handleMapChange = (field, colIdx) => {
    setColumnMap(prev => {
      const next = { ...prev };
      if (colIdx === '') {
        delete next[field];
      } else {
        next[field] = parseInt(colIdx, 10);
      }
      return next;
    });
  };

  /* ─── Styles ─────────────────────────────────────── */
  const containerStyle = {
    display: 'flex', flexDirection: 'column',
    height: 'calc(100vh - var(--topbar-height))',
    background: '#F9FAFB', overflow: 'hidden',
  };
  const headerStyle = {
    padding: '16px 24px', borderBottom: '1px solid #E5E7EB',
    display: 'flex', alignItems: 'center', gap: 12,
    background: '#fff', flexShrink: 0,
  };
  const contentStyle = {
    flex: 1, overflow: 'auto', padding: '24px 32px',
  };
  const footerStyle = {
    padding: '14px 32px', borderTop: '1px solid #E5E7EB',
    display: 'flex', justifyContent: 'flex-end', gap: 12,
    background: '#fff', flexShrink: 0,
  };
  const cardStyle = {
    background: '#fff', border: '1px solid #E5E7EB',
    borderRadius: 10, padding: '18px 22px', marginBottom: 20,
  };

  /* ─── Render ─────────────────────────────────────── */
  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <button
          onClick={onClose}
          style={{
            display: 'flex', alignItems: 'center', padding: 4,
            border: 'none', background: 'none', cursor: 'pointer',
            color: '#6B7280',
          }}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <span style={{ fontSize: 18, fontWeight: 600, color: '#111827' }}>
            Import Entries
          </span>
          {bookName && (
            <span style={{ fontSize: 14, color: '#9CA3AF', marginLeft: 10 }}>
              ({bookName})
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={contentStyle}>

        {/* ── Error banner ── */}
        {error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 16px', borderRadius: 8, marginBottom: 20,
            background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B',
          }}>
            <AlertCircle size={18} />
            <span style={{ fontSize: 14, flex: 1 }}>{error}</span>
            <button onClick={() => setError('')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#991B1B', padding: 2 }}>
              <X size={16} />
            </button>
          </div>
        )}

        {/* ── Step: UPLOAD ── */}
        {(step === 'upload' || step === 'preview' || step === 'mapping') && (
          <>
            {/* File input */}
            <div style={{ marginBottom: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
                Select a CSV file <span style={{ color: '#DC2626' }}>*</span>
              </label>
            </div>
            <div style={{ marginBottom: 20 }}>
              <input
                ref={fileRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFile}
                style={{
                  padding: '10px 14px', border: '2px solid #D1D5DB',
                  borderRadius: 8, fontSize: 14, background: '#fff',
                  cursor: 'pointer', width: 280,
                  ...(fileName ? { borderColor: '#2563EB' } : {}),
                }}
              />
            </div>

            {/* Download sample */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: '#ECFDF5', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <FileSpreadsheet size={18} style={{ color: '#059669' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>
                      Download Sample File
                    </div>
                    <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>
                      Your CSV file should have same columns as this sample file
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleDownloadSample}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '8px 16px', borderRadius: 6,
                    border: 'none', background: 'none',
                    fontSize: 14, fontWeight: 600, cursor: 'pointer',
                    color: '#2563EB',
                  }}
                >
                  <Download size={16} />
                  Download CSV
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── Step: PREVIEW — parsed data table ── */}
        {(step === 'preview' || step === 'mapping') && rawData.length > 0 && (
          <>
            <div style={{ marginBottom: 8 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>
                Parsed Data
              </h3>
              <p style={{ fontSize: 13, color: '#6B7280', margin: '4px 0 0' }}>
                Here is parsed data from your uploaded file. Please verify and click on "Next" to proceed
              </p>
            </div>

            {/* Row config */}
            <div style={{
              display: 'flex', gap: 20, alignItems: 'flex-start',
              marginBottom: 16, flexWrap: 'wrap',
            }}>
              <div style={{ flex: '1 1 200px' }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 4 }}>
                  Heading Row
                </label>
                <input
                  type="number" min={1} max={rawData.length}
                  value={headingRow}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    if (v >= 1 && v <= rawData.length) {
                      setHeadingRow(v);
                      if (v >= startRow) setStartRow(v + 1);
                      // re-detect columns
                      const h = rawData[v - 1]?.map(String) || [];
                      setColumnMap(detectColumnMapping(h));
                    }
                  }}
                  style={{
                    width: '100%', padding: '8px 12px', border: '1px solid #D1D5DB',
                    borderRadius: 6, fontSize: 14, background: '#fff',
                  }}
                />
                <div style={{ fontSize: 11, color: '#DC2626', marginTop: 3 }}>
                  This row will be considered as the heading row
                </div>
              </div>
              <div style={{ flex: '1 1 200px' }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 4 }}>
                  Entries Start Row
                </label>
                <input
                  type="number" min={1} max={rawData.length}
                  value={startRow}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    if (v >= 1 && v <= rawData.length) setStartRow(v);
                  }}
                  style={{
                    width: '100%', padding: '8px 12px', border: '1px solid #D1D5DB',
                    borderRadius: 6, fontSize: 14, background: '#fff',
                  }}
                />
                <div style={{ fontSize: 11, color: '#DC2626', marginTop: 3 }}>
                  This row will be considered as starting row for entries
                </div>
              </div>
              <div style={{ flex: '1 1 200px' }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 4 }}>
                  Entries End Row
                </label>
                <input
                  type="number" min={startRow} max={rawData.length}
                  value={endRow}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    if (v >= startRow && v <= rawData.length) setEndRow(v);
                  }}
                  style={{
                    width: '100%', padding: '8px 12px', border: '1px solid #D1D5DB',
                    borderRadius: 6, fontSize: 14, background: '#fff',
                  }}
                />
                <div style={{ fontSize: 11, color: '#DC2626', marginTop: 3 }}>
                  This row will be considered as last row of entries
                </div>
              </div>
            </div>

            {/* Data table */}
            <div style={{
              border: '1px solid #E5E7EB', borderRadius: 8,
              overflow: 'auto', maxHeight: 420,
              background: '#fff',
            }}>
              <table style={{
                width: '100%', borderCollapse: 'collapse',
                fontSize: 13, whiteSpace: 'nowrap',
              }}>
                <thead>
                  <tr style={{ background: '#F9FAFB', position: 'sticky', top: 0, zIndex: 2 }}>
                    <th style={thStyle}>#</th>
                    {headers.map((h, i) => (
                      <th key={i} style={thStyle}>{h}</th>
                    ))}
                    {columnMap.cashIn !== undefined && columnMap.cashOut !== undefined && (
                      <th style={thStyle}>Balance</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {previewWithBalance.map((p, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #F3F4F6' }}>
                      <td style={tdStyle}>{startRow + idx}</td>
                      {p.row.map((cell, ci) => (
                        <td key={ci} style={{
                          ...tdStyle,
                          ...(ci === columnMap.cashIn && cell ? { color: '#059669', fontWeight: 600 } : {}),
                          ...(ci === columnMap.cashOut && cell ? { color: '#DC2626', fontWeight: 600 } : {}),
                        }}>
                          {ci === columnMap.cashIn || ci === columnMap.cashOut ? formatNumber(cell) : String(cell)}
                        </td>
                      ))}
                      {columnMap.cashIn !== undefined && columnMap.cashOut !== undefined && (
                        <td style={{
                          ...tdStyle, fontWeight: 600,
                          color: p.balance >= 0 ? '#059669' : '#DC2626',
                        }}>
                          {p.balance < 0 ? '-' : ''}{formatNumber(Math.abs(p.balance))}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── Step: MAPPING — column assignment ── */}
        {step === 'mapping' && (
          <div style={{ marginTop: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 6px' }}>
              Column Mapping
            </h3>
            <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 16px' }}>
              Verify that each column is mapped correctly. Change mapping if needed.
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: 14,
            }}>
              {[
                { field: 'date', label: 'Date *', required: true },
                { field: 'time', label: 'Time' },
                { field: 'remark', label: 'Remark' },
                { field: 'party', label: 'Party' },
                { field: 'category', label: 'Category' },
                { field: 'mode', label: 'Payment Mode' },
                { field: 'cashIn', label: 'Cash In *', required: true },
                { field: 'cashOut', label: 'Cash Out *', required: true },
              ].map(({ field, label, required }) => (
                <div key={field} style={{
                  padding: '12px 14px', borderRadius: 8,
                  border: `1px solid ${required && columnMap[field] === undefined ? '#FECACA' : '#E5E7EB'}`,
                  background: '#fff',
                }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
                    {label}
                  </label>
                  <select
                    value={columnMap[field] !== undefined ? columnMap[field] : ''}
                    onChange={(e) => handleMapChange(field, e.target.value)}
                    style={{
                      width: '100%', padding: '7px 10px', borderRadius: 5,
                      border: '1px solid #D1D5DB', fontSize: 13, background: '#fff',
                      color: columnMap[field] !== undefined ? '#111827' : '#9CA3AF',
                    }}
                  >
                    <option value="">— Not Mapped —</option>
                    {headers.map((h, i) => (
                      <option key={i} value={i}>{h || `Column ${i + 1}`}</option>
                    ))}
                  </select>
                  {columnMap[field] !== undefined && (
                    <div style={{ fontSize: 11, color: '#059669', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CheckCircle2 size={11} /> Mapped to "{headers[columnMap[field]]}"
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Import preview count */}
            <div style={{
              marginTop: 20, padding: '14px 18px', borderRadius: 8,
              background: '#EFF6FF', border: '1px solid #BFDBFE',
            }}>
              <span style={{ fontSize: 14, color: '#1E40AF', fontWeight: 600 }}>
                {buildEntries().length} valid entries ready to import
              </span>
              <span style={{ fontSize: 13, color: '#6B7280', marginLeft: 8 }}>
                out of {dataRows.length} rows
              </span>
            </div>
          </div>
        )}

        {/* ── Step: IMPORTING ── */}
        {step === 'importing' && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: '80px 0', gap: 16,
          }}>
            <div style={{
              width: 44, height: 44, border: '4px solid #E5E7EB',
              borderTopColor: '#2563EB', borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p style={{ fontSize: 16, fontWeight: 600, color: '#374151' }}>
              Importing entries...
            </p>
            <p style={{ fontSize: 13, color: '#9CA3AF' }}>
              Please wait, yeh thoda time le sakta hai
            </p>
          </div>
        )}

        {/* ── Step: DONE ── */}
        {step === 'done' && importResult && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: '60px 0', gap: 16,
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: importResult.imported > 0 ? '#ECFDF5' : '#FEF2F2',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {importResult.imported > 0
                ? <CheckCircle2 size={32} style={{ color: '#059669' }} />
                : <AlertCircle size={32} style={{ color: '#DC2626' }} />
              }
            </div>

            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>
              Import {importResult.imported > 0 ? 'Successful' : 'Failed'}!
            </h3>

            <div style={{
              display: 'flex', gap: 24, marginTop: 8,
            }}>
              <div style={{
                padding: '16px 24px', borderRadius: 10,
                background: '#ECFDF5', border: '1px solid #A7F3D0',
                textAlign: 'center', minWidth: 120,
              }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#059669' }}>
                  {importResult.imported}
                </div>
                <div style={{ fontSize: 12, color: '#065F46', fontWeight: 600 }}>
                  Imported
                </div>
              </div>
              {importResult.failed > 0 && (
                <div style={{
                  padding: '16px 24px', borderRadius: 10,
                  background: '#FEF2F2', border: '1px solid #FECACA',
                  textAlign: 'center', minWidth: 120,
                }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: '#DC2626' }}>
                    {importResult.failed}
                  </div>
                  <div style={{ fontSize: 12, color: '#991B1B', fontWeight: 600 }}>
                    Failed
                  </div>
                </div>
              )}
            </div>

            {importResult.errors?.length > 0 && (
              <div style={{
                marginTop: 16, padding: '14px 18px', borderRadius: 8,
                background: '#FEF2F2', border: '1px solid #FECACA',
                maxHeight: 160, overflow: 'auto', width: '100%', maxWidth: 500,
              }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#991B1B', marginBottom: 8 }}>
                  Error Details:
                </div>
                {importResult.errors.slice(0, 20).map((e, i) => (
                  <div key={i} style={{ fontSize: 12, color: '#7F1D1D', marginBottom: 3 }}>
                    Row {e.row}: {e.error}
                  </div>
                ))}
                {importResult.errors.length > 20 && (
                  <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 6 }}>
                    ...and {importResult.errors.length - 20} more errors
                  </div>
                )}
              </div>
            )}

            <button
              onClick={onClose}
              style={{
                marginTop: 20, padding: '10px 28px', borderRadius: 8,
                border: 'none', background: '#2563EB', color: '#fff',
                fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}
            >
              Done — Back to Cashbook
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      {(step === 'upload' || step === 'preview' || step === 'mapping') && (
        <div style={footerStyle}>
          <button
            onClick={onClose}
            style={{
              padding: '9px 22px', borderRadius: 8,
              border: '1px solid #D1D5DB', background: '#fff',
              fontSize: 14, fontWeight: 500, cursor: 'pointer',
              color: '#374151',
            }}
          >
            Cancel
          </button>

          {step === 'upload' && (
            <button
              disabled={!fileName}
              onClick={() => setStep('preview')}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '9px 22px', borderRadius: 8,
                border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                background: fileName ? '#6D28D9' : '#D1D5DB',
                color: fileName ? '#fff' : '#9CA3AF',
              }}
            >
              Next: Select Header And Preview Entries <ChevronRight size={16} />
            </button>
          )}

          {step === 'preview' && (
            <button
              onClick={() => setStep('mapping')}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '9px 22px', borderRadius: 8,
                border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                background: '#6D28D9', color: '#fff',
              }}
            >
              Next: Select Header And Preview Entries <ChevronRight size={16} />
            </button>
          )}

          {step === 'mapping' && (
            <button
              disabled={importing || columnMap.date === undefined || (columnMap.cashIn === undefined && columnMap.cashOut === undefined)}
              onClick={handleImport}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '9px 22px', borderRadius: 8,
                border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                background: (columnMap.date !== undefined && (columnMap.cashIn !== undefined || columnMap.cashOut !== undefined)) ? '#059669' : '#D1D5DB',
                color: (columnMap.date !== undefined && (columnMap.cashIn !== undefined || columnMap.cashOut !== undefined)) ? '#fff' : '#9CA3AF',
              }}
            >
              <Upload size={16} />
              Import {buildEntries().length} Entries
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Table cell styles ────────────────────────────── */
const thStyle = {
  padding: '10px 12px', textAlign: 'left',
  fontSize: 12, fontWeight: 700, color: '#6B7280',
  borderBottom: '2px solid #E5E7EB',
  background: '#F9FAFB',
};

const tdStyle = {
  padding: '9px 12px', textAlign: 'left',
  fontSize: 13, color: '#374151',
};
