import useStore from '../store/useStore';
import PriceCard from '../components/PriceCard';
import CandleChart from '../components/CandleChart';
import OrderBook from '../components/OrderBook';
import TradeFeed from '../components/TradeFeed';
import Watchlist from '../components/Watchlist';

const SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT'];

const COIN_META = {
  BTCUSDT: { name: 'Bitcoin',  short: 'BTC', color: '#f7931a' },
  ETHUSDT: { name: 'Ethereum', short: 'ETH', color: '#627eea' },
  SOLUSDT: { name: 'Solana',   short: 'SOL', color: '#9945ff' },
  BNBUSDT: { name: 'BNB',      short: 'BNB', color: '#f3ba2f' },
};

const fmt = (n) =>
  n != null
    ? Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '—';

const TickerItem = ({ symbol, active, onClick }) => {
  const data = useStore((s) => s.prices[symbol]);
  const meta = COIN_META[symbol];
  const change = data?.change ?? 0;
  const up = change >= 0;

  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '8px 14px',
        background: active ? 'var(--blue-dim)' : 'transparent',
        border: active ? '1px solid var(--blue)' : '1px solid transparent',
        borderRadius: 'var(--radius)',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'all 0.15s',
      }}
    >
      {/* Coin dot */}
      <span style={{
        width: '8px', height: '8px', borderRadius: '50%',
        background: meta.color, flexShrink: 0,
      }} />

      {/* Coin info */}
      <div style={{ textAlign: 'left' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', lineHeight: 1.2 }}>
          {meta.short}
        </div>
        <div style={{ fontSize: '10px', color: 'var(--text-3)', lineHeight: 1.2 }}>
          {meta.name}
        </div>
      </div>

      {/* Price & change */}
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', lineHeight: 1.2 }}>
          ${fmt(data?.price)}
        </div>
        <div style={{
          fontSize: '10px', lineHeight: 1.2, fontWeight: 500,
          color: up ? 'var(--green)' : 'var(--red)',
        }}>
          {up ? '+' : ''}{Number(change).toFixed(2)}%
        </div>
      </div>
    </button>
  );
};

const Dashboard = () => {
  const { activeSymbol, setActiveSymbol } = useStore();

  return (
    <div style={{ minHeight: 'calc(100vh - 52px)', padding: '12px 16px 20px' }}>

      {/* ── Ticker strip ─────────────────────────────────────────── */}
      <div style={{
        display: 'flex', gap: '6px', overflowX: 'auto',
        marginBottom: '12px', paddingBottom: '2px',
      }}>
        {SYMBOLS.map((s) => (
          <TickerItem
            key={s}
            symbol={s}
            active={activeSymbol === s}
            onClick={() => setActiveSymbol(s)}
          />
        ))}
      </div>

      {/* ── 3-col grid ───────────────────────────────────────────── */}
      <div className="dash-grid">

        {/* Left sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <PriceCard symbol={activeSymbol} meta={COIN_META[activeSymbol]} />
          <Watchlist coinMeta={COIN_META} />
        </div>

        {/* Centre: chart + bottom panels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <CandleChart symbol={activeSymbol} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="xl:hidden">
            <OrderBook symbol={activeSymbol} />
            <TradeFeed symbol={activeSymbol} />
          </div>
        </div>

        {/* Right panel */}
        <div className="dash-right" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <OrderBook symbol={activeSymbol} />
          <TradeFeed symbol={activeSymbol} />
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
