import { useEffect, useState } from 'react';
import socket from '../socket/socket';

const LEVELS = 6;

const genOrders = (mid, side) =>
  Array.from({ length: LEVELS }, (_, i) => {
    const offset = (i + 1) * mid * 0.00018;
    const price  = side === 'ask' ? mid + offset : mid - offset;
    const qty    = parseFloat((Math.random() * 2.5 + 0.05).toFixed(4));
    return { price, qty };
  });

const fmtPrice = (n) =>
  n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const PanelHeader = ({ title }) => (
  <div style={{
    fontSize: '11px', fontWeight: 700, color: 'var(--text-3)',
    textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '10px',
  }}>
    {title}
  </div>
);

const OrderBook = ({ symbol }) => {
  const [asks, setAsks] = useState([]);
  const [bids, setBids] = useState([]);
  const [mid,  setMid]  = useState(null);

  useEffect(() => {
    const onPrice = (data) => {
      if (data.symbol !== symbol) return;
      setMid(data.price);
      setAsks(genOrders(data.price, 'ask'));
      setBids(genOrders(data.price, 'bid'));
    };
    socket.on('price', onPrice);
    return () => socket.off('price', onPrice);
  }, [symbol]);

  const maxQty = Math.max(...[...asks, ...bids].map((o) => o.qty), 1);

  const Row = ({ order, side }) => {
    const pct = (order.qty / maxQty) * 100;
    const isAsk = side === 'ask';
    return (
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', padding: '3px 8px', borderRadius: '3px' }}>
        {/* Depth bar */}
        <div style={{
          position: 'absolute', inset: 0,
          [isAsk ? 'right' : 'left']: 0,
          width: `${pct}%`,
          background: isAsk ? 'var(--red-dim)' : 'var(--green-dim)',
          borderRadius: '3px',
        }} />
        <span style={{ fontSize: '12px', fontWeight: 500, color: isAsk ? 'var(--red)' : 'var(--green)', position: 'relative' }}>
          {fmtPrice(order.price)}
        </span>
        <span style={{ fontSize: '12px', color: 'var(--text-2)', position: 'relative' }}>
          {order.qty.toFixed(3)}
        </span>
      </div>
    );
  };

  return (
    <div className="card" style={{ padding: '14px' }}>
      <PanelHeader title="Order Book" />

      {/* Column labels */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 8px', marginBottom: '4px' }}>
        <span style={{ fontSize: '10px', color: 'var(--text-3)' }}>Price</span>
        <span style={{ fontSize: '10px', color: 'var(--text-3)' }}>Qty</span>
      </div>

      {/* Asks */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', marginBottom: '6px' }}>
        {[...asks].reverse().map((o, i) => <Row key={i} order={o} side="ask" />)}
      </div>

      {/* Mid price */}
      <div style={{
        textAlign: 'center', fontSize: '14px', fontWeight: 700,
        color: 'var(--text)', padding: '5px',
        borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
        marginBottom: '6px',
      }}>
        {mid ? `$${fmtPrice(mid)}` : '—'}
      </div>

      {/* Bids */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
        {bids.map((o, i) => <Row key={i} order={o} side="bid" />)}
      </div>
    </div>
  );
};

export default OrderBook;
