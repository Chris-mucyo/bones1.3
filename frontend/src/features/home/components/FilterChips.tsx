interface Props {
  categories: string[];
  active:     string;
  onChange:   (cat: string) => void;
  isDark:     boolean;
}

export default function FilterChips({ categories, active, onChange, isDark }: Props) {
  return (
    <div style={{
      position: 'sticky', top: 56, zIndex: 40,
      background: isDark ? 'rgba(0,0,0,0.94)' : 'rgba(245,245,245,0.95)',
      backdropFilter: 'blur(14px)',
      borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
      padding: '10px 20px',
      display: 'flex', gap: 8,
      overflowX: 'auto',
      scrollbarWidth: 'none',
    }}>
      {categories.map(cat => {
        const isActive = cat === active;
        return (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            style={{
              display: 'flex', alignItems: 'center',
              padding: '6px 14px', borderRadius: 20,
              border: `1px solid ${isActive ? '#22c55e' : (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)')}`,
              background: isActive ? '#22c55e' : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'),
              color: isActive ? '#000' : (isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.65)'),
              fontSize: 12, fontWeight: 600,
              cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
              transition: 'all .2s', fontFamily: "'Outfit', sans-serif",
            }}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}
