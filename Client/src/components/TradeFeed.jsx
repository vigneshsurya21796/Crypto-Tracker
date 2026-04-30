import { useEffect, useRef, useState } from 'react';
import socket from '../socket/socket';

const MAX = 20;

const fmtTime = (d) =>
  d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

const TradeFeed = ({ symbol }) => {
  const [trades, setTrades] = useState([]);
  const listRef = useRef(null);

  useEffect(() => {
    setTrades([]);
    const onPrice = (data) => {
      if (data.symbol !== symbol) return;
      const trade = {
        id:    Date.now() + Math.random(),
        price: data.price,
        qty:   parseFloat((Math.random() * 0.5 + 0.001).toFixed(4)),
        side:  Math.random() > 0.5 ? 'BUY' : 'SELL',
        time:  new Date(),
      };
      setTrades((prev) => [trade, ...prev].slice(0, MAX));
    };
    socket.on('price', onPrice);
    return () => socket.off('price', onPrice);
  }, [symbol]);

  return (
    <div className="card" style={{ padding: '14px', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        fontSize: '11px', fontWeight: 700, color: 'var(--text-3)',
        textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '10px',
      }}>
        Recent Trades
      </div>

      {/* Column labels */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
        padding: '0 6px', marginBottom: '4px',
      }}>
        {['Price', 'Qty', 'Time'].map((h) => (
          <span key={h} style={{ fontSize: '10px', color: 'var(--text-3)' }}>{h}</span>
        ))}
      </div>

      {/* Rows */}
      <div
        ref={listRef}
        style={{ flex: 1, overflowY: 'auto', maxHeight: '220px', display: 'flex', flexDirection: 'column', gap: '1px' }}
      >
        {trades.length === 0 && (
          <div style={{ color: 'var(--text-3)', fontSize: '12px', textAlign: 'center', padding: '20px 0' }}>
            Waiting for trades…
          </div>
        )}
        {trades.map((t) => (
          <div key={t.id} style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
            padding: '3px 6px', borderRadius: '3px',
          }}>
            <span style={{
              fontSize: '12px', fontWeight: 500,
              color: t.side === 'BUY' ? 'var(--green)' : 'var(--red)',
            }}>
              {t.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-2)' }}>{t.qty}</span>
            <span style={{ fontSize: '11px', color: 'var(--text-3)' }}>{fmtTime(t.time)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TradeFeed;
