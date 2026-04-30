import useStore from '../store/useStore';

const ALL_SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT'];

const fmt = (n) =>
  n != null
    ? `$${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : '—';

const Watchlist = ({ coinMeta = {} }) => {
  const { watchlist, activeSymbol, setActiveSymbol, addToWatchlist, removeFromWatchlist, prices } = useStore();
  const addable = ALL_SYMBOLS.filter((s) => !watchlist.includes(s));

  return (
    <div className="card" style={{ padding: '14px' }}>
      {/* Header */}
      <div style={{
        fontSize: '11px', fontWeight: 700, color: 'var(--text-3)',
        textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '10px',
      }}>
        Watchlist
      </div>

      {/* Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {watchlist.map((symbol) => {
          const data   = prices[symbol];
          const change = data?.change ?? 0;
          const up     = change >= 0;
          const active = symbol === activeSymbol;
          const meta   = coinMeta[symbol];

          return (
            <div
              key={symbol}
              onClick={() => setActiveSymbol(symbol)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 10px',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                background: active ? 'var(--blue-dim)' : 'var(--surface-2)',
                border: active ? '1px solid var(--blue)' : '1px solid transparent',
                transition: 'background 0.12s, border-color 0.12s',
              }}
            >
              {/* Coin color dot */}
              {meta && (
                <span style={{
                  width: '7px', height: '7px', borderRadius: '50%',
                  background: meta.color, flexShrink: 0,
                }} />
              )}

              {/* Symbol */}
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', flex: 1 }}>
                {symbol.replace('USDT', '')}
              </span>

              {/* Price + change */}
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>
                  {fmt(data?.price)}
                </div>
                <div style={{
                  fontSize: '10px', fontWeight: 500,
                  color: up ? 'var(--green)' : 'var(--red)',
                }}>
                  {up ? '+' : ''}{Number(change).toFixed(2)}%
                </div>
              </div>

              {/* Remove */}
              {watchlist.length > 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); removeFromWatchlist(symbol); }}
                  style={{
                    marginLeft: '4px', background: 'none', border: 'none',
                    cursor: 'pointer', color: 'var(--text-3)', fontSize: '12px',
                    padding: '2px 4px', borderRadius: '4px',
                    lineHeight: 1,
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--red)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-3)'}
                >
                  ✕
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Add symbols */}
      {addable.length > 0 && (
        <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
          {addable.map((s) => (
            <button
              key={s}
              onClick={() => addToWatchlist(s)}
              style={{
                fontSize: '11px', fontWeight: 600,
                background: 'var(--surface-3)',
                border: '1px solid var(--border-2)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-2)',
                padding: '3px 8px',
                cursor: 'pointer',
              }}
            >
              + {s.replace('USDT', '')}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Watchlist;
