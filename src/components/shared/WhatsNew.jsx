import { useState } from 'react';
import { useApp } from '../../context/AppContext';

export default function WhatsNew() {
  const { whatsNew } = useApp();
  const [visibleCount, setVisibleCount] = useState(2);

  const visible = whatsNew.slice(0, visibleCount);

  return (
    <div style={{ padding: 24, maxWidth: 860 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 500, marginBottom: 4 }}>What's New</h1>
        <p style={{ fontSize: 13, color: 'var(--gray-500)' }}>
          Feature updates in CashBook. We ship fast, so you can improve your spend management process faster!
        </p>
      </div>

      {visible.map((release) => (
        <div key={release.version} style={{ marginBottom: 36 }}>
          {/* Date + version */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <span style={{ fontSize: 12, color: 'var(--gray-400)', minWidth: 80 }}>{release.date}</span>
            <span style={{
              padding: '3px 10px', borderRadius: 20, background: 'var(--gray-100)',
              fontSize: 11, fontWeight: 500, color: 'var(--gray-600)',
            }}>{release.version}</span>
          </div>

          {/* Single category release */}
          {release.category && release.items && (
            <div>
              <CategoryBadge label={release.category} />
              {release.items.map((item) => <ReleaseItem key={item.title} item={item} />)}
            </div>
          )}

          {/* Multi-category release */}
          {release.categories && release.categories.map((cat) => (
            <div key={cat.label} style={{ marginBottom: 12 }}>
              <CategoryBadge label={cat.label} />
              {cat.items.map((item) => <ReleaseItem key={item.title} item={item} />)}
            </div>
          ))}
        </div>
      ))}

      {visibleCount < whatsNew.length && (
        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <button
            onClick={() => setVisibleCount((v) => v + 2)}
            style={{
              padding: '10px 24px', borderRadius: 8, border: '1px solid var(--gray-200)',
              fontSize: 13, fontWeight: 500, cursor: 'pointer', background: 'var(--white)',
              color: 'var(--gray-600)',
            }}
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}

function CategoryBadge({ label }) {
  const colors = {
    Payments: { bg: '#DBEAFE', color: '#1D4ED8' },
    General: { bg: '#F3F4F6', color: '#374151' },
  };
  const c = colors[label] || colors.General;
  return (
    <span style={{
      display: 'inline-flex', padding: '3px 10px', borderRadius: 4,
      background: c.bg, color: c.color, fontSize: 11, fontWeight: 500,
      marginBottom: 12, marginLeft: 92,
    }}>
      {label}
    </span>
  );
}

function ReleaseItem({ item }) {
  return (
    <div style={{
      display: 'flex', gap: 16, marginBottom: 16, paddingBottom: 16,
      borderBottom: '1px solid var(--gray-100)',
    }}>
      <div style={{ minWidth: 80 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 6, color: 'var(--gray-900)' }}>
          {item.title}
        </div>
        {item.description && (
          <div style={{ fontSize: 13, color: 'var(--gray-600)', lineHeight: 1.6, marginBottom: item.bullets ? 8 : 0 }}>
            {item.description}
          </div>
        )}
        {item.bullets && (
          <ul style={{ paddingLeft: 18, margin: '6px 0' }}>
            {item.bullets.map((b) => (
              <li key={b} style={{ fontSize: 13, color: 'var(--gray-600)', marginBottom: 4, lineHeight: 1.5 }}>
                {b.includes(':') ? (
                  <>
                    <strong style={{ color: 'var(--gray-800)' }}>{b.split(':')[0]}:</strong>
                    {b.split(':').slice(1).join(':')}
                  </>
                ) : b}
              </li>
            ))}
          </ul>
        )}
        {item.link && (
          <a style={{ color: 'var(--blue)', fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>
            {item.link} &gt;
          </a>
        )}
      </div>
    </div>
  );
}
