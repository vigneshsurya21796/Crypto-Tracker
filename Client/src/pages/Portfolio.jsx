import useStore from '../store/useStore';

const SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT'];

const COIN_META = {
  BTCUSDT: { name: 'Bitcoin',  short: 'BTC', color: '#f7931a' },
  ETHUSDT: { name: 'Ethereum', short: 'ETH', color: '#627eea' },
  SOLUSDT: { name: 'Solana',   short: 'SOL', color: '#9945ff' },
  BNBUSDT: { name: 'BNB',      short: 'BNB', color: '#f3ba2f' },
};

const fmt = (n, dec = 2) =>
  n != null
    ? Number(n).toLocaleString(undefined, { minimumFractionDigits: dec, maximumFractionDigits: dec })
    : '—';

const fmtUSD = (n) => (n != null ? `$${fmt(n)}` : '—');

const Portfolio = () => {
  const { prices, holdings, setHolding } = useStore();

  // Compute per-coin values
  const rows = SYMBOLS.map((symbol) => {
    const price  = prices[symbol]?.price ?? 0;
    const change = prices[symbol]?.change ?? 0;
    const qty    = holdings[symbol] ?? 0;
    const value  = qty * price;
    return { symbol, price, change, qty, value };
  });

  const totalValue = rows.reduce((s, r) => s + r.value, 0);

  // Weighted 24h change
  const totalChange = totalValue > 0
    ? rows.reduce((s, r) => s + (r.value / totalValue) * r.change, 0)
    : 0;

  const changeUp = totalChange >= 0;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px 16px' }}>

      {/* ── Total value card ─────────────────────────────────────── */}
      <div className="card" style={{ padding: '20px 24px', marginBottom: '16px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '10px' }}>
          Total Portfolio Value
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '36px', fontWeight: 800, letterSpacing: '-1.5px', color: 'var(--text)' }}>
            <span style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-2)' }}>$</span>
            {fmt(totalValue)}
          </span>
          <span style={{
            fontSize: '14px', fontWeight: 600,
            color:      changeUp ? 'var(--green)' : 'var(--red)',
            background: changeUp ? 'var(--green-dim)' : 'var(--red-dim)',
            borderRadius: 'var(--radius-sm)', padding: '3px 10px',
          }}>
            {changeUp ? '▲' : '▼'} {changeUp ? '+' : ''}{fmt(totalChange)}% (24h)
          </span>
        </div>

        {/* Allocation bar */}
        {totalValue > 0 && (
          <div style={{ display: 'flex', height: '6px', borderRadius: '3px', overflow: 'hidden', marginTop: '16px', gap: '2px' }}>
            {rows.filter((r) => r.value > 0).map((r) => (
              <div
                key={r.symbol}
                title={`${COIN_META[r.symbol].short}: ${fmt((r.value / totalValue) * 100)}%`}
                style={{
                  flex: r.value / totalValue,
                  background: COIN_META[r.symbol].color,
                  borderRadius: '2px',
                  transition: 'flex 0.4s ease',
                }}
              />
            ))}
          </div>
        )}

        {/* Allocation legend */}
        {totalValue > 0 && (
          <div style={{ display: 'flex', gap: '16px', marginTop: '10px', flexWrap: 'wrap' }}>
            {rows.filter((r) => r.value > 0).map((r) => (
              <div key={r.symbol} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: COIN_META[r.symbol].color, display: 'inline-block' }} />
                <span style={{ fontSize: '11px', color: 'var(--text-2)', fontWeight: 500 }}>
                  {COIN_META[r.symbol].short} {fmt((r.value / totalValue) * 100, 1)}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Holdings table ────────────────────────────────────────── */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {/* Table header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 160px 120px 120px 80px',
          padding: '10px 16px',
          borderBottom: '1px solid var(--border)',
          gap: '8px',
        }}>
          {['Asset', 'Holdings', 'Price', 'Value', '24h'].map((h) => (
            <span key={h} style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {h}
            </span>
          ))}
        </div>

        {/* Rows */}
        {rows.map((row, i) => {
          const meta = COIN_META[row.symbol];
          const up   = row.change >= 0;
          return (
            <div
              key={row.symbol}
              style={{
                display: 'grid', gridTemplateColumns: '1fr 160px 120px 120px 80px',
                padding: '12px 16px', gap: '8px', alignItems: 'center',
                borderBottom: i < rows.length - 1 ? '1px solid var(--border)' : 'none',
                transition: 'background 0.12s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-2)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              {/* Asset */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: meta.color, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>{meta.short}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-3)' }}>{meta.name}</div>
                </div>
              </div>

              {/* Holdings input */}
              <input
                type="number"
                min="0"
                step="any"
                placeholder="0.00"
                value={row.qty || ''}
                onChange={(e) => setHolding(row.symbol, e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border-2)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '5px 8px',
                  fontSize: '13px', fontWeight: 500,
                  color: 'var(--text)',
                  outline: 'none',
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--blue)'}
                onBlur={(e)  => e.target.style.borderColor = 'var(--border-2)'}
              />

              {/* Price */}
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)' }}>
                {fmtUSD(row.price)}
              </span>

              {/* Value */}
              <span style={{ fontSize: '13px', fontWeight: 600, color: row.value > 0 ? 'var(--text)' : 'var(--text-3)' }}>
                {row.value > 0 ? fmtUSD(row.value) : '—'}
              </span>

              {/* 24h change */}
              <span style={{
                fontSize: '12px', fontWeight: 600,
                color: up ? 'var(--green)' : 'var(--red)',
              }}>
                {up ? '+' : ''}{fmt(row.change)}%
              </span>
            </div>
          );
        })}
      </div>

      {/* Hint */}
      <p style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '12px', textAlign: 'center' }}>
        Enter your holdings above — values update in real time from the live feed.
      </p>
    </div>
  );
};

export default Portfolio;
