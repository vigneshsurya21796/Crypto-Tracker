import { useEffect, useRef, useState } from 'react';
import useStore from '../store/useStore';

const fmt = (n, dec = 2) =>
  n != null
    ? Number(n).toLocaleString(undefined, { minimumFractionDigits: dec, maximumFractionDigits: dec })
    : '—';

const fmtVol = (v) => {
  if (v == null) return '—';
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(2) + 'M';
  if (v >= 1_000)     return (v / 1_000).toFixed(1) + 'K';
  return String(v);
};

const StatBox = ({ label, value }) => (
  <div>
    <div style={{ fontSize: '10px', color: 'var(--text-3)', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {label}
    </div>
    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{value}</div>
  </div>
);

const PriceCard = ({ symbol, meta }) => {
  const data  = useStore((s) => s.prices[symbol]);
  const prevPrice = useRef(null);
  const [flash, setFlash] = useState('');

  useEffect(() => {
    if (!data?.price) return;
    if (prevPrice.current !== null && prevPrice.current !== data.price) {
      setFlash(data.price > prevPrice.current ? 'flash-up' : 'flash-dn');
      const t = setTimeout(() => setFlash(''), 550);
      return () => clearTimeout(t);
    }
    prevPrice.current = data.price;
  }, [data?.price]);

  useEffect(() => {
    if (data?.price) prevPrice.current = data.price;
  }, [data?.price]);

  const change = data?.change ?? 0;
  const up = change >= 0;
  const changeColor = up ? 'var(--green)' : 'var(--red)';
  const changeBg    = up ? 'var(--green-dim)' : 'var(--red-dim)';

  return (
    <div
      className={`card ${flash}`}
      style={{ padding: '18px 16px' }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {meta && (
            <span style={{
              width: '9px', height: '9px', borderRadius: '50%',
              background: meta.color, display: 'inline-block', flexShrink: 0,
            }} />
          )}
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>
              {symbol.replace('USDT', '')}/USDT
            </div>
            {meta && (
              <div style={{ fontSize: '10px', color: 'var(--text-3)', marginTop: '2px' }}>{meta.name}</div>
            )}
          </div>
        </div>

        {/* Change badge */}
        <span style={{
          fontSize: '12px', fontWeight: 600, color: changeColor,
          background: changeBg, borderRadius: 'var(--radius-sm)',
          padding: '3px 8px',
        }}>
          {up ? '▲' : '▼'} {up ? '+' : ''}{fmt(change)}%
        </span>
      </div>

      {/* Price */}
      <div style={{
        fontSize: '28px', fontWeight: 800, color: 'var(--text)',
        letterSpacing: '-1px', marginBottom: '16px', lineHeight: 1,
      }}>
        <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-2)', marginRight: '2px' }}>$</span>
        {fmt(data?.price)}
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px solid var(--border)', marginBottom: '14px' }} />

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
        <StatBox label="24h High" value={data?.high ? `$${fmt(data.high)}` : '—'} />
        <StatBox label="24h Low"  value={data?.low  ? `$${fmt(data.low)}`  : '—'} />
        <StatBox label="Volume"   value={fmtVol(data?.volume)} />
      </div>
    </div>
  );
};

export default PriceCard;
