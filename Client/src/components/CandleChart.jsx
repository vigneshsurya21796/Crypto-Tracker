import { useEffect, useRef, useState } from 'react';
import { createChart, CandlestickSeries } from 'lightweight-charts';
import socket from '../socket/socket';
import useStore from '../store/useStore';

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const INTERVALS = [
  { label: '1m',  value: '1m'  },
  { label: '5m',  value: '5m'  },
  { label: '15m', value: '15m' },
  { label: '1h',  value: '1h'  },
  { label: '1D',  value: '1d'  },
];

const THEME_OPTIONS = {
  dark:  { bg: '#0c0e16', text: '#6b7694', grid: '#1b1f2e', border: '#1b1f2e' },
  light: { bg: '#ffffff', text: '#5a6480', grid: '#dde1ef', border: '#dde1ef' },
};

// Map interval label → seconds per candle (for live tick binning)
const INTERVAL_SECONDS = { '1m': 60, '5m': 300, '15m': 900, '1h': 3600, '1d': 86400 };

const CandleChart = ({ symbol }) => {
  const containerRef  = useRef(null);
  const chartRef      = useRef(null);
  const seriesRef     = useRef(null);
  const currentCandle = useRef(null);
  const theme         = useStore((s) => s.theme);

  const [interval, setIntervalState] = useState('1m');
  const [loading, setLoading]        = useState(false);

  // Create chart once
  useEffect(() => {
    if (!containerRef.current) return;
    const t = THEME_OPTIONS[theme] ?? THEME_OPTIONS.dark;

    const chart = createChart(containerRef.current, {
      layout:          { background: { color: t.bg }, textColor: t.text },
      grid:            { vertLines: { color: t.grid }, horzLines: { color: t.grid } },
      timeScale:       { timeVisible: true, secondsVisible: false, borderColor: t.border },
      rightPriceScale: { borderColor: t.border },
      width:  containerRef.current.clientWidth,
      height: 340,
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor:         '#17c964',
      downColor:       '#f0324b',
      borderUpColor:   '#17c964',
      borderDownColor: '#f0324b',
      wickUpColor:     '#17c964',
      wickDownColor:   '#f0324b',
    });

    chartRef.current  = chart;
    seriesRef.current = series;

    const ro = new ResizeObserver(() => {
      if (containerRef.current)
        chart.applyOptions({ width: containerRef.current.clientWidth });
    });
    ro.observe(containerRef.current);

    return () => { ro.disconnect(); chart.remove(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-theme on theme change
  useEffect(() => {
    if (!chartRef.current) return;
    const t = THEME_OPTIONS[theme] ?? THEME_OPTIONS.dark;
    chartRef.current.applyOptions({
      layout:          { background: { color: t.bg }, textColor: t.text },
      grid:            { vertLines: { color: t.grid }, horzLines: { color: t.grid } },
      timeScale:       { borderColor: t.border },
      rightPriceScale: { borderColor: t.border },
    });
  }, [theme]);

  // Fetch historical klines when symbol or interval changes
  useEffect(() => {
    if (!seriesRef.current) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      currentCandle.current = null;
      try {
        const res  = await fetch(`${SERVER_URL}/api/prices/klines?symbol=${symbol}&interval=${interval}&limit=500`);
        const data = await res.json();
        if (!cancelled && data.candles?.length) {
          seriesRef.current.setData(data.candles);
          chartRef.current?.timeScale().fitContent();
        }
      } catch {
        // network error — chart stays with live-only ticks
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [symbol, interval]);

  // Live price ticks — aggregate into current candle
  useEffect(() => {
    currentCandle.current = null;
    const periodSec = INTERVAL_SECONDS[interval] ?? 60;

    const onPrice = (data) => {
      if (data.symbol !== symbol) return;
      const price    = data.price;
      const slotTime = Math.floor(Date.now() / 1000 / periodSec) * periodSec;

      if (!currentCandle.current || currentCandle.current.time !== slotTime) {
        currentCandle.current = { time: slotTime, open: price, high: price, low: price, close: price };
      } else {
        const c = currentCandle.current;
        c.high  = Math.max(c.high, price);
        c.low   = Math.min(c.low,  price);
        c.close = price;
      }
      seriesRef.current?.update(currentCandle.current);
    };

    socket.on('price', onPrice);
    return () => socket.off('price', onPrice);
  }, [symbol, interval]);

  return (
    <div className="card" style={{ padding: '14px' }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', gap: '8px', flexWrap: 'wrap' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          {symbol.replace('USDT', '')}/USDT · Candlestick
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Interval tabs */}
          <div style={{ display: 'flex', gap: '2px', background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', padding: '2px' }}>
            {INTERVALS.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setIntervalState(value)}
                style={{
                  fontSize: '11px', fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: '4px',
                  border: 'none', cursor: 'pointer',
                  background:  interval === value ? 'var(--blue)'    : 'transparent',
                  color:       interval === value ? '#fff'           : 'var(--text-2)',
                  transition: 'background 0.12s, color 0.12s',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Live badge */}
          <div style={{
            fontSize: '10px', fontWeight: 600, color: loading ? 'var(--text-3)' : 'var(--green)',
            background: loading ? 'var(--surface-2)' : 'var(--green-dim)',
            borderRadius: '4px', padding: '2px 7px',
          }}>
            {loading ? 'Loading…' : 'LIVE'}
          </div>
        </div>
      </div>

      <div ref={containerRef} />
    </div>
  );
};

export default CandleChart;
